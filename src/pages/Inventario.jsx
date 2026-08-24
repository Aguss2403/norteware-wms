// Inventario (módulo, Fase 3/4): stock actual por SKU en el depósito activo.
// Deriva la ubicación de cada SKU de su tipo de producto (nearest rack del
// layout vivo) y la cantidad del estado dinámico (store). Muestra lote y
// vencimiento para los SKUs perecederos (shelfLifeDays), con alerta
// "próximo a vencer". Copy en español neutro; códigos en mono.

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useClient } from '../context/ClientContext.jsx';
import { skus, NEAR_EXPIRY_DAYS } from '../data/skus.js';
import { findNearestRackOfType } from '../domain/assign.js';

const MONO_CELL = { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, fontSize: '0.8125rem' };

function stockStatus(qty) {
  if (qty <= 0) return { label: 'Sin stock', className: 'bg-danger/12 text-[#A83530]' };
  if (qty <= 3) return { label: 'Stock bajo', className: 'bg-warning/14 text-[#96690F]' };
  return { label: 'En stock', className: 'bg-brand/12 text-brand-deep' };
}

// Expiry = today + shelfLifeDays (keeps the demo dates fresh at presentation time).
function expiryFor(sku) {
  if (!sku.shelfLifeDays) return null;
  const date = new Date();
  date.setDate(date.getDate() + sku.shelfLifeDays);
  return date;
}

function formatDate(date) {
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isNearExpiry(sku) {
  return sku.shelfLifeDays != null && sku.shelfLifeDays <= NEAR_EXPIRY_DAYS;
}

export default function Inventario() {
  const { client, layout, stock } = useClient();

  const rows = skus.map((sku) => {
    const rack = findNearestRackOfType(layout, sku.productTypeId);
    return {
      sku,
      rackId: rack ? rack.locationId : null,
      qty: stock[sku.skuId] ?? 0,
    };
  });

  const columns = ['SKU', 'Producto', 'Lote', 'Vencimiento', 'Ubicación', 'Stock', 'Estado'];

  return (
    <section className="mx-auto max-w-5xl">
      <Typography
        component="h1"
        sx={{ mb: 0.5, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'text.primary' }}
      >
        Inventario
      </Typography>
      <Typography sx={{ mb: 2.5, color: 'text.secondary', fontSize: '0.85rem' }}>
        Stock actual por SKU en el depósito de {client.name}.
      </Typography>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <TableContainer>
          <Table size="small" aria-label="Inventario de SKUs">
            <TableHead>
              <TableRow>
                {columns.map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      px: '1.25rem',
                      py: '0.625rem',
                      fontSize: '11px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'text.secondary',
                      borderColor: 'divider',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ sku, rackId, qty }) => {
                const status = stockStatus(qty);
                const expiry = expiryFor(sku);
                const near = isNearExpiry(sku);
                return (
                  <TableRow key={sku.skuId} hover>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {sku.skuId}
                    </TableCell>
                    <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {sku.name}
                    </TableCell>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.secondary' }}>
                      {sku.lot ?? '—'}
                    </TableCell>
                    <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider' }}>
                      {expiry ? (
                        <span className="flex items-center gap-1.5">
                          <span className={`font-mono-ui text-[0.8125rem] ${near ? 'text-[#96690F]' : 'text-text-muted'}`}>
                            {formatDate(expiry)}
                          </span>
                          {near && (
                            <span className="rounded-full bg-warning/14 px-2 py-0.5 text-[10.5px] font-semibold text-[#96690F]">
                              Próx. a vencer
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {rackId ?? 'Sin ubicación'}
                    </TableCell>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {qty}
                    </TableCell>
                    <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider' }}>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </section>
  );
}
