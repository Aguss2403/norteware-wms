// Not-found page (spec: app-shell, design D7). Themed 404: MUI Paper +
// Typography and a contained Button that links back to the dashboard. The old
// Tailwind .entry-link class (white text on brand green) is gone — the Button
// uses the theme's primary contrastText (#04140a).

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-5xl">
      <Paper variant="outlined" sx={{ px: 3, py: 2.5, maxWidth: '30rem' }}>
        <Typography
          component="h1"
          sx={{
            mb: 1,
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'primary.main',
          }}
        >
          Página no encontrada
        </Typography>
        <Typography sx={{ mb: 2 }}>La dirección solicitada no existe.</Typography>
        <Button component={Link} to="/" variant="contained">
          Volver al panel de control
        </Button>
      </Paper>
    </section>
  );
}
