import { Link } from 'react-router-dom';

// D4 static literal class — covers the old .entry-link rule (see Dashboard).
const ENTRY_LINK =
  'inline-block rounded-md bg-brand px-[1.1rem] py-[0.6rem] font-medium text-white no-underline transition-[background-color,transform] hover:-translate-y-px hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-2xl tracking-[-0.01em] text-brand">Página no encontrada</h1>
      <p className="my-4">La dirección solicitada no existe.</p>
      <Link className={ENTRY_LINK} to="/">
        Volver al panel de control
      </Link>
    </section>
  );
}
