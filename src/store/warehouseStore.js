// Warehouse store: persists the dynamic state per client.
// Backends: localStorage (authoritative local cache) + Supabase (shared mirror).
// State shape per client:
//   { assignments: { [rackId]: productTypeId }, stock: { [skuId]: qty },
//     movements: [ { id, skuId, type, rackId, qty, operator, createdAt } ] }
//
// Load order: localStorage FIRST (always the freshest on this device), then
// Supabase (fresh device / cleared local), then empty. Save writes localStorage
// synchronously and mirrors to Supabase through a SERIALIZED queue so rapid
// successive saves never interleave (the old delete+insert race lost rows).

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const LS_KEY = (clientId) => `norteware:state:${clientId}`;

const EMPTY_STATE = () => ({ assignments: {}, stock: {}, movements: [] });

function lsRead(clientId) {
  try {
    const raw = window.localStorage.getItem(LS_KEY(clientId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STATE(), ...parsed };
  } catch {
    return null;
  }
}

function lsWrite(clientId, state) {
  try {
    window.localStorage.setItem(LS_KEY(clientId), JSON.stringify(state));
  } catch {
    /* ignore quota / privacy errors */
  }
}

function normalizeMovement(row) {
  return {
    id: row.id,
    skuId: row.sku_id,
    type: row.type,
    rackId: row.rack_id,
    qty: row.qty,
    operator: row.operator,
    createdAt: row.created_at,
  };
}

async function supabaseLoad(clientId) {
  const [assignmentsRes, stockRes, movementsRes] = await Promise.all([
    supabase.from('assignments').select('rack_id, product_type_id').eq('client_id', clientId),
    supabase.from('stock').select('sku_id, qty').eq('client_id', clientId),
    supabase.from('movements').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
  ]);
  if (assignmentsRes.error || stockRes.error || movementsRes.error) return null;

  const assignments = {};
  for (const row of assignmentsRes.data) assignments[row.rack_id] = row.product_type_id;
  const stock = {};
  for (const row of stockRes.data) stock[row.sku_id] = row.qty;
  const movements = (movementsRes.data ?? []).map(normalizeMovement);
  return { assignments, stock, movements };
}

export async function loadState(clientId) {
  const local = lsRead(clientId);
  if (local) return local; // authoritative local cache

  if (isSupabaseConfigured) {
    try {
      const remote = await supabaseLoad(clientId);
      if (remote) return remote;
    } catch {
      /* fall through to empty */
    }
  }
  return EMPTY_STATE();
}

// Serialized mirror queue: one full-replace per client at a time, so two saves
// can never interleave (which previously dropped assignments/movements).
let mirrorQueue = Promise.resolve();

function supabaseReplace(clientId, state) {
  const { assignments, stock, movements } = state;

  const assignmentRows = Object.entries(assignments).map(([rack_id, product_type_id]) => ({
    client_id: clientId,
    rack_id,
    product_type_id,
  }));
  const stockRows = Object.entries(stock).map(([sku_id, qty]) => ({
    client_id: clientId,
    sku_id,
    qty,
  }));
  const movementRows = movements.map((movement) => ({
    client_id: clientId,
    sku_id: movement.skuId,
    type: movement.type,
    rack_id: movement.rackId,
    qty: movement.qty,
    operator: movement.operator ?? null,
    created_at: movement.createdAt,
  }));

  return (async () => {
    await supabase.from('assignments').delete().eq('client_id', clientId);
    if (assignmentRows.length) await supabase.from('assignments').insert(assignmentRows);

    await supabase.from('stock').delete().eq('client_id', clientId);
    if (stockRows.length) await supabase.from('stock').insert(stockRows);

    await supabase.from('movements').delete().eq('client_id', clientId);
    if (movementRows.length) await supabase.from('movements').insert(movementRows);
  })();
}

export function saveState(clientId, state) {
  lsWrite(clientId, state); // synchronous, authoritative

  if (!isSupabaseConfigured) return Promise.resolve();

  mirrorQueue = mirrorQueue
    .then(() => supabaseReplace(clientId, state))
    .catch((error) => {
      // Best-effort mirror: the local state is already committed, so a Supabase
      // failure never blocks or corrupts the demo.
      console.error('Supabase mirror failed (kept locally):', error);
    });
  return mirrorQueue;
}
