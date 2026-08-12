// Shared location model for the NorteWare WMS demo (design D1, D3).
//
// A location is one cell of a client's warehouse grid:
//   { locationId, row, col, type: "rack"|"dock"|"path"|"wall",
//     capacity?, productTypeId? }
// - `locationId` is derived from grid coordinates: `${row}-${col}`.
// - Racks carry `capacity` and `productTypeId`; an empty `productTypeId`
//   means the rack is free (eligible for auto-assign).
// - Walls and absent cells are non-traversable for routing.

export const LOCATION_TYPES = ['rack', 'dock', 'path', 'wall'];

export const DEFAULT_RACK_CAPACITY = 10;

export function buildLocation({ row, col, type, capacity = DEFAULT_RACK_CAPACITY, productTypeId = '' }) {
  const location = {
    locationId: `${row}-${col}`,
    row,
    col,
    type,
  };
  if (type === 'rack') {
    location.capacity = capacity;
    location.productTypeId = productTypeId;
  }
  return location;
}

export function isRack(location) {
  return location.type === 'rack';
}

export function isWall(location) {
  return location.type === 'wall';
}

export function isDock(location) {
  return location.type === 'dock';
}

export function isFreeRack(location) {
  return isRack(location) && !location.productTypeId;
}

// Expands a compact raw layout (string grid + rack metadata) into the
// canonical layout shape consumed by BFS, assign, and the map component:
//   { clientId, rows, cols, dockId, locations: Location[], index: Map<id, Location> }
// Grid legend: D dock, R rack, # wall, . path.
export function buildLayout(raw) {
  const locations = [];
  for (let row = 0; row < raw.rows; row += 1) {
    const line = raw.grid[row];
    for (let col = 0; col < raw.cols; col += 1) {
      const char = line[col];
      let type = 'path';
      if (char === 'D') type = 'dock';
      else if (char === '#') type = 'wall';
      else if (char === 'R') type = 'rack';

      const rackMeta = type === 'rack' ? raw.racks?.[`${row}-${col}`] ?? {} : {};
      locations.push(
        buildLocation({
          row,
          col,
          type,
          capacity: rackMeta.capacity,
          productTypeId: rackMeta.productTypeId,
        })
      );
    }
  }
  const index = new Map(locations.map((location) => [location.locationId, location]));
  return {
    clientId: raw.clientId,
    rows: raw.rows,
    cols: raw.cols,
    dockId: raw.dockId,
    locations,
    index,
  };
}

export function locationAt(layout, row, col) {
  return layout.index.get(`${row}-${col}`) ?? null;
}

export function lookupSku(skus, skuId) {
  return skus.find((sku) => sku.skuId === skuId) ?? null;
}
