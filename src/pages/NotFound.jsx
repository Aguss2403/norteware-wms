// Not-found page (spec: app-shell, design D7). Light themed 404: MUI Paper
// card (white on the light canvas, hairline border, soft shadow) with a
// Typography h1 in text.primary and a contained Button linking back to the
// dashboard. The Button rests on green-deep via the theme's contained-primary
// variant (white-on-#2FAE58 fails AA at ~2.3:1; white-on-#1F8A44 passes).

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-5xl">
      <Paper variant="outlined" sx={{ px: 3, py: 2.5, maxWidth: '30rem', boxShadow: '0 1px 2px rgba(16,36,26,.04)' }}>
        <Typography
          component="h1"
          sx={{
            mb: 1,
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'text.primary',
          }}
        >
          Página no encontrada
        </Typography>
        <Typography sx={{ mb: 2 }}>La dirección solicitada no existe.</Typography>
        <Button component={Link} to="/app" variant="contained">
          Ir al panel de control
        </Button>
      </Paper>
    </section>
  );
}
