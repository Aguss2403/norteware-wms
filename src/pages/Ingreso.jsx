// Inbound receiving page (spec: inbound-receiving, design: Inbound sequence).
// QR read -> lookupSku -> assigned type: route to nearest rack of type; else
// auto-assign nearest free rack and route to it. Edge cases per spec: unknown
// SKU (error), no free rack (no-storage), unreachable target (no-route).
// A new receiving flow clears the previous route first (spec: Clear previous
// route); switching client also resets the flow state.

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useClient } from '../context/ClientContext.jsx';
import { skus } from '../data/skus.js';
import { lookupSku } from '../domain/model.js';
import { resolveInboundFlow } from '../domain/inbound.js';
import QrInput from '../components/QrInput.jsx';
import OperatorSelect, { OPERATORS } from '../components/OperatorSelect.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

// Design D7 — status copy stays VERBATIM (Spanish, byte-identical to the
// pre-MUI page); only the banner chrome changes, to a MUI Alert.
const STATUS_COPY = {
  assigned: (rack, qty) => `Ruta al estante ${rack.locationId} · +${qty} ${qty === 1 ? 'unidad' : 'unidades'} (ya asignado)`,
  'auto-assigned': (rack, qty) => `Ubicación asignada: estante ${rack.locationId} · +${qty} ${qty === 1 ? 'unidad' : 'unidades'}`,
  'no-route': () => 'No hay ruta al estante del tipo asignado para este SKU',
  'no-storage': () => 'No hay espacio de almacenamiento disponible en este almacén',
};

// Design D7 — flow status kinds -> MUI Alert severities with theme colors
// (error/warning/success). no-route is WARNING (resolved open
// question): the rack exists and is reachable in principle, the route itself
// just cannot be built, so error would overstate it; the warning color plus
// the Spanish copy still read as a problem. no-storage is a hard error.
const FLOW_SEVERITY = {
  assigned: 'success',
  'auto-assigned': 'success',
  'no-route': 'warning',
  'no-storage': 'error',
};

export default function Ingreso() {
  const { layout, recordInbound } = useClient();
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle' });
  const [error, setError] = useState(null);
  const [operator, setOperator] = useState(OPERATORS[0]);

  function handleSubmit(rawCode, qty = 1) {
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
    // Persist: assign the rack (if auto-assigned) and add `qty` units to stock.
    recordInbound(sku, result.rack.locationId, qty, operator);
    setStatus({ kind: result.kind, rack: result.rack, qty });
    setRoute(result.route);
  }

  useEffect(() => {
    setRoute(null);
    setStatus({ kind: 'idle' });
    setError(null);
  }, [layout.clientId]);

  return (
    <section className="mx-auto max-w-5xl">
      <Typography
        component="h1"
        sx={{
          mb: 2.5,
          fontSize: '1.5rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'text.primary',
        }}
      >
        Ingreso de mercadería
      </Typography>
      <div className="mb-4 max-w-[32rem]">
        <OperatorSelect value={operator} onChange={setOperator} />
      </div>
      <QrInput onSubmit={handleSubmit} error={error} />
      <Typography color="text.secondary" sx={{ mt: 0.6, maxWidth: '32rem', fontSize: '0.8rem' }}>
        Lectura de QR simulada: ingrese el código a mano o use «Código demo» (escaneo por cámara fuera de alcance).
      </Typography>
      {status.kind !== 'idle' && (
        // D7: MUI Alert with the theme severity; role="status" keeps the
        // pre-MUI banner's non-blocking announcement semantics.
        <Alert severity={FLOW_SEVERITY[status.kind]} role="status" sx={{ mt: 2, maxWidth: '32rem' }}>
          {STATUS_COPY[status.kind](status.rack, status.qty)}
        </Alert>
      )}
      <WarehouseMap route={route} />
    </section>
  );
}
