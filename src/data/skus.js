// Seeded SKUs (~8) mixing assigned and unassigned product types (spec: Seeded data).
// Assigned types have at least one rack holding them in layouts.js.
// Unassigned types (PT-JUGO, PT-ALIMENTO) have no rack -> inbound auto-assigns.

export const skus = [
  { skuId: 'SKU-001', name: 'Jugo de naranja', productTypeId: 'PT-JUGO' },
  { skuId: 'SKU-002', name: 'Naranja fresca', productTypeId: 'PT-CITRICO' },
  { skuId: 'SKU-003', name: 'Limón fresco', productTypeId: 'PT-CITRICO' },
  { skuId: 'SKU-004', name: 'Azúcar refinada', productTypeId: 'PT-AZUCAR' },
  { skuId: 'SKU-005', name: 'Azúcar morena', productTypeId: 'PT-AZUCAR' },
  { skuId: 'SKU-006', name: 'Botella PET 1L', productTypeId: 'PT-ENVASE' },
  { skuId: 'SKU-007', name: 'Caja de cartón corrugado', productTypeId: 'PT-ENVASE' },
  { skuId: 'SKU-008', name: 'Salsa de tomate', productTypeId: 'PT-ALIMENTO' },
];
