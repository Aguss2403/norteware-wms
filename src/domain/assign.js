// Auto-assign: pick the nearest free rack for an inbound product type (design D2).
//
// findNearestFreeRack(layout, productTypeId) -> rack location | null
// findNearestRackOfType(layout, productTypeId) -> rack location | null
//
// - findNearestFreeRack candidates are FREE racks only (productTypeId empty);
//   racks already holding a product type are skipped ("full").
// - findNearestRackOfType candidates are racks already holding the product
//   type (the assigned-route case; no assignment happens).
// - `productTypeId` is kept in the findNearestFreeRack signature for
//   interface stability with the design; the inbound flow only calls it when
//   the type is unassigned.
// - Candidates are scored by BFS distance from the dock and sorted by
//   (distance asc, row asc, col asc) for deterministic output (design D2).
// - Returns null when there is no matching rack or none is reachable.

import { findRoute } from './bfs.js';
import { isFreeRack, isRack } from './model.js';

function pickNearest(layout, matches, originId) {
  const candidates = layout.locations.filter(matches);
  if (candidates.length === 0) return null;

  const scored = candidates.map((rack) => {
    const route = findRoute(layout, originId, rack.locationId);
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

export function findNearestFreeRack(layout, productTypeId, originId = layout.receptionId ?? layout.dockId) {
  return pickNearest(layout, isFreeRack, originId);
}

export function findNearestRackOfType(layout, productTypeId, originId = layout.receptionId ?? layout.dockId) {
  return pickNearest(layout, (location) => isRack(location) && location.productTypeId === productTypeId, originId);
}
