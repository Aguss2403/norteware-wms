import { useClient } from '../context/ClientContext.jsx';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export default function ClientSwitcher() {
  const { clients, activeClientId, switchClient } = useClient();

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="client-switcher-label">Cliente</InputLabel>
      <Select
        labelId="client-switcher-label"
        id="client-switcher"
        value={activeClientId}
        label="Cliente"
        onChange={(event) => switchClient(event.target.value)}
        aria-label="Cliente activo"
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
