// App shell (área del producto WMS): sidebar oscuro fijo + main claro.
// Envuelve todas las rutas bajo /app. El Sidebar queda montado fuera del
// <Outlet />, así que persiste en cada pantalla del producto.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { ROLES, useRole } from '../context/RoleContext.jsx';

const OPERATOR_PATHS = new Set(['/app/ingreso', '/app/egreso', '/app/mapa']);
const MANAGER_PATHS = new Set(['/app', '/app/inventario', '/app/trazabilidad']);

export default function AppLayout() {
  const { pathname } = useLocation();
  const { role } = useRole();

  if (role === ROLES.OPERATOR && MANAGER_PATHS.has(pathname)) {
    return <Navigate to="/app/ingreso" replace />;
  }

  if (role === ROLES.MANAGER && OPERATOR_PATHS.has(pathname)) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 pb-10 pt-7 max-sm:px-4 max-sm:pb-8 max-sm:pt-5">
        <Outlet />
      </main>
    </div>
  );
}
