// Hybrid dashboard data module (design D4, spec: dashboard-overview).
//
// Real values: rack occupancy (live layout), SKUs in stock (dynamic stock),
// and the movements table (dynamic movement log). Orders and picking time are
// MOCK (no orders module yet) and labeled as such in the code.
//
// STRICT BOUNDARY: this module imports seeds (skus for names) only. It is
// never imported by scripts/validate-seeds.mjs or any src/domain module, and
// never mutates seeds, layouts, or routing contracts.

import { skus } from './skus.js';

// --- MOCK constants (clearly separated from real derived values below).
// Orders/picking are fixed demo figures until an orders module exists.
const MOCK = {
  orders: {
    value: '38',
    badge: { text: '+12%', tone: 'up' },
    sub: '26 despachadas · 12 en preparación',
  },
  picking: {
    value: '2m 14s',
    badge: { text: '-8%', tone: 'up' },
    sub: 'Ruta óptima vs. manual',
  },
};

// Display name for a product type, derived from the first seeded SKU that uses
// it (seeds carry SKU names, not a separate product-type catalog).
function productNameFor(productTypeId) {
  const sku = skus.find((candidate) => candidate.productTypeId === productTypeId);
  return sku?.name ?? productTypeId;
}

function skuName(skuId) {
  return skus.find((candidate) => candidate.skuId === skuId)?.name ?? skuId;
}

// Deterministic occupancy badge: real level -> warning-tone text.
function occupancyBadge(pct) {
  const text = pct >= 75 ? 'Alta' : pct >= 40 ? 'Media' : 'Baja';
  return { text, tone: 'warn' };
}

function timeLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Real movement log -> table rows (movements are already newest-first).
function buildMovements(movements) {
  return movements.map((movement) => ({
    skuId: movement.skuId,
    productName: skuName(movement.skuId),
    location: movement.rackId ?? '—',
    type: movement.type,
    time: timeLabel(movement.createdAt),
  }));
}

// Single entry point: builds the whole dashboard payload for one client.
//   buildDashboardData({ client, layout, stock, movements })
//   -> { kpis, racks, movements }
// `client` is accepted for signature completeness; real values derive from the
// active client's live layout and the dynamic state (client switch re-renders).
export function buildDashboardData({ client, layout, stock = {}, movements = [] }) {
  const racks = layout.locations.filter((location) => location.type === 'rack');
  const assignedRacks = racks.filter((rack) => rack.productTypeId);
  const occupancyPct = racks.length > 0 ? Math.round((assignedRacks.length / racks.length) * 100) : 0;

  // Real: racks with productTypeId / total racks (design D4 pct = 100/0).
  const rackRows = racks.map((rack) => ({
    rackId: rack.locationId,
    status: rack.productTypeId ? 'occupied' : 'free',
    productTypeId: rack.productTypeId || undefined,
    productName: rack.productTypeId ? productNameFor(rack.productTypeId) : undefined,
    pct: rack.productTypeId ? 100 : 0,
  }));

  // Real: seeded SKUs with units on hand (dynamic stock).
  const inStockSkus = skus.filter((sku) => (stock[sku.skuId] ?? 0) > 0);

  const kpis = [
    { id: 'orders', label: 'Órdenes hoy', ...MOCK.orders },
    {
      id: 'occupancy',
      label: 'Ocupación de racks',
      badge: occupancyBadge(occupancyPct),
      value: `${occupancyPct}%`,
      sub: `${assignedRacks.length} de ${racks.length} ubicaciones ocupadas`,
    },
    {
      id: 'skus',
      label: 'SKUs en stock',
      value: String(inStockSkus.length),
      sub: `de ${skus.length} SKUs del catálogo`,
    },
    { id: 'picking', label: 'Tiempo prom. picking', ...MOCK.picking },
  ];

  return { kpis, racks: rackRows, movements: buildMovements(movements) };
}
