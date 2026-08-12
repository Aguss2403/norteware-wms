import { NavLink } from 'react-router-dom';
import ClientSwitcher from './ClientSwitcher.jsx';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', end: true },
  { path: '/ingreso', label: 'Ingreso' },
  { path: '/egreso', label: 'Egreso' },
];

// Static literal map (design D4): two full strings, no concatenation.
// hover/focus-visible utilities replace the old pseudo-class rules (D6).
const navLinkClass = (isActive) =>
  isActive
    ? 'inline-block cursor-pointer rounded-md bg-white px-3.5 py-2 font-semibold text-brand transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent'
    : 'inline-block cursor-pointer rounded-md px-3.5 py-2 text-[#dbe7f1] transition-colors hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent';

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-linear-to-b from-brand to-brand-dark px-6 py-3 text-white shadow-nav max-sm:px-4"
      aria-label="Navegación principal"
    >
      <span className="text-[1.05rem] font-bold tracking-[0.02em]">NorteWare WMS</span>
      <ul className="m-0 flex list-none gap-1 p-0">
        {NAV_ITEMS.map(({ path, label, end }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={end}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <ClientSwitcher />
    </nav>
  );
}
