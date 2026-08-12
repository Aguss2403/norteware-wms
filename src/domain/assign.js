// Auto-assign: pick the nearest free rack for an inbound product type (design D2).
//
// findNearestFreeRack(layout, productTypeId) -> rack location | null
// - Candidates are FREE racks only (productTypeId empty); racks already
//   holding a product type are skipped ("full").
// - `productTypeId` is kept in the signature for interface stability with the
//   design (the inbound flow only calls this when the type is unassigned);
//   rack reservation semantics by type land with the inbound flow.
// - Candidates are scored by BFS distance from the dock and sorted by
//   (distance asc, row asc, col asc) for deterministic output.
// - Returns null when there is no free rack or none is reachable.

import { findRoute } from './bfs.js';
import { isFreeRack } from './model.js';

export function findNearestFreeRack(layout, productTypeId) {
  const freeRacks = layout.locations.filter(isFreeRack);
  if (freeRacks.length === 0) return null;

  const scored = freeRacks.map((rack) => {
    const route = findRoute(layout, layout.dockId, rack.locationId);
    return { rack, distance: route.path.length > 0 ? route.distance : Infinity };
  });

  const reachable = scored.filter((entry) => Number.isFinite(entry.distance));
  if (reachable.length === 0) return null;

  reachable.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (a.rack.row !== b.rack.row) return a.rack.row - b.rack.row;
    return a.rack.col - b.rack.col;
  });

  return reachable[0].rack;
}
