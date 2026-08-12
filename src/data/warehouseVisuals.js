// Presentation-only floorplan profiles. Logical locations and routing remain
// owned by the seeded layouts and the domain model.

const SHARED_GRID = { x: 104, y: 154, width: 992, height: 386 };

const COMMON_RACK = {
  label: 'ESTANTE',
  shelfLines: 3,
  assignedLabel: 'ASIGNADO',
  freeLabel: 'LIBRE',
};

export const warehouseVisuals = {
  citrus: {
    viewBox: '0 0 1200 680',
    logicalGrid: SHARED_GRID,
    zones: [
      { id: 'receiving', label: 'RECEPCIÓN', x: 36, y: 94, width: 198, height: 164, tone: 'green' },
      { id: 'bulk-storage', label: 'ALMACENAMIENTO A GRANEL', x: 258, y: 92, width: 278, height: 164, tone: 'amber' },
      { id: 'main-racking', label: 'RACK PRINCIPAL', x: 560, y: 92, width: 288, height: 164, tone: 'green' },
      { id: 'fast-picking', label: 'PICKING RÁPIDO', x: 872, y: 92, width: 290, height: 164, tone: 'amber' },
      { id: 'quality-control', label: 'CONTROL DE CALIDAD', x: 54, y: 444, width: 318, height: 156, tone: 'amber' },
      { id: 'dispatch', label: 'DESPACHO', x: 854, y: 444, width: 308, height: 156, tone: 'green' },
    ],
    rack: COMMON_RACK,
    rackBanks: [
      { id: 'citrus-bulk', label: 'BAHÍA A-01', aisleLabel: 'PASILLO A-01', x: 274, y: 144, width: 246, height: 80, rows: 1, columns: 4, orientation: 'horizontal' },
      { id: 'citrus-main', label: 'BAHÍA A-02', aisleLabel: 'PASILLO A-02', x: 582, y: 144, width: 246, height: 80, rows: 1, columns: 5, orientation: 'horizontal' },
    ],
    aisles: [
      { id: 'citrus-west', label: 'PASILLO A-01', x: 274, y: 232, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'citrus-center', label: 'PASILLO A-02', x: 582, y: 232, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'citrus-east', label: 'PASILLO A-03', x: 882, y: 232, width: 248, height: 16, orientation: 'horizontal' },
      { id: 'citrus-south', label: 'PASILLO A-04', x: 742, y: 328, width: 30, height: 174, orientation: 'vertical' },
    ],
    docks: [{ id: 'receiving-dock', label: 'MUELLE', labelDx: 24, labelDy: -28, x: 132, y: 176 }],
    doors: [
      { id: 'citrus-inbound', label: 'PUERTA', x: 46, y: 286, width: 78, height: 18, side: 'west' },
      { id: 'citrus-outbound', label: 'PUERTA', x: 1004, y: 606, width: 78, height: 18, side: 'east' },
    ],
    cues: [
      { kind: 'truck', label: 'CAMIÓN', x: 82, y: 346, ariaLabel: 'Silueta de camión en recepción' },
      { kind: 'pallet', label: 'PALET', x: 414, y: 342, ariaLabel: 'Palet de carga en almacenamiento' },
      { kind: 'forklift', label: 'CARRETILLA', x: 790, y: 378, ariaLabel: 'Carretilla elevadora en circulación' },
      { kind: 'scanner', label: 'ESCÁNER', x: 688, y: 574, ariaLabel: 'Terminal de escáner en control' },
    ],
  },

  azucar: {
    viewBox: '0 0 1200 680',
    logicalGrid: SHARED_GRID,
    zones: [
      { id: 'receiving', label: 'RECEPCIÓN', x: 36, y: 444, width: 222, height: 156, tone: 'green' },
      { id: 'bulk-storage', label: 'ALMACENAMIENTO A GRANEL', x: 276, y: 92, width: 300, height: 164, tone: 'amber' },
      { id: 'main-racking', label: 'RACK PRINCIPAL', x: 604, y: 92, width: 282, height: 164, tone: 'green' },
      { id: 'fast-picking', label: 'PICKING RÁPIDO', x: 420, y: 444, width: 300, height: 156, tone: 'green' },
      { id: 'quality-control', label: 'CONTROL DE CALIDAD', x: 54, y: 92, width: 196, height: 164, tone: 'amber' },
      { id: 'dispatch', label: 'DESPACHO', x: 906, y: 444, width: 256, height: 156, tone: 'green' },
    ],
    rack: COMMON_RACK,
    rackBanks: [
      { id: 'sugar-bulk', label: 'BAHÍA B-01', aisleLabel: 'PASILLO B-01', x: 290, y: 144, width: 268, height: 80, rows: 1, columns: 4, orientation: 'horizontal' },
      { id: 'sugar-main', label: 'BAHÍA B-02', aisleLabel: 'PASILLO B-02', x: 618, y: 144, width: 254, height: 80, rows: 1, columns: 4, orientation: 'horizontal' },
    ],
    aisles: [
      { id: 'sugar-north', label: 'PASILLO B-01', x: 290, y: 232, width: 268, height: 16, orientation: 'horizontal' },
      { id: 'sugar-main', label: 'PASILLO B-02', x: 618, y: 232, width: 254, height: 16, orientation: 'horizontal' },
      { id: 'sugar-south', label: 'PASILLO B-03', x: 352, y: 376, width: 30, height: 160, orientation: 'vertical' },
      { id: 'sugar-pick', label: 'PASILLO B-04', x: 716, y: 376, width: 30, height: 160, orientation: 'vertical' },
    ],
    docks: [{ id: 'loading-dock', label: 'MUELLE', labelDx: 24, labelDy: 30, x: 132, y: 524 }],
    doors: [
      { id: 'sugar-inbound', label: 'PUERTA', x: 46, y: 606, width: 78, height: 18, side: 'west' },
      { id: 'sugar-outbound', label: 'PUERTA', x: 1004, y: 286, width: 78, height: 18, side: 'east' },
    ],
    cues: [
      { kind: 'truck', label: 'CAMIÓN', x: 82, y: 350, ariaLabel: 'Silueta de camión junto al muelle' },
      { kind: 'pallet', label: 'PALET', x: 310, y: 342, ariaLabel: 'Palet de azúcar en almacenamiento' },
      { kind: 'forklift', label: 'CARRETILLA', x: 786, y: 362, ariaLabel: 'Carretilla elevadora entre racks' },
      { kind: 'scanner', label: 'ESCÁNER', x: 806, y: 574, ariaLabel: 'Terminal de escáner en picking' },
    ],
  },

  mayorista: {
    viewBox: '0 0 1200 680',
    logicalGrid: SHARED_GRID,
    zones: [
      { id: 'receiving', label: 'RECEPCIÓN', x: 36, y: 444, width: 230, height: 156, tone: 'green' },
      { id: 'bulk-storage', label: 'ALMACENAMIENTO A GRANEL', x: 292, y: 92, width: 274, height: 164, tone: 'amber' },
      { id: 'main-racking', label: 'RACK PRINCIPAL', x: 594, y: 92, width: 274, height: 164, tone: 'green' },
      { id: 'fast-picking', label: 'PICKING RÁPIDO', x: 42, y: 92, width: 224, height: 280, tone: 'green' },
      { id: 'quality-control', label: 'CONTROL DE CALIDAD', x: 292, y: 444, width: 300, height: 156, tone: 'amber' },
      { id: 'dispatch', label: 'DESPACHO', x: 896, y: 444, width: 266, height: 156, tone: 'green' },
    ],
    rack: COMMON_RACK,
    rackBanks: [
      { id: 'wholesale-bulk', label: 'BAHÍA C-01', aisleLabel: 'PASILLO C-01', x: 306, y: 144, width: 246, height: 80, rows: 1, columns: 4, orientation: 'horizontal' },
      { id: 'wholesale-main', label: 'BAHÍA C-02', aisleLabel: 'PASILLO C-02', x: 608, y: 144, width: 246, height: 80, rows: 1, columns: 4, orientation: 'horizontal' },
    ],
    aisles: [
      { id: 'wholesale-pick', label: 'PASILLO C-01', x: 90, y: 218, width: 154, height: 30, orientation: 'horizontal' },
      { id: 'wholesale-north', label: 'PASILLO C-02', x: 306, y: 232, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'wholesale-east', label: 'PASILLO C-03', x: 608, y: 232, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'wholesale-south', label: 'PASILLO C-04', x: 760, y: 364, width: 30, height: 172, orientation: 'vertical' },
    ],
    docks: [{ id: 'dispatch-dock', label: 'MUELLE', labelDx: 24, labelDy: 30, x: 132, y: 524 }],
    doors: [
      { id: 'wholesale-inbound', label: 'PUERTA', x: 46, y: 606, width: 78, height: 18, side: 'west' },
      { id: 'wholesale-outbound', label: 'PUERTA', x: 1004, y: 286, width: 78, height: 18, side: 'east' },
    ],
    cues: [
      { kind: 'truck', label: 'CAMIÓN', x: 82, y: 350, ariaLabel: 'Silueta de camión en recepción' },
      { kind: 'pallet', label: 'PALET', x: 346, y: 342, ariaLabel: 'Palet en control de calidad' },
      { kind: 'forklift', label: 'CARRETILLA', x: 810, y: 358, ariaLabel: 'Carretilla elevadora en rack principal' },
      { kind: 'scanner', label: 'ESCÁNER', x: 672, y: 574, ariaLabel: 'Terminal de escáner en despacho' },
    ],
  },
};
