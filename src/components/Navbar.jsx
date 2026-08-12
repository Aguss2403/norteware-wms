import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import OutboxIcon from '@mui/icons-material/Outbox';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ClientSwitcher from './ClientSwitcher.jsx';

// D4 nav: Dashboard / Ingreso / Egreso, Spanish labels, icons accompany labels.
const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', end: true, Icon: DashboardIcon },
  { path: '/ingreso', label: 'Ingreso', Icon: MoveToInboxIcon },
  { path: '/egreso', label: 'Egreso', Icon: OutboxIcon },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    // D1b: elevation 0 + bottom divider come from the theme's MuiAppBar defaults.
    <AppBar position="sticky" color="default">
      <Toolbar sx={{ position: 'relative', gap: 0.5 }}>
        <Box
          component="nav"
          aria-label="Navegación principal"
          sx={{ display: 'flex', gap: 0.5 }}
        >
          {NAV_ITEMS.map(({ path, label, end, Icon }) => {
            // D3: exact match for the root, prefix match for sections.
            const isActive = end ? pathname === path : pathname.startsWith(path);
            return (
              <Button
                key={path}
                component={Link}
                to={path}
                startIcon={<Icon />}
                aria-current={isActive ? 'page' : undefined}
                sx={{
                  // D3/D4: active and pressed are white, inactive is muted.
                  color: isActive ? 'text.primary' : 'text.secondary',
                  px: 1.25,
                  py: 0.75,
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  '&:active': { color: 'text.primary' },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>

        {/* D4: centered green wordmark; absolutely positioned so nav + switcher stay symmetric. */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            color: 'primary.main',
            pointerEvents: 'none',
          }}
        >
          <WarehouseIcon sx={{ fontSize: 26 }} />
          <Typography
            component="span"
            sx={{ fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
          >
            NorteWare Solutions
          </Typography>
        </Box>

        <Box sx={{ ml: 'auto' }}>
          <ClientSwitcher />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
