// Landing promocional (site público, sin sidebar). Hero + features + los 4
// procesos WMS + CTA. CTA primario "Comunicate con un asesor" es intencional
// (no navega); CTA secundario "Ingresar al sistema" lleva a /app/ingresar.
// Copy en español neutro; identificadores de código en inglés.

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import MapIcon from '@mui/icons-material/Map';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import TimelineIcon from '@mui/icons-material/Timeline';

const FEATURES = [
  {
    Icon: MapIcon,
    title: 'Mapa de depósito a medida',
    text: 'Cada cliente tiene su propio plano en grilla, con celdas tipadas: muelle, pasillo, rack y pared.',
  },
  {
    Icon: AltRouteIcon,
    title: 'Rutas óptimas',
    text: 'El sistema traza la ruta más corta entre el muelle y cada rack con búsqueda determinística.',
  },
  {
    Icon: QrCodeScannerIcon,
    title: 'Recepción inteligente',
    text: 'Lectura de QR y auto-asignación del rack libre más cercano al momento de ingresar mercadería.',
  },
  {
    Icon: SearchIcon,
    title: 'Picking dirigido',
    text: 'Buscá un producto y el sistema te lleva por la ruta óptima hasta su ubicación asignada.',
  },
  {
    Icon: WarehouseIcon,
    title: 'Multi-cliente',
    text: 'Citrícolas, ingenios y mayoristas del NOA, cada uno con su propio depósito y operación.',
  },
  {
    Icon: TimelineIcon,
    title: 'Trazabilidad',
    text: 'Historial de movimientos y estado de inventario para saber qué entra, qué sale y dónde está.',
  },
];

const PROCESSES = [
  { step: '01', title: 'Recepción', text: 'Ingreso de mercadería con registro de lote, vencimiento y origen.' },
  { step: '02', title: 'Almacenamiento', text: 'El sistema indica al operario la ubicación exacta de cada carga.' },
  { step: '03', title: 'Preparación', text: 'Ruta de picking más corta aplicando rotación FIFO de stock.' },
  { step: '04', title: 'Despacho', text: 'Validación final y documentación de trazabilidad en el andén.' },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-medium text-text-muted">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              WMS para el NOA
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-text sm:text-5xl">
              Tu depósito, bajo control con rutas óptimas
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-text-muted">
              NorteWare Solutions digitaliza la recepción, el almacenamiento, la preparación y el
              despacho de tus productos, con un mapa de depósito hecho a medida y soporte local.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                component={Link}
                to="/app/ingresar"
                variant="contained"
                color="primary"
                size="large"
              >
                Ingresar al sistema
              </Button>
              <Button component="a" href="#" variant="outlined" color="primary" size="large">
                Comunicate con un asesor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Logo band */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
          <img
            src="/norteware-logo.png"
            alt="NorteWare Solutions"
            className="h-16 w-auto sm:h-20"
          />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Todo lo que tu depósito necesita
          </h2>
          <p className="mt-3 text-[14px] text-text-muted">
            Un sistema pensado para las operaciones logísticas y agroindustriales de la región.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-brand/12 text-brand-deep">
                <Icon sx={{ fontSize: 20 }} aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-[16px] font-semibold text-text">{title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Procesos WMS */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Los cuatro procesos que controlan tu inventario
            </h2>
            <p className="mt-3 text-[14px] text-text-muted">
              De la recepción al despacho, cada movimiento queda registrado y optimizado.
            </p>
          </div>
          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESSES.map(({ step, title, text }) => (
              <li key={step} className="relative rounded-2xl border border-border bg-surface p-6">
                <span className="font-mono-ui text-[13px] font-medium text-brand-deep">{step}</span>
                <h3 className="mt-2 font-display text-[16px] font-semibold text-text">{title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-ink text-ink-text">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
          <h2 className="max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Empezá a optimizar tu depósito hoy
          </h2>
          <p className="max-w-xl text-[14px] text-ink-muted">
            Conocé la demo del WMS y descubrí cómo las rutas óptimas reducen tiempos y pérdidas de stock.
          </p>
          <Button component={Link} to="/app/ingresar" variant="contained" color="primary" size="large">
            Probar la demo
          </Button>
        </div>
      </section>
    </>
  );
}
