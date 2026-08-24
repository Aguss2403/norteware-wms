// Pantalla de entrada (sin auth real): seleccionás el cliente con el que vas a
// operar y entrás al producto. Reutiliza ClientContext (switchClient) para que
// la app arranque con el cliente elegido. Estilo claro tipo "login", separado
// del sidebar. Copy en español neutro.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useClient } from '../context/ClientContext.jsx';
import { layouts } from '../data/layouts.js';

// Rubro descriptivo por cliente semilla (estable, acompaña a clients.js).
const RUBROS = {
  citrus: 'Citrícola y empaque',
  azucar: 'Ingenio azucarero',
  mayorista: 'Distribución mayorista',
};

export default function Ingresar() {
  const { clients, switchClient } = useClient();
  const [selectedId, setSelectedId] = useState(clients[0].clientId);
  const navigate = useNavigate();

  function handleEnter() {
    switchClient(selectedId);
    navigate('/app');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <Link to="/" className="mb-8" aria-label="NorteWare Solutions — inicio">
        <img src="/norteware-logo.png" alt="NorteWare Solutions" className="h-14 w-auto" />
      </Link>

      <div className="w-full max-w-2xl text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          Ingresá al sistema
        </h1>
        <p className="mt-2 text-[14px] text-text-muted">
          Seleccioná el cliente con el que querés operar.
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {clients.map((client) => {
          const layout = layouts.find((candidate) => candidate.clientId === client.clientId);
          const selected = client.clientId === selectedId;
          return (
            <button
              key={client.clientId}
              type="button"
              onClick={() => setSelectedId(client.clientId)}
              aria-pressed={selected}
              className={`rounded-2xl border p-5 text-left transition-colors ${
                selected
                  ? 'border-brand bg-brand/8 shadow-card'
                  : 'border-border bg-card shadow-card hover:border-brand/50'
              }`}
            >
              <div className="font-display text-[15px] font-semibold text-text">{client.name}</div>
              <div className="mt-1 text-[12.5px] text-text-muted">{RUBROS[client.clientId]}</div>
              {layout && (
                <div className="mt-3 font-mono-ui text-[12px] text-brand-deep">
                  {layout.rows} × {layout.cols} · muelle {layout.dockId}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={handleEnter}
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 4 }}
        endIcon={<ArrowForwardIcon />}
      >
        Entrar
      </Button>
    </div>
  );
}
