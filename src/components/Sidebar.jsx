// Dark 240px app sidebar (spec: app-shell Navigation bar → Sidebar, design D3).
// Ink canvas, brand logo (links back to the marketing home), nav grouped under
// GENERAL / ANÁLISIS, and the client switcher as a footer pill. Active sections
// use the translucent green state from the mockup. Ink surfaces consume the
// ink token family only (design D4: ink confined to Sidebar + map card).

import { Link, NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import OutboxIcon from '@mui/icons-material/Outbox';
import MapIcon from '@mui/icons-material/Map';
import InventoryIcon from '@mui/icons-material/Inventory';
import TimelineIcon from '@mui/icons-material/Timeline';
import ClientSwitcher from './ClientSwitcher.jsx';

// Nav order + Spanish labels. Routes live under the /app product area.
const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { path: '/app', label: 'Dashboard', Icon: DashboardIcon, end: true },
      { path: '/app/ingreso', label: 'Ingreso', Icon: MoveToInboxIcon },
      { path: '/app/egreso', label: 'Egreso', Icon: OutboxIcon },
      { path: '/app/mapa', label: 'Mapa del depósito', Icon: MapIcon },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { path: '/app/inventario', label: 'Inventario', Icon: InventoryIcon },
      { path: '/app/trazabilidad', label: 'Trazabilidad', Icon: TimelineIcon },
    ],
  },
];

// Shared shell for nav links (mockup .navitem).
const NAV_ITEM_CLASS =
  'flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors';

const GROUP_LABEL_CLASS =
  'px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted';

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-ink px-4 py-6">
      {/* Brand logo + wordmark (mockup .logo): links back to the marketing
          home (/). The logo mark is a square emblem, so the wordmark text
          stays beside it. */}
      <Link to="/" className="flex items-center gap-2.5 px-2 pb-7" aria-label="NorteWare Solutions — inicio">
        <img src="/norteware-logo.png" alt="" className="h-9 w-auto shrink-0" />
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold tracking-[0.2px] text-ink-text">
            NorteWare
          </div>
          <div className="text-[11px] text-ink-muted">Solutions WMS</div>
        </div>
      </Link>

      <nav aria-label="Navegación principal" className="flex flex-col gap-0.5">
        {NAV_GROUPS.map((group) => {
          const groupId = `sidebar-group-${group.label.toLowerCase()}`;
          return (
            <div key={group.label}>
              <div id={groupId} className={GROUP_LABEL_CLASS}>
                {group.label}
              </div>
              <ul className="list-none p-0" aria-labelledby={groupId}>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `${NAV_ITEM_CLASS} ${
                          isActive
                            ? 'bg-brand/16 text-ink-text'
                            : 'text-ink-muted hover:bg-white/5 hover:text-ink-text'
                        }`
                      }
                      style={({ isActive }) =>
                        isActive ? { boxShadow: 'inset 2px 0 0 #2FAE58' } : undefined
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.Icon
                            className={`h-[17px] w-[17px] shrink-0 ${
                              isActive ? 'opacity-100' : 'opacity-85'
                            }`}
                          />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer client switcher pill (mockup .sidebar-footer, design D3b). */}
      <div className="mt-auto pt-4">
        <ClientSwitcher />
      </div>
    </aside>
  );
}
