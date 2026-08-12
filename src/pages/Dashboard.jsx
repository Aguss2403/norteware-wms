// Dashboard page (spec: app-shell Requirement: Dashboard, design D7).
// Shows the ACTIVE client's warehouse summary from seeded data on an MUI
// Paper/Typography card and offers entry points to Ingreso and Egreso as MUI
// Buttons that keep the react-router links. Layout/tracking of the summary
// matches the pre-MUI card; only the chrome is MUI (Paper/Typography/Button).

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useClient } from '../context/ClientContext.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

export default function Dashboard() {
  const { client, layout } = useClient();

  const racks = layout.locations.filter((location) => location.type === 'rack');
  const freeRacks = racks.filter((location) => !location.productTypeId);
  const storedTypes = [...new Set(racks.map((location) => location.productTypeId).filter(Boolean))];

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
        Panel de control
      </Typography>
      {/* Summary card: outlined Paper matches the old border-border/bg-surface card. */}
      <Paper variant="outlined" sx={{ px: 2.5, py: 2 }}>
        <Typography
          component="h2"
          sx={{ mb: '0.4rem', fontSize: '1.1rem', color: 'primary.main' }}
        >
          {client.name}
        </Typography>
        <Typography color="text.secondary" sx={{ my: 0.3 }}>
          Almacén de {layout.rows} × {layout.cols} celdas · {racks.length} estantes ({freeRacks.length} libres)
        </Typography>
        <Typography color="text.secondary" sx={{ my: 0.3 }}>
          Tipos de producto almacenados:{' '}
          {storedTypes.length > 0 ? storedTypes.join(', ') : 'Ninguno'}
        </Typography>
      </Paper>
      <WarehouseMap />
      <div className="mt-6 flex flex-wrap gap-4">
        {/* D7: contained Buttons use theme primary + contrastText (light text on the muted brand green). */}
        <Button component={Link} to="/ingreso" variant="contained">
          Ingreso de mercadería
        </Button>
        <Button component={Link} to="/egreso" variant="contained">
          Egreso y picking
        </Button>
      </div>
    </section>
  );
}
