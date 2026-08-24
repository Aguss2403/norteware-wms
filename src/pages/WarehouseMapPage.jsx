// Dedicated /mapa page (spec: app-shell Routing + Map page reachable, design
// D7). PR2 added the page-level ink frame; PR3 moved the dark hero card INTO
// <WarehouseMap /> (MapShell), so this page only provides the h1 + back CTA
// and renders the map full-width — identical presentation to the Dashboard.
// No route prop is passed — the page shows the floorplan in its resting state.

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
          to="/app"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'text.primary', borderColor: 'divider' }}
        >
          Volver al dashboard
        </Button>
      </div>
      {/* PR3: MapShell (inside WarehouseMap) is the dark hero card now —
          no extra frame here, so /mapa and Dashboard render the same card. */}
      <WarehouseMap />
    </section>
  );
}