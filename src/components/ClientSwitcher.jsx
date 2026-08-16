// Client switcher — dark footer pill inside the Sidebar (spec: app-shell
// Client switcher → footer pill, design D3b). Same useClient contract as the
// old AppBar version: exactly 3 seeded clients switch the active warehouse
// context. MUI Select + InputLabel keep the native keyboard/label a11y; the
// pill chrome (ink-soft surface, border, lime dot) comes from the mockup.

import { useClient } from '../context/ClientContext.jsx';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

const INK_TEXT = '#E9F2EC';
const INK_MUTED = '#7C9186';
const LIME = '#A8E063';

// Label stays wired for screen readers but is clipped: the pill itself renders
// the "Cliente activo" caption (mockup .client-pill), avoiding a floating dup.
const HIDDEN_LABEL = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

export default function ClientSwitcher() {
  const { clients, activeClientId, switchClient } = useClient();
  const activeClient = clients.find((client) => client.clientId === activeClientId) ?? clients[0];

  return (
    <FormControl
      size="small"
      fullWidth
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        px: 1.5,
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': { borderColor: 'rgba(255, 255, 255, 0.16)' },
      }}
    >
      <InputLabel id="client-switcher-label" sx={HIDDEN_LABEL}>
        Cliente activo
      </InputLabel>
      <Select
        labelId="client-switcher-label"
        id="client-switcher"
        value={activeClientId}
        label="Cliente activo"
        variant="standard"
        disableUnderline
        onChange={(event) => switchClient(event.target.value)}
        renderValue={() => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ color: INK_TEXT, fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}
              >
                {activeClient.name}
              </Typography>
              <Typography sx={{ color: INK_MUTED, fontSize: 10.5, lineHeight: 1.35 }}>
                Cliente activo
              </Typography>
            </Box>
            <Box
              aria-hidden="true"
              sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: LIME, flexShrink: 0 }}
            />
          </Box>
        )}
        sx={{
          color: INK_TEXT,
          py: 0.75,
          '& .MuiSelect-icon': { color: INK_MUTED },
          '&:focus': { bgcolor: 'transparent' },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: '#132018',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              mt: 1,
              '& .MuiMenuItem-root': {
                color: INK_TEXT,
                fontSize: 13,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)' },
                '&.Mui-selected': {
                  bgcolor: 'rgba(47, 174, 88, 0.16)',
                  color: '#DFFCE9',
                  '&:hover': { bgcolor: 'rgba(47, 174, 88, 0.16)' },
                },
              },
            },
          },
        }}
      >
        {clients.map((client) => (
          <MenuItem key={client.clientId} value={client.clientId}>
            {client.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}