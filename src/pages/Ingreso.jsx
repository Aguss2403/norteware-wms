// Inbound receiving page (spec: inbound-receiving, design: Inbound sequence).
// QR read -> lookupSku -> assigned type: route to nearest rack of type; else
// auto-assign nearest free rack and route to it. Edge cases per spec: unknown
// SKU (error), no free rack (no-storage), unreachable target (no-route).
// A new receiving flow clears the previous route first (spec: Clear previous
// route); switching client also resets the flow state.

import { useEffect, useState } from 'react';
import { useClient } from '../context/ClientContext.jsx';
import { skus } from '../data/skus.js';
import { lookupSku } from '../domain/model.js';
import { resolveInboundFlow } from '../domain/inbound.js';
import QrInput from '../components/QrInput.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

const STATUS_COPY = {
  assigned: (rack) => `Ruta al estante asignado ${rack.locationId} (no se asigna ubicación)`,
  'auto-assigned': (rack) => `Ubicación asignada: estante ${rack.locationId}`,
  'no-route': () => 'No hay ruta al estante del tipo asignado para este SKU',
  'no-storage': () => 'No hay espacio de almacenamiento disponible en este almacén',
};

export default function Ingreso() {
  const { layout } = useClient();
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle' });
  const [error, setError] = useState(null);

  function handleSubmit(rawCode) {
    const code = rawCode.trim();
    setError(null);
    setRoute(null); // clear previous route before starting a new flow
    setStatus({ kind: 'idle' });

    const sku = lookupSku(skus, code);
    if (!sku) {
      setError(`Código de SKU desconocido: ${code}`);
      return;
    }

    const result = resolveInboundFlow(layout, sku);
    if (result.kind === 'no-route' || result.kind === 'no-storage') {
      setStatus({ kind: result.kind });
      return;
    }
    setStatus({ kind: result.kind, rack: result.rack });
    setRoute(result.route);
  }

  useEffect(() => {
    setRoute(null);
    setStatus({ kind: 'idle' });
    setError(null);
  }, [layout.clientId]);

  return (
    <section className="page">
      <h1>Ingreso de mercadería</h1>
      <QrInput onSubmit={handleSubmit} error={error} />
      {status.kind !== 'idle' && (
        <p className={`flow-status flow-status-${status.kind}`} role="status">
          {STATUS_COPY[status.kind](status.rack)}
        </p>
      )}
      <WarehouseMap route={route} />
    </section>
  );
}
