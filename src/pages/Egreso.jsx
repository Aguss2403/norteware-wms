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
    <section className="page">
      <h1>Egreso y picking</h1>
      <SearchBox onSelect={handleSelect} />
      {status.kind !== 'idle' && (
        <p className={`flow-status flow-status-${status.kind}`} role="status">
          {STATUS_COPY[status.kind](status.rack)}
        </p>
      )}
      <WarehouseMap route={route} />
    </section>
  );
}
