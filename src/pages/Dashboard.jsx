import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <section className="page">
      <h1>Panel de control</h1>
      <p>Resumen del almacén del cliente activo.</p>
      <div className="summary-card">
        <h2>Resumen del cliente</h2>
        <p className="summary-placeholder">
          El resumen del cliente (SKU y layout del almacén) estará disponible en la próxima
          entrega.
        </p>
      </div>
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
