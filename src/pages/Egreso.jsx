// Outbound picking page (spec: outbound-picking, design: Outbound sequence).
// SearchBox -> select SKU -> resolveOutboundFlow (shared BFS): located SKUs
// draw the pick route from the dock to their assigned rack; SKUs without an
// assigned location report no stock ("no place assigned"); unreachable racks
// report no route. A new selection clears the previous route first (spec:
// Reset route on new selection); switching client also resets the flow state.

import { useEffect, useState } from 'react';
import { useClient } from '../context/ClientContext.jsx';
import { resolveOutboundFlow } from '../domain/outbound.js';
import SearchBox from '../components/SearchBox.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

const STATUS_COPY = {
  located: (rack) => `Ruta de picking al estante ${rack.locationId}`,
  'no-stock': () => 'Sin stock: este producto no tiene una ubicación asignada en este almacén',
  'no-route': () => 'No hay ruta al estante asignado para este producto',
};

// Design D4 — static literal map so the JIT never purges status colors.
// FLOW_STATUS_BASE carries layout only (no color); each variant owns its own
// bg/text/border-l-* utilities (one utility per visual property, base or
// variant, never both). Outbound domain: located|no-stock|no-route.
const FLOW_STATUS_BASE = 'mt-4 max-w-[32rem] rounded-md border-l-[3px] px-3.5 py-2.5 text-sm';
const FLOW_STATUS = {
  located: 'bg-[#e8f0fa] text-brand border-l-brand',
  'no-stock': 'bg-[#fbe9e9] text-[#a61b1b] border-l-[#a61b1b]',
  'no-route': 'bg-[#fdf0e0] text-[#8a5a0b] border-l-[#b7791f]',
};

export default function Egreso() {
  const { layout } = useClient();
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle' });

  function handleSelect(sku) {
    setRoute(null); // clear previous route before starting a new flow
    setStatus({ kind: 'idle' });

    const result = resolveOutboundFlow(layout, sku);
    if (result.kind === 'no-stock' || result.kind === 'no-route') {
      setStatus({ kind: result.kind });
      return;
    }
    setStatus({ kind: result.kind, rack: result.rack });
    setRoute(result.route);
  }

  useEffect(() => {
    setRoute(null);
    setStatus({ kind: 'idle' });
  }, [layout.clientId]);

  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-2xl tracking-[-0.01em] text-brand">Egreso y picking</h1>
      <SearchBox onSelect={handleSelect} />
      {status.kind !== 'idle' && (
        <p className={`${FLOW_STATUS_BASE} ${FLOW_STATUS[status.kind]}`} role="status">
          {STATUS_COPY[status.kind](status.rack)}
        </p>
      )}
      <WarehouseMap route={route} />
    </section>
  );
}
