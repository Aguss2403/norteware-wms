// Outbound picking flow resolution (spec: outbound-picking, design D1).
//
// searchSkus(skus, term) -> SKU[]
//   - Empty/whitespace term returns the full catalog (browse mode).
//   - Otherwise a case-insensitive partial match on code OR name; the term
//     is trimmed first.
//
// rackStatusFor(layout, sku) -> status
//   { kind: 'located', rackId }  // type assigned; nearest reachable rack
//   { kind: 'no-route' }         // type has racks but none reachable from dock
//   { kind: 'unlocated' }        // type has no rack on this layout
//   Used to show each search result's assigned-location status (spec R1).
//
// resolveOutboundFlow(layout, sku) -> result
//   { kind: 'located', rack, route }  // pick route dock -> nearest rack
//   { kind: 'no-stock' }              // no assigned location ("no place assigned")
//   { kind: 'no-route' }              // racks exist but none reachable
//
// Outbound picking NEVER assigns a location (unlike inbound): it only reports
// where an already-assigned product lives. "No stock" means the product type
// has no rack on the active client's layout. Pure and deterministic, so the
// Egreso page stays a thin presenter and the logic is testable without a DOM.

import { findRoute } from './bfs.js';
import { findNearestRackOfType } from './assign.js';
import { isRack } from './model.js';

export function searchSkus(skus, term) {
  const query = term.trim().toLowerCase();
  if (!query) return [...skus];
  return skus.filter(
    (sku) => sku.skuId.toLowerCase().includes(query) || sku.name.toLowerCase().includes(query)
  );
}

export function rackStatusFor(layout, sku) {
  const hasRack = layout.locations.some(
    (location) => isRack(location) && location.productTypeId === sku.productTypeId
  );
  if (!hasRack) return { kind: 'unlocated' };

  const nearest = findNearestRackOfType(layout, sku.productTypeId, layout.dispatchId);
  if (!nearest) return { kind: 'no-route' };
  return { kind: 'located', rackId: nearest.locationId };
}

export function resolveOutboundFlow(layout, sku) {
  const status = rackStatusFor(layout, sku);
  if (status.kind === 'unlocated') return { kind: 'no-stock' };
  if (status.kind === 'no-route') return { kind: 'no-route' };

  const rack = layout.index.get(status.rackId);
  return { kind: 'located', rack, route: findRoute(layout, layout.dispatchId, rack.locationId) };
}
