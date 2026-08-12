// Inbound receiving flow resolution (spec: inbound-receiving, design D1).
//
// resolveInboundFlow(layout, sku) -> result
//   { kind: 'auto-assigned', rack, route }  // unassigned type, nearest free rack
//   { kind: 'assigned', rack, route }       // assigned type, nearest rack of type
//   { kind: 'no-storage' }                  // unassigned type, no free reachable rack
//   { kind: 'no-route' }                    // assigned type, no reachable rack
//
// - "Assigned" means the active client's layout already holds the SKU's
//   product type on at least one rack; then no assignment happens, only the
//   route to the nearest reachable rack of that type.
// - "Unassigned" means no rack holds the type; then the nearest free rack is
//   auto-assigned and the route drawn to it.
// - Pure and deterministic: the same (layout, sku) always yields the same
//   result, so the page stays a thin presenter and the logic is testable
//   without a DOM.

import { findRoute } from './bfs.js';
import { findNearestFreeRack, findNearestRackOfType } from './assign.js';
import { isRack } from './model.js';

export function resolveInboundFlow(layout, sku) {
  const hasAssignedRack = layout.locations.some(
    (location) => isRack(location) && location.productTypeId === sku.productTypeId
  );

  if (hasAssignedRack) {
    const rack = findNearestRackOfType(layout, sku.productTypeId);
    if (!rack) return { kind: 'no-route' };
    return { kind: 'assigned', rack, route: findRoute(layout, layout.dockId, rack.locationId) };
  }

  const rack = findNearestFreeRack(layout, sku.productTypeId);
  if (!rack) return { kind: 'no-storage' };
  return { kind: 'auto-assigned', rack, route: findRoute(layout, layout.dockId, rack.locationId) };
}
