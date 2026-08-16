import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingreso from './pages/Ingreso.jsx';
import Egreso from './pages/Egreso.jsx';
import WarehouseMapPage from './pages/WarehouseMapPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    // Flex-row shell (spec: app-shell Shell layout, design D3): fixed 240px
    // Sidebar stays mounted outside <Routes />, so it persists on every route
    // including the NotFound fallback; main scrolls on the light canvas.
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 pb-10 pt-7 max-sm:px-4 max-sm:pb-8 max-sm:pt-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingreso" element={<Ingreso />} />
          <Route path="/egreso" element={<Egreso />} />
          <Route path="/mapa" element={<WarehouseMapPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}