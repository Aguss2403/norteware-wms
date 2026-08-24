// Presentational movements table (spec: dashboard-overview Movements table,
// design D4). Pure component fed via props: a full-width MUI Table with mono
// SKU/location cells, Inter product names, an ingreso/egreso badge, and the
// time. No backend call — rows come from the dashboard data module.

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const TYPE_BADGE = {
  ingreso: 'bg-brand/12 text-brand-deep',
  egreso: 'bg-info/12 text-[#25588A]',
};

const MONO_CELL = { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500, fontSize: '0.8125rem' };

export default function MovementsTable({ movements = [] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-1 pt-4">
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-text">
          Últimos movimientos
        </h3>
        <span className="text-[11px] font-medium text-text-muted">
          {movements.length} movimientos
        </span>
      </div>

      <TableContainer>
        <Table size="small" aria-label="Últimos movimientos del almacén activo">
          <TableHead>
            <TableRow>
              {['SKU', 'Producto', 'Ubicación', 'Tipo', 'Hora'].map((header) => (
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
                <TableCell colSpan={5} sx={{ px: '1.25rem', py: '1.5rem', color: 'text.secondary' }}>
                  Sin movimientos todavía. Registrá un ingreso o un egreso para ver el historial.
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={`${movement.skuId}-${movement.time}`} hover>
                  <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                    {movement.skuId}
                  </TableCell>
                  <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                    {movement.productName}
                  </TableCell>
                  <TableCell sx={{ ...MONO_CELL, px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.primary' }}>
                    {movement.location}
                  </TableCell>
                  <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider' }}>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        TYPE_BADGE[movement.type] ?? TYPE_BADGE.ingreso
                      }`}
                    >
                      {movement.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </TableCell>
                  <TableCell sx={{ px: '1.25rem', py: '0.6875rem', borderColor: 'divider', color: 'text.secondary' }}>
                    {movement.time}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}