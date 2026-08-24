// App shell (área del producto WMS): sidebar oscuro fijo + main claro.
// Envuelve todas las rutas bajo /app. El Sidebar queda montado fuera del
// <Outlet />, así que persiste en cada pantalla del producto.

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 pb-10 pt-7 max-sm:px-4 max-sm:pb-8 max-sm:pt-5">
        <Outlet />
      </main>
    </div>
  );
}
