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
    routeGeometry: {
      rowY: [270, 250, 250, 390, 470, 520],
      columnX: [132, 220, 310, 400, 490, 530, 900, 1040],
    },
    routeLanes: [
      { id: 'citrus-main', label: 'CORREDOR PRINCIPAL', orientation: 'horizontal', x1: 90, y: 310, x2: 1110 },
      { id: 'citrus-lower', label: 'CORREDOR DE DESPACHO', orientation: 'horizontal', x1: 90, y: 520, x2: 910 },
      { id: 'citrus-west', label: 'EJE DE RECEPCIÓN', orientation: 'vertical', x: 132, y1: 270, y2: 520 },
      { id: 'citrus-east', label: 'EJE DE EXPEDICIÓN', orientation: 'vertical', x: 900, y1: 270, y2: 520 },
    ],
    rack: COMMON_RACK,
    rackBanks: [
      { id: 'citrus-bulk', label: 'BAHÍA A-01', aisleLabel: 'PASILLO A-01', x: 274, y: 144, width: 246, height: 80, rows: 1, columns: 4, orientation: 'horizontal', accessSide: 'bottom', accessSides: ['bottom'], accessGap: 10, accessAnchor: 'slot-edge' },
      { id: 'citrus-main', label: 'BAHÍA A-02', aisleLabel: 'PASILLO A-02', x: 582, y: 144, width: 246, height: 80, rows: 1, columns: 5, orientation: 'horizontal', accessSide: 'bottom', accessSides: ['bottom'], accessGap: 10, accessAnchor: 'slot-edge' },
    ],
    aisles: [
      { id: 'citrus-west', label: 'PASILLO A-01', x: 274, y: 242, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'citrus-center', label: 'PASILLO A-02', x: 582, y: 242, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'citrus-east', label: 'PASILLO A-03', x: 882, y: 242, width: 248, height: 16, orientation: 'horizontal' },
      { id: 'citrus-south', label: 'PASILLO A-04', x: 890, y: 270, width: 20, height: 250, orientation: 'vertical' },
    ],
    docks: [
      { id: 'receiving-dock', locationId: '0-0', label: 'RECEPCIÓN', labelDx: 24, labelDy: -28, x: 132, y: 176, entrance: { x: 132, y: 270 } },
      { id: 'dispatch-dock', locationId: '5-7', label: 'DESPACHO', labelDx: -84, labelDy: 30, x: 1040, y: 566, entrance: { x: 1040, y: 520 } },
    ],
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
    routeGeometry: {
      rowY: [110, 250, 330, 250, 520],
      columnX: [132, 220, 310, 400, 490, 580, 900, 1040],
    },
    routeLanes: [
      { id: 'sugar-upper', label: 'CORREDOR SUPERIOR', orientation: 'horizontal', x1: 90, y: 260, x2: 1110 },
      { id: 'sugar-middle', label: 'CORREDOR CENTRAL', orientation: 'horizontal', x1: 90, y: 400, x2: 1110 },
      { id: 'sugar-lower', label: 'CORREDOR DE DESPACHO', orientation: 'horizontal', x1: 90, y: 520, x2: 1110 },
      { id: 'sugar-west', label: 'EJE DE RECEPCIÓN', orientation: 'vertical', x: 132, y1: 260, y2: 520 },
      { id: 'sugar-east', label: 'EJE DE EXPEDICIÓN', orientation: 'vertical', x: 900, y1: 260, y2: 520 },
    ],
    rack: COMMON_RACK,
    rackBanks: [
      { id: 'sugar-bulk', label: 'BAHÍA B-01', aisleLabel: 'PASILLO B-01', x: 290, y: 144, width: 268, height: 80, rows: 1, columns: 4, orientation: 'horizontal', accessSide: 'bottom', accessSides: ['bottom'], accessGap: 10, accessAnchor: 'slot-edge' },
      { id: 'sugar-main', label: 'BAHÍA B-02', aisleLabel: 'PASILLO B-02', x: 618, y: 144, width: 254, height: 80, rows: 1, columns: 4, orientation: 'horizontal', accessSide: 'bottom', accessSides: ['bottom'], accessGap: 10, accessAnchor: 'slot-edge' },
    ],
    aisles: [
      { id: 'sugar-north', label: 'PASILLO B-01', x: 290, y: 242, width: 268, height: 16, orientation: 'horizontal' },
      { id: 'sugar-main', label: 'PASILLO B-02', x: 618, y: 242, width: 254, height: 16, orientation: 'horizontal' },
      { id: 'sugar-south', label: 'PASILLO B-03', x: 352, y: 392, width: 30, height: 148, orientation: 'vertical' },
      { id: 'sugar-pick', label: 'PASILLO B-04', x: 716, y: 392, width: 30, height: 148, orientation: 'vertical' },
    ],
    docks: [
      { id: 'receiving-dock', locationId: '4-0', label: 'RECEPCIÓN', labelDx: 24, labelDy: 30, x: 132, y: 566, entrance: { x: 132, y: 520 } },
      { id: 'dispatch-dock', locationId: '4-7', label: 'DESPACHO', labelDx: -84, labelDy: 30, x: 1040, y: 566, entrance: { x: 1040, y: 520 } },
    ],
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
    routeGeometry: {
      rowY: [110, 250, 250, 390, 470, 520, 570],
      columnX: [132, 220, 300, 560, 700, 820, 900],
    },
    routeLanes: [
      { id: 'wholesale-upper', label: 'CORREDOR SUPERIOR', orientation: 'horizontal', x1: 90, y: 270, x2: 1110 },
      { id: 'wholesale-middle', label: 'CORREDOR CENTRAL', orientation: 'horizontal', x1: 90, y: 390, x2: 1110 },
      { id: 'wholesale-lower', label: 'CORREDOR DE DESPACHO', orientation: 'horizontal', x1: 90, y: 520, x2: 1110 },
      { id: 'wholesale-west', label: 'EJE DE RECEPCIÓN', orientation: 'vertical', x: 132, y1: 270, y2: 570 },
      { id: 'wholesale-east', label: 'EJE DE EXPEDICIÓN', orientation: 'vertical', x: 900, y1: 270, y2: 570 },
    ],
    rack: COMMON_RACK,
    rackBanks: [
      { id: 'wholesale-bulk', label: 'BAHÍA C-01', aisleLabel: 'PASILLO C-01', x: 306, y: 144, width: 246, height: 80, rows: 1, columns: 4, orientation: 'horizontal', accessSide: 'bottom', accessSides: ['bottom'], accessGap: 10, accessAnchor: 'slot-edge' },
      { id: 'wholesale-main', label: 'BAHÍA C-02', aisleLabel: 'PASILLO C-02', x: 608, y: 144, width: 246, height: 80, rows: 1, columns: 4, orientation: 'horizontal', accessSide: 'bottom', accessSides: ['bottom'], accessGap: 10, accessAnchor: 'slot-edge' },
    ],
    aisles: [
      { id: 'wholesale-pick', label: 'PASILLO C-01', x: 90, y: 242, width: 154, height: 30, orientation: 'horizontal' },
      { id: 'wholesale-north', label: 'PASILLO C-02', x: 306, y: 242, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'wholesale-east', label: 'PASILLO C-03', x: 608, y: 242, width: 246, height: 16, orientation: 'horizontal' },
      { id: 'wholesale-south', label: 'PASILLO C-04', x: 890, y: 270, width: 30, height: 300, orientation: 'vertical' },
    ],
    docks: [
      { id: 'receiving-dock', locationId: '6-0', label: 'RECEPCIÓN', labelDx: 24, labelDy: 30, x: 132, y: 616, entrance: { x: 132, y: 570 } },
      { id: 'dispatch-dock', locationId: '6-6', label: 'DESPACHO', labelDx: 24, labelDy: 30, x: 900, y: 616, entrance: { x: 900, y: 570 } },
    ],
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
