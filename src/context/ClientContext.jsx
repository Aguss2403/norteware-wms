// Active client + dynamic warehouse state (design D5, Phase 3).
//
// Holds the active client, the LIVE layout (seeds + auto-assignments layered
// on top), and the persisted dynamic state (assignments, stock, movements),
// loaded from the store (Supabase/localStorage). Actions recordInbound /
// recordOrderOutbound mutate the state and persist it. The pure domain functions
// (bfs/assign/inbound/outbound) keep operating on the live layout, so they
// see auto-assigned racks as occupied without any rewrite.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clients } from '../data/clients.js';
import { layouts } from '../data/layouts.js';
import { applyAssignments } from '../domain/warehouseState.js';
import { loadState, saveState } from '../store/warehouseStore.js';

const ClientContext = createContext(null);

function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function newMovement({ skuId, type, rackId, qty = 1, operator = null }) {
  return {
    id: generateId(),
    skuId,
    type,
    rackId,
    qty,
    operator,
    createdAt: new Date().toISOString(),
  };
}

export function ClientProvider({ children }) {
  const [activeClientId, setActiveClientId] = useState(clients[0].clientId);
  const [assignments, setAssignments] = useState({});
  const [stock, setStock] = useState({});
  const [movements, setMovements] = useState([]);
  const [ready, setReady] = useState(false);

  const client = clients.find((candidate) => candidate.clientId === activeClientId) ?? clients[0];
  const seedLayout = layouts.find((candidate) => candidate.clientId === client.clientId);

  // Live layout: seeds + dynamic auto-assignments. A new object only when the
  // assignments change, so the map/BFS/assign re-derive correctly.
  const layout = useMemo(() => applyAssignments(seedLayout, assignments), [seedLayout, assignments]);

  // Load the persisted state when the active client changes. Clear first so a
  // client switch never leaks the previous client's data onto the new layout.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setAssignments({});
    setStock({});
    setMovements([]);

    loadState(client.clientId)
      .then((state) => {
        if (cancelled) return;
        setAssignments(state.assignments ?? {});
        setStock(state.stock ?? {});
        setMovements(state.movements ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setAssignments({});
        setStock({});
        setMovements([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [client.clientId]);

  // Persist whenever the loaded state changes (fire-and-forget; localStorage
  // is committed synchronously inside saveState so a Supabase failure is safe).
  useEffect(() => {
    if (!ready) return;
    saveState(client.clientId, { assignments, stock, movements }).catch(() => {});
  }, [assignments, stock, movements, ready, client.clientId]);

  const recordInbound = useCallback((sku, rackId, qty = 1, operator = null) => {
    const type = sku.productTypeId;
    setAssignments((prev) => (prev[rackId] === type ? prev : { ...prev, [rackId]: type }));
    setStock((prev) => ({ ...prev, [sku.skuId]: (prev[sku.skuId] ?? 0) + qty }));
    setMovements((prev) => [
      newMovement({ skuId: sku.skuId, type: 'ingreso', rackId, qty, operator }),
      ...prev,
    ]);
  }, []);

  const recordOrderOutbound = useCallback((pickedLines, operator = null) => {
    setStock((prev) => {
      const next = { ...prev };
      for (const { sku, qty } of pickedLines) {
        const remaining = (prev[sku.skuId] ?? 0) - qty;
        if (remaining <= 0) delete next[sku.skuId];
        else next[sku.skuId] = remaining;
      }
      return next;
    });
    setMovements((prev) => [
      ...pickedLines.map(({ sku, rackId, qty }) =>
        newMovement({ skuId: sku.skuId, type: 'egreso', rackId, qty, operator })
      ),
      ...prev,
    ]);
  }, []);

  const switchClient = useCallback((clientId) => setActiveClientId(clientId), []);

  const value = useMemo(
    () => ({
      clients,
      client,
      layout,
      activeClientId,
      switchClient,
      assignments,
      stock,
      movements,
      ready,
      recordInbound,
      recordOrderOutbound,
    }),
    [
      clients,
      client,
      layout,
      activeClientId,
      switchClient,
      assignments,
      stock,
      movements,
      ready,
      recordInbound,
      recordOrderOutbound,
    ]
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
