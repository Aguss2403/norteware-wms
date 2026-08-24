// App router — two areas, one deploy:
//   Marketing (site promocional, sin sidebar): / (Landing), /nosotros.
//   Producto (WMS, con sidebar): /app/* + pantalla de entrada /app/ingresar.
// NotFound queda fuera de ambos layouts (página genérica).

import { Routes, Route } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Nosotros from './pages/Nosotros.jsx';
import Ingresar from './pages/Ingresar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingreso from './pages/Ingreso.jsx';
import Egreso from './pages/Egreso.jsx';
import WarehouseMapPage from './pages/WarehouseMapPage.jsx';
import Inventario from './pages/Inventario.jsx';
import Trazabilidad from './pages/Trazabilidad.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {/* Sitio promocional */}
      <Route element={<MarketingLayout />}>
        <Route index element={<Landing />} />
        <Route path="nosotros" element={<Nosotros />} />
      </Route>

      {/* Pantalla de entrada (sin sidebar) */}
      <Route path="app/ingresar" element={<Ingresar />} />

      {/* Producto WMS (con sidebar) */}
      <Route path="app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="ingreso" element={<Ingreso />} />
        <Route path="egreso" element={<Egreso />} />
        <Route path="mapa" element={<WarehouseMapPage />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="trazabilidad" element={<Trazabilidad />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
