// Outbound picking page (spec: outbound-picking, design: Outbound sequence).
// SearchBox -> select SKU -> resolveOutboundFlow (shared BFS): located SKUs
// draw the pick route from the dock to their assigned rack; SKUs without an
// assigned location report no stock ("no place assigned"); unreachable racks
// report no route. A new selection clears the previous route first (spec:
// Reset route on new selection); switching client also resets the flow state.

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useClient } from '../context/ClientContext.jsx';
import { resolveOutboundFlow } from '../domain/outbound.js';
import SearchBox from '../components/SearchBox.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

// Design D7 — status copy stays VERBATIM (Spanish, byte-identical to the
// pre-MUI page); only the banner chrome changes, to a MUI Alert.
const STATUS_COPY = {
  located: (rack) => `Ruta de picking al estante ${rack.locationId}`,
  'no-stock': () => 'Sin stock: este producto no tiene una ubicación asignada en este almacén',
  'no-route': () => 'No hay ruta al estante asignado para este producto',
};

// Design D7 — flow status kinds -> MUI Alert severities with the dark-legible
// theme colors. no-route is WARNING (resolved open question, same rationale as
// the inbound page): the product has an assigned rack, the route just cannot
// be built; warning + the Spanish copy still read as a problem. no-stock is a
// hard error.
const FLOW_SEVERITY = {
  located: 'success',
  'no-route': 'warning',
  'no-stock': 'error',
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
      <Typography
        component="h1"
        sx={{
          mb: 2.5,
          fontSize: '1.5rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'primary.main',
        }}
      >
        Egreso y picking
      </Typography>
      <SearchBox onSelect={handleSelect} />
      {status.kind !== 'idle' && (
        // D7: MUI Alert with the dark-legible severity; role="status" keeps the
        // pre-MUI banner's non-blocking announcement semantics.
        <Alert severity={FLOW_SEVERITY[status.kind]} role="status" sx={{ mt: 2, maxWidth: '32rem' }}>
          {STATUS_COPY[status.kind](status.rack)}
        </Alert>
      )}
      <WarehouseMap route={route} />
    </section>
  );
}
