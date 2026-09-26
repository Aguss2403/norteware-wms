// Seeded per-client warehouse layouts (spec: Per-client grid layouts).
//
// Compact grid legend: D dock, R rack, # wall, . path.
// Wall/dock placement is LOCKED here (design open question, resolved): the
// build-time validation (scripts/validate-seeds.mjs) asserts the fixed
// auto-assign result for the citrus layout, so these grids are part of the
// stable contract. The wall pockets also exercise the no-route BFS case.
//
// Assigned product types per client:
//   citrus    -> PT-CITRICO, PT-ENVASE   (free racks: nearest to dock is 2-6)
//   azucar    -> PT-AZUCAR               (free racks: nearest to dock is 3-2)
//   mayorista -> PT-ENVASE               (free racks: nearest to dock is 2-2)

import { buildLayout } from '../domain/model.js';

const rawLayouts = [
  {
    clientId: 'citrus',
    rows: 6,
    cols: 8,
    receptionId: '0-0',
    dispatchId: '5-7',
    grid: ['D.......', '......RR', '......RR', '..###...', '..#RR#..', '...RRR#D'],
    racks: {
      '1-6': { productTypeId: 'PT-CITRICO' },
      '1-7': { productTypeId: 'PT-CITRICO' },
      '4-3': { productTypeId: 'PT-ENVASE' },
      '4-4': { productTypeId: 'PT-ENVASE' },
    },
  },
  {
    clientId: 'azucar',
    rows: 5,
    cols: 8,
    receptionId: '4-0',
    dispatchId: '4-7',
    grid: ['........', '..RRRR..', '........', '##RRRR##', 'D......D'],
    racks: {
      '1-2': { productTypeId: 'PT-AZUCAR' },
      '1-3': { productTypeId: 'PT-AZUCAR' },
      '1-4': { productTypeId: 'PT-AZUCAR' },
      '1-5': { productTypeId: 'PT-AZUCAR' },
    },
  },
  {
    clientId: 'mayorista',
    rows: 7,
    cols: 7,
    receptionId: '6-0',
    dispatchId: '6-6',
    grid: ['.......', 'RRR...R', 'RRR...R', '###...#', '.......', '.......', 'D.....D'],
    racks: {
      '1-0': { productTypeId: 'PT-ENVASE' },
      '1-1': { productTypeId: 'PT-ENVASE' },
      '1-2': { productTypeId: 'PT-ENVASE' },
    },
  },
];

export const layouts = rawLayouts.map(buildLayout);
