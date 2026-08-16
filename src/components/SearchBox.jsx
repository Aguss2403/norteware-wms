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
//
// Design D5: MUI TextField + custom List of ListItemButtons; SEARCH_STATUS is
// remapped to the light theme's state tokens (success/warning/error); searchSkus
// and rackStatusFor are reused unchanged, so empty-query browse parity holds.
// SKU/status codes render in IBM Plex Mono (design: mono codes).

import { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useClient } from '../context/ClientContext.jsx';
import { skus } from '../data/skus.js';
import { rackStatusFor, searchSkus } from '../domain/outbound.js';

const STATUS_COPY = {
  located: (rackId) => `Estante ${rackId}`,
  'no-route': () => 'Asignado · sin ruta',
  unlocated: () => 'Sin ubicación asignada',
};

// Design D5 — SEARCH_STATUS remapped to the light theme's status tokens
// (success/warning/error) so the status rows follow theme palette state.
const SEARCH_STATUS = {
  located: 'success.main',
  unlocated: 'warning.main',
  'no-route': 'error.main',
};

export default function SearchBox({ onSelect }) {
  const { layout } = useClient();
  const [query, setQuery] = useState('');

  const results = searchSkus(skus, query);
  const noMatch = query.trim() !== '' && results.length === 0;

  return (
    <div className="mt-4 flex max-w-[32rem] flex-col gap-2 rounded-2xl border border-border bg-card px-5 py-4 shadow-card">
      <TextField
        id="product-search"
        type="search"
        label="Buscar producto"
        placeholder="Código o nombre (Ej: lim, SKU-00)"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        InputProps={{ sx: { fontFamily: '"IBM Plex Mono", monospace' } }}
      />
      <List
        aria-label="Resultados de búsqueda"
        disablePadding
        sx={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
      >
        {results.map((sku) => {
          const status = rackStatusFor(layout, sku);
          return (
            <ListItem key={sku.skuId} disablePadding>
              <ListItemButton
                onClick={() => onSelect(sku)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.1rem',
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {sku.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500 }}
                  >
                    {sku.skuId}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: SEARCH_STATUS[status.kind], fontFamily: '"IBM Plex Mono", monospace' }}
                >
                  {STATUS_COPY[status.kind](status.rackId)}
                </Typography>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {noMatch && (
        <Typography variant="body2" color="error" role="status">
          Sin resultados para “{query.trim()}”
        </Typography>
      )}
    </div>
  );
}
