import { useClient } from '../context/ClientContext.jsx';

export default function ClientSwitcher() {
  const { clients, activeClientId, switchClient } = useClient();

  return (
    <label className="client-switcher">
      <span className="client-switcher-label">Cliente</span>
      <select
        className="client-switcher-select"
        value={activeClientId}
        onChange={(event) => switchClient(event.target.value)}
        aria-label="Cliente activo"
      >
        {clients.map((client) => (
          <option key={client.clientId} value={client.clientId}>
            {client.name}
          </option>
        ))}
      </select>
    </label>
  );
}
