// Build-time seed validation (design D6, spec: Seeded data / Build validation).
// Runs after `vite build` via `npm run build`. Fails the build (exit 1) when:
//   - seed counts drift (3 clients, 3 layouts, >= 8 SKUs)
//   - a layout dockId or rack product type reference does not resolve
//   - any location is malformed (bad type, out-of-bounds, duplicate id)
//   - a rack lacks a positive capacity or uses an unknown product type
//   - an assigned product type has no rack anywhere (per-layout coverage)
//   - the fixed auto-assign result for the citrus layout changes
//   - a known reachable/unreachable route pair stops behaving as expected

import { clients } from '../src/data/clients.js';
import { layouts } from '../src/data/layouts.js';
import { skus } from '../src/data/skus.js';
import { findRoute } from '../src/domain/bfs.js';
import { findNearestFreeRack } from '../src/domain/assign.js';
import { LOCATION_TYPES, isDock, isRack } from '../src/domain/model.js';

// Fixed contract (locked by the seed wall/dock placement):
const FIXED_AUTO_ASSIGN = { layoutId: 'citrus', productTypeId: 'PT-JUGO', expectedRackId: '2-6' };
const KNOWN_ROUTE = { layoutId: 'citrus', from: '0-0', to: '2-6', expectedDistance: 8, expectedSteps: 9 };
const KNOWN_NO_ROUTE = { layoutId: 'citrus', from: '0-0', to: '5-5' };

const errors = [];
const check = (condition, message) => {
  if (!condition) errors.push(message);
};

// 1. Seed counts
check(clients.length === 3, `expected 3 clients, got ${clients.length}`);
check(layouts.length === 3, `expected 3 layouts, got ${layouts.length}`);
check(skus.length >= 8, `expected >= 8 SKUs, got ${skus.length}`);

const knownProductTypes = new Set(skus.map((sku) => sku.productTypeId));
check(knownProductTypes.size >= 4, `expected >= 4 distinct product types, got ${knownProductTypes.size}`);

// 2. Per-layout integrity
for (const layout of layouts) {
  const prefix = `[${layout.clientId}]`;
  const dock = layout.index.get(layout.dockId);
  check(dock && isDock(dock), `${prefix} dockId "${layout.dockId}" does not resolve to a dock location`);

  const seen = new Set();
  for (const loc of layout.locations) {
    check(LOCATION_TYPES.includes(loc.type), `${prefix} "${loc.locationId}" has unknown type "${loc.type}"`);
    check(loc.row >= 0 && loc.row < layout.rows && loc.col >= 0 && loc.col < layout.cols,
      `${prefix} "${loc.locationId}" is out of bounds (${layout.rows}x${layout.cols})`);
    check(!seen.has(loc.locationId), `${prefix} duplicate locationId "${loc.locationId}"`);
    seen.add(loc.locationId);

    if (isRack(loc)) {
      check(Number.isInteger(loc.capacity) && loc.capacity > 0,
        `${prefix} rack "${loc.locationId}" has invalid capacity ${loc.capacity}`);
      if (loc.productTypeId) {
        check(knownProductTypes.has(loc.productTypeId),
          `${prefix} rack "${loc.locationId}" references unknown product type "${loc.productTypeId}"`);
      }
    }
  }

  const assigned = layout.locations.filter((loc) => isRack(loc) && loc.productTypeId);
  check(assigned.length >= 1, `${prefix} has no assigned rack (each client needs storage)`);
  const free = layout.locations.filter((loc) => isRack(loc) && !loc.productTypeId);
  check(free.length >= 1, `${prefix} has no free rack (auto-assign must be possible)`);

  const reachableFree = free.filter((rack) => findRoute(layout, layout.dockId, rack.locationId).path.length > 0);
  check(reachableFree.length >= 1, `${prefix} has no reachable free rack`);
}

