// Hybrid dashboard data module (design D4, spec: dashboard-overview).
//
// Real KPIs come from the seeded catalog: rack occupancy (racks with a
// productTypeId / total racks of the active client's layout) and active SKUs
// (seeded SKUs whose product type is stored in that layout). Orders, picking
// time, and movement rows are MOCK (no inventory/traceability module yet)
// but reuse seeded SKU ids, SKU names, and the active client's rack ids so
// the demo stays coherent (e.g. SKU-001 -> 2-6 on citrus).
//
// STRICT BOUNDARY: this module imports seeds only (skus for names). It is
// never imported by scripts/validate-seeds.mjs or any src/domain module, and
// it never mutates seeds, layouts, or routing contracts.

import { skus } from './skus.js';

// --- MOCK constants (clearly separated from the real derived values below).
// Orders/picking values are fixed demo figures until an inventory module
// exists; movement rows resolve their location against the active layout.
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
  skuBadge: { text: '+3', tone: 'up' },
  movementRows: [
    { skuId: 'SKU-001', type: 'ingreso', time: '09:42' },
    { skuId: 'SKU-002', type: 'egreso', time: '09:31' },
    { skuId: 'SKU-006', type: 'ingreso', time: '09:15' },
    { skuId: 'SKU-008', type: 'egreso', time: '08:58' },
  ],
};

// Display name for a product type, derived from the first seeded SKU that
// uses it (seeds carry SKU names, not a separate product-type catalog).
function productNameFor(productTypeId) {
  const sku = skus.find((candidate) => candidate.productTypeId === productTypeId);
  return sku?.name ?? productTypeId;
}

// Deterministic occupancy badge: real level -> warning-tone text (warn).
function occupancyBadge(pct) {
  const text = pct >= 75 ? 'Alta' : pct >= 40 ? 'Media' : 'Baja';
  return { text, tone: 'warn' };
}

// Movement rows (mock, labeled above): each seeded SKU resolves to a rack the
// active client actually has — its product type's first assigned rack, or the
// first free rack for unassigned types (the inbound auto-assign pattern, e.g.
// SKU-001 -> 2-6 on citrus). Used free racks are not repeated within the list.
function buildMovements(layout, racks) {
  const assignedOfType = (productTypeId) =>
    racks.find((rack) => rack.productTypeId === productTypeId)?.locationId ?? null;

  const usedFreeRacks = new Set();
  const freeRackFor = () => {
    const free = racks.find((rack) => !rack.productTypeId && !usedFreeRacks.has(rack.locationId));
    if (!free) return null;
    usedFreeRacks.add(free.locationId);
    return free.locationId;
  };

  return MOCK.movementRows.map((row) => {
    const sku = skus.find((candidate) => candidate.skuId === row.skuId);
    const productTypeId = sku?.productTypeId;
    const location = productTypeId ? assignedOfType(productTypeId) ?? freeRackFor() : freeRackFor();
    return {
      skuId: row.skuId,
      productName: sku?.name ?? row.skuId,
      location: location ?? '—',
      type: row.type,
      time: row.time,
    };
  });
}

// Single entry point: builds the whole dashboard payload for one client.
//   buildDashboardData({ client, layout }) -> { kpis, racks, movements }
// `client` is accepted for signature completeness; all real values derive
// from the active client's layout (client switch re-renders the Dashboard).
export function buildDashboardData({ client, layout }) {
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

  // Real: seeded SKUs whose product type is stored by this client layout.
  const storedTypes = new Set(assignedRacks.map((rack) => rack.productTypeId));
  const activeSkus = skus.filter((sku) => storedTypes.has(sku.productTypeId));
  const unassignedSkus = skus.length - activeSkus.length;

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
      label: 'SKUs activos',
      badge: MOCK.skuBadge,
      value: String(activeSkus.length),
      sub: `${unassignedSkus} sin ubicación asignada`,
    },
    { id: 'picking', label: 'Tiempo prom. picking', ...MOCK.picking },
  ];

  return { kpis, racks: rackRows, movements: buildMovements(layout, racks) };
}