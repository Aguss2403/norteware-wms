import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', end: true },
  { path: '/ingreso', label: 'Ingreso' },
  { path: '/egreso', label: 'Egreso' },
];

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <span className="navbar-brand">NorteWare WMS</span>
      <ul className="navbar-links">
        {NAV_ITEMS.map(({ path, label, end }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
