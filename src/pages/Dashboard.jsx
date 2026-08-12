import { Link } from 'react-router-dom';
import { useClient } from '../context/ClientContext.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

// D4 static literal class — one utility per visual property, literal string
// so the JIT never purges it. Covers the old .entry-link rule (bg/border/
// text + hover/focus-visible variants).
const ENTRY_LINK =
  'inline-block rounded-md bg-brand px-[1.1rem] py-[0.6rem] font-medium text-white no-underline transition-[background-color,transform] hover:-translate-y-px hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent';

export default function Dashboard() {
  const { client, layout } = useClient();

  const racks = layout.locations.filter((location) => location.type === 'rack');
  const freeRacks = racks.filter((location) => !location.productTypeId);
  const storedTypes = [...new Set(racks.map((location) => location.productTypeId).filter(Boolean))];

  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-2xl tracking-[-0.01em] text-brand">Panel de control</h1>
      <div className="rounded-lg border border-border bg-surface px-5 py-4 shadow-card">
        <h2 className="mb-[0.4rem] text-[1.1rem] text-brand">{client.name}</h2>
        <p className="my-[0.3rem] text-text-muted">
          Almacén de {layout.rows} × {layout.cols} celdas · {racks.length} estantes ({freeRacks.length} libres)
        </p>
        <p className="my-[0.3rem] text-text-muted">
          Tipos de producto almacenados:{' '}
          {storedTypes.length > 0 ? storedTypes.join(', ') : 'Ninguno'}
        </p>
      </div>
      <WarehouseMap />
      <div className="mt-6 flex flex-wrap gap-4">
        <Link className={ENTRY_LINK} to="/ingreso">
          Ingreso de mercadería
        </Link>
        <Link className={ENTRY_LINK} to="/egreso">
          Egreso y picking
        </Link>
      </div>
    </section>
  );
}
