import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page">
      <h1>Página no encontrada</h1>
      <p>La dirección solicitada no existe.</p>
      <Link className="entry-link" to="/">
        Volver al panel de control
      </Link>
    </section>
  );
}
