// Dynamic warehouse state helpers (design: stock-backed live layout).
// The seed layout is immutable; auto-assignments are layered on top as a
// rackId -> productTypeId map. applyAssignments produces a NEW layout object
// (never mutates seeds) so BFS, assign, inbound/outbound, and the map all see
// the auto-assigned racks as occupied — no domain rewrite needed.

export function applyAssignments(layout, assignments) {
  if (!layout) return layout;
  if (!assignments || Object.keys(assignments).length === 0) return layout;

  let changed = false;
  const locations = layout.locations.map((location) => {
    if (location.type === 'rack' && assignments[location.locationId]) {
      changed = true;
      return { ...location, productTypeId: assignments[location.locationId] };
    }
    return location;
  });

  if (!changed) return layout;
  const index = new Map(locations.map((location) => [location.locationId, location]));
  return { ...layout, locations, index };
}

// Rack where a SKU lives: its product type's nearest rack in the live layout.
// Returns the locationId (string) or null when the type has no rack here.
export function rackIdForSku(layout, sku) {
  if (!layout || !sku) return null;
  const rack = layout.locations.find(
    (location) => location.type === 'rack' && location.productTypeId === sku.productTypeId
  );
  return rack ? rack.locationId : null;
}
