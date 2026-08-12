import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingreso from './pages/Ingreso.jsx';
import Egreso from './pages/Egreso.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingreso" element={<Ingreso />} />
          <Route path="/egreso" element={<Egreso />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
