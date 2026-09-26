// Multi-line order picking (design: outbound orders, Phase 4).
// resolveOrder(layout, stock, lines) -> { lines, okLines, route, totalSteps, totalDistance }
// Each line resolves to ok / no-stock / no-route / empty with its rack + route.
// `route` is the compound dispatch -> pick stops -> dispatch route. Its `segments`
// retain each leg and `stops` retain the ordered operator-facing itinerary.
// Pure and deterministic; reuses resolveOutboundFlow to resolve each rack.

import { resolveOutboundFlow } from './outbound.js';
import { findRoute } from './bfs.js';

function appendSegment(path, segmentPath) {
  if (path.length === 0) return [...segmentPath];
  return [...path, ...segmentPath.slice(1)];
}

export function resolveOrder(layout, stock, lines) {
  const resolved = lines.map(({ sku, qty }) => {
    const flow = resolveOutboundFlow(layout, sku);
    if (flow.kind === 'no-stock' || flow.kind === 'no-route') {
      return { sku, qty, status: flow.kind, rack: null, route: null };
    }
    if ((stock[sku.skuId] ?? 0) < qty) {
      return { sku, qty, status: 'empty', rack: flow.rack, route: null };
    }
    return { sku, qty, status: 'ok', rack: flow.rack, route: flow.route };
  });

  const segments = [];
  const stops = [{ locationId: layout.dispatchId, kind: 'dispatch', order: 0 }];
  let path = [];
  let currentId = layout.dispatchId;

  for (const line of resolved) {
    if (line.status !== 'ok') continue;

    const segment = findRoute(layout, currentId, line.rack.locationId);
    if (segment.path.length === 0) {
      line.status = 'no-route';
      line.route = null;
      continue;
    }

    line.route = segment;
    segments.push({ fromId: currentId, toId: line.rack.locationId, kind: 'pick', ...segment });
    path = appendSegment(path, segment.path);
    currentId = line.rack.locationId;
    stops.push({ locationId: currentId, kind: 'pick', order: stops.length, skuId: line.sku.skuId });
  }

  const okLines = resolved.filter((line) => line.status === 'ok');
  if (okLines.length > 0) {
    const returnSegment = findRoute(layout, currentId, layout.dispatchId);
    if (returnSegment.path.length > 0) {
      segments.push({ fromId: currentId, toId: layout.dispatchId, kind: 'return', ...returnSegment });
      path = appendSegment(path, returnSegment.path);
      stops.push({ locationId: layout.dispatchId, kind: 'return', order: stops.length });
    }
  }

  const totalDistance = segments.reduce((sum, segment) => sum + segment.distance, 0);
  const route = path.length > 0
    ? { path, steps: path.length, distance: totalDistance, segments, stops }
    : null;
  const totalSteps = route?.steps ?? 0;

  return { lines: resolved, okLines, route, totalSteps, totalDistance };
}
