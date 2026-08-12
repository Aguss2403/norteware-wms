import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingreso from './pages/Ingreso.jsx';
import Egreso from './pages/Egreso.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-6 pb-10 pt-7 max-sm:px-4 max-sm:pb-8 max-sm:pt-5">
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