// 3. Assigned-type coverage: every assigned type has >= 1 rack somewhere
const assignedTypes = new Set(
  layouts.flatMap((layout) =>
    layout.locations.filter((loc) => isRack(loc) && loc.productTypeId).map((loc) => loc.productTypeId)
  )
);
for (const productTypeId of assignedTypes) {
  const hasRack = layouts.some((layout) =>
    layout.locations.some((loc) => isRack(loc) && loc.productTypeId === productTypeId)
  );
  check(hasRack, `assigned product type "${productTypeId}" has no rack`);
}
// Unassigned coverage: at least one product type is free (auto-assign demo)
check(!assignedTypes.has(FIXED_AUTO_ASSIGN.productTypeId),
  `"${FIXED_AUTO_ASSIGN.productTypeId}" should be unassigned (auto-assign target), but a rack holds it`);

// 4. Fixed BFS results (determinism lock)
const layoutOf = (layoutId) => layouts.find((layout) => layout.clientId === layoutId);

const routeLayout = layoutOf(KNOWN_ROUTE.layoutId);
const route = findRoute(routeLayout, KNOWN_ROUTE.from, KNOWN_ROUTE.to);
check(route.path.length > 0, `${KNOWN_ROUTE.from} -> ${KNOWN_ROUTE.to} should be reachable`);
check(route.distance === KNOWN_ROUTE.expectedDistance,
  `${KNOWN_ROUTE.from} -> ${KNOWN_ROUTE.to}: expected distance ${KNOWN_ROUTE.expectedDistance}, got ${route.distance}`);
check(route.steps === KNOWN_ROUTE.expectedSteps,
  `${KNOWN_ROUTE.from} -> ${KNOWN_ROUTE.to}: expected steps ${KNOWN_ROUTE.expectedSteps}, got ${route.steps}`);

const noRouteLayout = layoutOf(KNOWN_NO_ROUTE.layoutId);
const noRoute = findRoute(noRouteLayout, KNOWN_NO_ROUTE.from, KNOWN_NO_ROUTE.to);
check(noRoute.path.length === 0, `${KNOWN_NO_ROUTE.from} -> ${KNOWN_NO_ROUTE.to} must report no route`);
check(noRoute.steps === undefined, 'no-route result must not include steps');

// 5. Fixed auto-assign assertion (design D2)
const assignLayout = layoutOf(FIXED_AUTO_ASSIGN.layoutId);
const nearest = findNearestFreeRack(assignLayout, FIXED_AUTO_ASSIGN.productTypeId);
check(nearest && nearest.locationId === FIXED_AUTO_ASSIGN.expectedRackId,
  `auto-assign: expected nearest free rack "${FIXED_AUTO_ASSIGN.expectedRackId}" for "${FIXED_AUTO_ASSIGN.productTypeId}" on "${FIXED_AUTO_ASSIGN.layoutId}", got ${nearest ? nearest.locationId : null}`);

// 6. Determinism: repeat the fixed route twice
const again = findRoute(routeLayout, KNOWN_ROUTE.from, KNOWN_ROUTE.to);
check(JSON.stringify(route.path) === JSON.stringify(again.path), 'BFS is not deterministic across identical inputs');

if (errors.length > 0) {
  console.error(`Seed validation FAILED (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Seed validation OK:');
console.log(`  - ${clients.length} clients, ${layouts.length} layouts, ${skus.length} SKUs (${knownProductTypes.size} product types)`);
console.log(`  - fixed auto-assign: ${FIXED_AUTO_ASSIGN.layoutId} "${FIXED_AUTO_ASSIGN.productTypeId}" -> rack ${FIXED_AUTO_ASSIGN.expectedRackId}`);
console.log(`  - fixed route: ${KNOWN_ROUTE.from} -> ${KNOWN_ROUTE.to} (distance ${route.distance}, steps ${route.steps})`);
console.log(`  - no-route case: ${KNOWN_NO_ROUTE.from} -> ${KNOWN_NO_ROUTE.to} reports no route (no crash)`);
