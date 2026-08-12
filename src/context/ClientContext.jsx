// Active client context shared by Dashboard, Ingreso, and Egreso (design D5).
// In-memory switch; no backend required (spec: Client switcher).

import { createContext, useContext, useMemo, useState } from 'react';
import { clients } from '../data/clients.js';
import { layouts } from '../data/layouts.js';

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  const [activeClientId, setActiveClientId] = useState(clients[0].clientId);

  const value = useMemo(() => {
    const client = clients.find((candidate) => candidate.clientId === activeClientId) ?? clients[0];
    const layout = layouts.find((candidate) => candidate.clientId === client.clientId);
    return {
      clients,
      client,
      layout,
      activeClientId: client.clientId,
      switchClient: (clientId) => setActiveClientId(clientId),
    };
  }, [activeClientId]);

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
