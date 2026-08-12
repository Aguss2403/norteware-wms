import { useClient } from '../context/ClientContext.jsx';

export default function ClientSwitcher() {
  const { clients, activeClientId, switchClient } = useClient();

  return (
    <label className="flex items-center gap-2 text-sm text-[#dbe7f1] max-sm:w-full">
      <span className="whitespace-nowrap">Cliente</span>
      <select
        className="max-w-60 cursor-pointer rounded-md border border-white/35 bg-white px-2 py-[0.35rem] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand/45 max-sm:max-w-none max-sm:flex-1"
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
