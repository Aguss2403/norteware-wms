// Dashboard quick search (Phase 5): functional "Buscar SKU o pallet".
// Live-filter the seeded catalog and show each match's location + stock.
// Selecting a result navigates to the outbound page to pick it.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { useClient } from '../context/ClientContext.jsx';
import { skus } from '../data/skus.js';
import { searchSkus } from '../domain/outbound.js';
import { findNearestRackOfType } from '../domain/assign.js';

export default function DashboardSearch() {
  const { layout, stock } = useClient();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = query.trim() ? searchSkus(skus, query) : [];
  const showDropdown = open && query.trim() !== '';

  return (
    <div className="relative">
      <TextField
        size="small"
        placeholder="Buscar SKU o pallet…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} aria-hidden="true" />,
          sx: { width: '13rem', bgcolor: 'background.paper', fontFamily: '"IBM Plex Mono", monospace' },
        }}
        inputProps={{ 'aria-label': 'Buscar SKU o pallet' }}
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-card">
          {results.length === 0 ? (
            <div className="px-3 py-2.5 text-[13px] text-text-muted">
              Sin resultados para «{query.trim()}»
            </div>
          ) : (
            results.map((sku) => {
              const rack = findNearestRackOfType(layout, sku.productTypeId);
              const qty = stock[sku.skuId] ?? 0;
              return (
                <button
                  key={sku.skuId}
                  type="button"
                  onMouseDown={() => navigate('/app/egreso')}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-surface"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-text">{sku.name}</span>
                    <span className="block font-mono-ui text-[11px] text-text-muted">{sku.skuId}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono-ui text-[11px] text-text-muted">
                    {rack ? `Estante ${rack.locationId}` : 'Sin ubicación'} · {qty} u
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
