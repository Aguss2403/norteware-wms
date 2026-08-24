// Trazabilidad (módulo, Fase 3): historial de movimientos (kardex simple).
// Lee el log real del estado dinámico (store) y lo muestra ordenado (los
// movimientos ya llegan de más reciente a más viejo). Copy en español neutro.

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useClient } from '../context/ClientContext.jsx';
import { skus } from '../data/skus.js';

const MONO_CELL = { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, fontSize: '0.8125rem' };

const TYPE_BADGE = {
  ingreso: 'bg-brand/12 text-brand-deep',
  egreso: 'bg-info/12 text-[#25588A]',
};

function skuName(skuId) {
  return skus.find((sku) => sku.skuId === skuId)?.name ?? skuId;
}

function timeLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function Trazabilidad() {
  const { client, movements } = useClient();

  return (
    <section className="mx-auto max-w-5xl">
      <Typography
        component="h1"
        sx={{ mb: 0.5, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'text.primary' }}
      >
        Trazabilidad
      </Typography>
      <Typography sx={{ mb: 2.5, color: 'text.secondary', fontSize: '0.85rem' }}>
        Historial de movimientos en el depósito de {client.name}.
      </Typography>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-1 pt-4">
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-text">
            Movimientos
          </h3>
          <span className="text-[11px] font-medium text-text-muted">
            {movements.length} registros
          </span>
        </div>
        <TableContainer>
          <Table size="small" aria-label="Historial de movimientos">
            <TableHead>
              <TableRow>
                {['Fecha', 'SKU', 'Producto', 'Tipo', 'Ubicación', 'Cant.', 'Operador'].map((header) => (
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
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ px: '1.25rem', py: '1.5rem', color: 'text.secondary' }}>
                    Sin movimientos todavía. Registrá un ingreso o un egreso para ver el historial.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id} hover>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.secondary' }}>
                      {timeLabel(movement.createdAt)}
                    </TableCell>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {movement.skuId}
                    </TableCell>
                    <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {skuName(movement.skuId)}
                    </TableCell>
                    <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider' }}>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_BADGE[movement.type] ?? TYPE_BADGE.ingreso}`}>
                        {movement.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </TableCell>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {movement.rackId ?? '—'}
                    </TableCell>
                    <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                      {movement.qty}
                    </TableCell>
                    <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.secondary' }}>
                      {movement.operator ?? '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </section>
  );
}
