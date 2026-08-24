// Marketing shell (site promocional): navbar clara + footer, sin sidebar.
// Envuelve Landing (/) y Nosotros (/nosotros). El CTA "Ingresar al sistema"
// lleva a la pantalla de entrada (/app/ingresar). El logo enlaza al inicio.
// Idioma de interfaz: español neutro. Identificadores de código: inglés.

import { NavLink, Link, Outlet } from 'react-router-dom';
import Button from '@mui/material/Button';

const NAV_LINK_CLASS = ({ isActive }) =>
  `text-[13.5px] font-medium transition-colors ${
    isActive ? 'text-text' : 'text-text-muted hover:text-text'
  }`;

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-text">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="NorteWare Solutions — inicio">
            <img src="/norteware-logo.png" alt="" className="h-8 w-auto" />
            <span className="font-display text-[16px] font-semibold tracking-tight text-text">
              NorteWare
            </span>
          </Link>
          <nav className="flex items-center gap-6" aria-label="Navegación del sitio">
            <NavLink to="/" end className={NAV_LINK_CLASS}>
              Inicio
            </NavLink>
            <NavLink to="/nosotros" className={NAV_LINK_CLASS}>
              Nosotros
            </NavLink>
            <Button component={Link} to="/app/ingresar" variant="contained" color="primary" size="small">
              Ingresar al sistema
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-[13px] text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/norteware-logo.png" alt="" className="h-6 w-auto opacity-90" aria-hidden="true" />
            <span>© {new Date().getFullYear()} NorteWare Solutions</span>
          </div>
          <span>Soluciones logísticas para el NOA</span>
        </div>
      </footer>
    </div>
  );
}
