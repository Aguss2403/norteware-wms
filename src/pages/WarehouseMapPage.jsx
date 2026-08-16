// Dedicated /mapa page (spec: app-shell Routing + Map page reachable, design
// D7). Renders the existing <WarehouseMap /> full-width inside a dark ink card
// with a back CTA. No route prop is passed — the page shows the floorplan in
// its resting state. The map's own internals (colors, chips, legend shell)
// are restyled in PR3; this page only provides the ink frame and header.

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarehouseMap from '../components/WarehouseMap.jsx';

export default function WarehouseMapPage() {
  return (
    <section className="mx-auto max-w-[74rem]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* h1 rests on text.primary from day one (design Contract table: page
            h1 must never use primary.main on light). */}
        <Typography
          component="h1"
          sx={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'text.primary' }}
        >
          Mapa del depósito
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'text.primary', borderColor: 'divider' }}
        >
          Volver al dashboard
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-ink p-1.5 shadow-card">
        <WarehouseMap />
      </div>
    </section>
  );
}