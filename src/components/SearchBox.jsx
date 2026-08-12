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

export default function SearchBox({ onSelect }) {
  const { layout } = useClient();
  const [query, setQuery] = useState('');

  const results = searchSkus(skus, query);
  const noMatch = query.trim() !== '' && results.length === 0;

  return (
    <div className="search-box">
      <label htmlFor="product-search">Buscar producto</label>
      <input
        id="product-search"
        type="search"
        value={query}
        placeholder="Código o nombre (Ej: lim, SKU-00)"
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul className="search-results" aria-label="Resultados de búsqueda">
        {results.map((sku) => {
          const status = rackStatusFor(layout, sku);
          return (
            <li key={sku.skuId}>
              <button
                type="button"
                className="search-result"
                onClick={() => onSelect(sku)}
              >
                <span className="search-result-name">{sku.name}</span>
                <span className="search-result-code">{sku.skuId}</span>
                <span className={`search-result-status search-result-status-${status.kind}`}>
                  {STATUS_COPY[status.kind](status.rackId)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {noMatch && (
        <p className="search-empty" role="status">
          Sin resultados para “{query.trim()}”
        </p>
      )}
    </div>
  );
}
