// Deterministic Breadth-First Search over a warehouse grid (design D2, D4).
//
// findRoute(layout, startId, targetId) -> { path, steps, distance } | { path: [] }
// - `steps`   = number of cells in the path (path.length).
// - `distance` = number of moves between cells (steps - 1).
// - Neighbor order is FIXED: up, right, down, left. Together with the
//   distance/row/col sort in assign.js this makes routing fully deterministic.
// - Walls block traversal; rack cells are not walk-through (only the target
//   cell may be entered even if it is a rack).
// - An unreachable target (or unknown ids) returns { path: [] } and never throws.

const NEIGHBOR_OFFSETS = [
  [-1, 0], // up
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
];

function isTraversable(location) {
  return location.type === 'path' || location.type === 'dock';
}

function rebuildPath(prev, startId, targetId) {
  const path = [];
  let cursor = targetId;
  while (cursor !== undefined) {
    path.push(cursor);
    if (cursor === startId) break;
    cursor = prev.get(cursor);
  }
  if (path[path.length - 1] !== startId) return null; // target not reached
  return path.reverse();
}

export function findRoute(layout, startId, targetId) {
  if (!layout || !layout.index) return { path: [] };

  const start = layout.index.get(startId);
  const target = layout.index.get(targetId);
  if (!start || !target) return { path: [] };
  if (startId === targetId) return { path: [startId], steps: 1, distance: 0 };

  const queue = [startId];
  const visited = new Set([startId]);
  const prev = new Map();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (currentId === targetId) {
      const path = rebuildPath(prev, startId, targetId);
      if (!path) return { path: [] };
      return { path, steps: path.length, distance: path.length - 1 };
    }
    const current = layout.index.get(currentId);

    for (const [dr, dc] of NEIGHBOR_OFFSETS) {
      const row = current.row + dr;
      const col = current.col + dc;
      if (row < 0 || row >= layout.rows || col < 0 || col >= layout.cols) continue;

      const next = layout.index.get(`${row}-${col}`);
      if (!next || visited.has(next.locationId)) continue;
      if (next.locationId !== targetId && !isTraversable(next)) continue;

      visited.add(next.locationId);
      prev.set(next.locationId, currentId);
      queue.push(next.locationId);
    }
  }

  return { path: [] };
}
