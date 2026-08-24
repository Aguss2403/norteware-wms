// Multi-line order picking (design: outbound orders, Phase 4).
// resolveOrder(layout, stock, lines) -> { lines, okLines, totalSteps, totalDistance }
// Each line resolves to ok / no-stock / no-route / empty with its rack + route.
// Pure and deterministic; reuses resolveOutboundFlow (nearest rack of type).

import { resolveOutboundFlow } from './outbound.js';

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

  const okLines = resolved.filter((line) => line.status === 'ok');
  const totalSteps = okLines.reduce((sum, line) => sum + (line.route?.steps ?? 0), 0);
  const totalDistance = okLines.reduce((sum, line) => sum + (line.route?.distance ?? 0), 0);

  return { lines: resolved, okLines, totalSteps, totalDistance };
}
