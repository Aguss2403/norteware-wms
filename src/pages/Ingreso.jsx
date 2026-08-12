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

// Design D4 — static literal map so the JIT never purges status colors.
// FLOW_STATUS_BASE carries layout only (no color); each variant owns its own
// bg/text/border-l-* utilities (one utility per visual property, base or
// variant, never both). Inbound domain: assigned|auto-assigned|no-route|no-storage.
const FLOW_STATUS_BASE = 'mt-4 max-w-[32rem] rounded-md border-l-[3px] px-3.5 py-2.5 text-sm';
const FLOW_STATUS = {
  assigned: 'bg-[#e8f0fa] text-brand border-l-brand',
  'auto-assigned': 'bg-[#e6f4e2] text-[#2f5d2a] border-l-[#2f5d2a]',
  'no-route': 'bg-[#fdf0e0] text-[#8a5a0b] border-l-[#b7791f]',
  'no-storage': 'bg-[#fbe9e9] text-[#a61b1b] border-l-[#a61b1b]',
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
    <section className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-2xl tracking-[-0.01em] text-brand">Ingreso de mercadería</h1>
      <QrInput onSubmit={handleSubmit} error={error} />
      <p className="mt-[0.6rem] max-w-[32rem] text-[0.8rem] text-text-muted">
        Lectura de QR simulada: ingrese el código a mano o use «Código demo» (escaneo por cámara fuera de alcance).
      </p>
      {status.kind !== 'idle' && (
        <p className={`${FLOW_STATUS_BASE} ${FLOW_STATUS[status.kind]}`} role="status">
          {STATUS_COPY[status.kind](status.rack)}
        </p>
      )}
      <WarehouseMap route={route} />
    </section>
  );
}
