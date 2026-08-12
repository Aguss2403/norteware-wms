// Outbound search box (spec: outbound-picking Requirement: Product search).
// Filters the seeded SKUs by code and/or name (case-insensitive) and shows
// each result's assigned-location status on the ACTIVE client's layout.
//
// Props:
//   onSelect(sku) — called when the user picks a result (owner: Egreso page).
//
// Behavior:
//   - Empty query lists the whole catalog (browse mode), status included.
//   - A query with no matches shows a no-results message and selects nothing.
//   - Selection is reported to the parent; the route decision belongs to the
//     page (spec: Product selection / Pick route display).

import { useState } from 'react';
import { useClient } from '../context/ClientContext.jsx';
import { skus } from '../data/skus.js';
import { rackStatusFor, searchSkus } from '../domain/outbound.js';

const STATUS_COPY = {
  located: (rackId) => `Estante ${rackId}`,
  'no-route': () => 'Asignado · sin ruta',
  unlocated: () => 'Sin ubicación asignada',
};

// Design D4 — static literal map so the JIT never purges status colors;
// the span base carries no text color, the variant supplies it.
const SEARCH_STATUS = {
  located: 'text-[#2f5d2a]',
  unlocated: 'text-[#8a5a0b]',
  'no-route': 'text-[#a61b1b]',
};

export default function SearchBox({ onSelect }) {
  const { layout } = useClient();
  const [query, setQuery] = useState('');

  const results = searchSkus(skus, query);
  const noMatch = query.trim() !== '' && results.length === 0;

  return (
    <div className="mt-4 flex max-w-[32rem] flex-col gap-2 rounded-lg border border-border bg-surface px-5 py-4 shadow-card">
      <label htmlFor="product-search" className="text-sm font-semibold">
        Buscar producto
      </label>
      <input
        id="product-search"
        type="search"
        value={query}
        placeholder="Código o nombre (Ej: lim, SKU-00)"
        className="min-w-0 flex-1 rounded-md border border-[#cbd5e0] bg-white px-[0.6rem] py-2 focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand/45"
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul
        className="m-0 flex list-none flex-col gap-[0.4rem] p-0"
        aria-label="Resultados de búsqueda"
      >
        {results.map((sku) => {
          const status = rackStatusFor(layout, sku);
          return (
            <li key={sku.skuId}>
              <button
                type="button"
                className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-[0.1rem] rounded-md border border-border bg-[#fbfcfd] px-3 py-[0.55rem] text-left transition-[background-color,border-color] hover:border-[#c3d4e6] hover:bg-[#eef4fb] focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand/45"
                onClick={() => onSelect(sku)}
              >
                <span className="font-semibold">{sku.name}</span>
                <span className="text-[0.8rem] text-[#7b8794]">{sku.skuId}</span>
                <span className={`col-span-full text-[0.8rem] ${SEARCH_STATUS[status.kind]}`}>
                  {STATUS_COPY[status.kind](status.rackId)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {noMatch && (
        <p className="m-0 text-sm text-[#a61b1b]" role="status">
          Sin resultados para “{query.trim()}”
        </p>
      )}
    </div>
  );
}
