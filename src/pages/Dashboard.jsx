import { Link } from 'react-router-dom';
import { useClient } from '../context/ClientContext.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

export default function Dashboard() {
  const { client, layout } = useClient();

  const racks = layout.locations.filter((location) => location.type === 'rack');
  const freeRacks = racks.filter((location) => !location.productTypeId);
  const storedTypes = [...new Set(racks.map((location) => location.productTypeId).filter(Boolean))];

  return (
    <section className="page">
      <h1>Panel de control</h1>
      <div className="summary-card">
        <h2>{client.name}</h2>
        <p>
          Almacén de {layout.rows} × {layout.cols} celdas · {racks.length} estantes ({freeRacks.length} libres)
        </p>
        <p>
          Tipos de producto almacenados:{' '}
          {storedTypes.length > 0 ? storedTypes.join(', ') : 'Ninguno'}
        </p>
      </div>
      <WarehouseMap />
      <div className="entry-links">
        <Link className="entry-link" to="/ingreso">
          Ingreso de mercadería
        </Link>
        <Link className="entry-link" to="/egreso">
          Egreso y picking
        </Link>
      </div>
    </section>
  );
}
