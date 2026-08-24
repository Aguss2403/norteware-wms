// Seeded SKUs (~8) mixing assigned and unassigned product types (spec: Seeded data).
// Assigned types have at least one rack holding them in layouts.js.
// Unassigned types (PT-JUGO, PT-ALIMENTO) have no rack -> inbound auto-assigns.
//
// Perishable SKUs (citrus, juice, food) carry a `lot` and a `shelfLifeDays` so
// the inventory can show batch + expiry (and flag "próximo a vencer"). Sugar
// carries a lot (long shelf life); packaging has neither.

export const skus = [
  { skuId: 'SKU-001', name: 'Jugo de naranja', productTypeId: 'PT-JUGO', lot: 'L-001', shelfLifeDays: 60 },
  { skuId: 'SKU-002', name: 'Naranja fresca', productTypeId: 'PT-CITRICO', lot: 'L-002', shelfLifeDays: 15 },
  { skuId: 'SKU-003', name: 'Limón fresco', productTypeId: 'PT-CITRICO', lot: 'L-003', shelfLifeDays: 15 },
  { skuId: 'SKU-004', name: 'Azúcar refinada', productTypeId: 'PT-AZUCAR', lot: 'L-004' },
  { skuId: 'SKU-005', name: 'Azúcar morena', productTypeId: 'PT-AZUCAR', lot: 'L-005' },
  { skuId: 'SKU-006', name: 'Botella PET 1L', productTypeId: 'PT-ENVASE' },
  { skuId: 'SKU-007', name: 'Caja de cartón corrugado', productTypeId: 'PT-ENVASE' },
  { skuId: 'SKU-008', name: 'Salsa de tomate', productTypeId: 'PT-ALIMENTO', lot: 'L-006', shelfLifeDays: 180 },
];

// Days before expiry that count as "próximo a vencer" (inventory warning).
export const NEAR_EXPIRY_DAYS = 20;
