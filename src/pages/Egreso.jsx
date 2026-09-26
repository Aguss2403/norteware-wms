// Outbound page (spec: outbound-picking, Phase 4 multi-line orders + remito).
//
// Flow: search -> add SKUs to a "pedido en curso" (each line = SKU + qty),
// "Preparar pedido" resolves every line (rack + route + status) via
// resolveOrder, then "Confirmar picking" records the egreso movements
// (with the selected operator) and emits a remito de despacho. A 1-line order
// is just a single pick. Copy en español neutro; códigos en mono.

import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { useClient } from '../context/ClientContext.jsx';
import { resolveOrder } from '../domain/order.js';
import SearchBox from '../components/SearchBox.jsx';
import OperatorSelect, { OPERATORS } from '../components/OperatorSelect.jsx';
import WarehouseMap from '../components/WarehouseMap.jsx';

const LINE_STATUS = {
  ok: { label: 'Listo', className: 'bg-brand/12 text-brand-deep' },
  'no-stock': { label: 'Sin ubicación', className: 'bg-danger/12 text-[#A83530]' },
  empty: { label: 'Stock insuficiente', className: 'bg-warning/14 text-[#96690F]' },
  'no-route': { label: 'Sin ruta', className: 'bg-danger/12 text-[#A83530]' },
};

let remitoSeq = 0;
function nextRemitoNumber() {
  remitoSeq += 1;
  return `R-${String(remitoSeq).padStart(4, '0')}`;
}

function formatDateTime(date) {
  return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Egreso() {
  const { client, layout, stock, recordOrderOutbound } = useClient();
  const [lines, setLines] = useState([]);
  const [pickResult, setPickResult] = useState(null);
  const [remito, setRemito] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [operator, setOperator] = useState(OPERATORS[0]);

  // Reset the picking session when the active client changes.
  useEffect(() => {
    setLines([]);
    setPickResult(null);
    setRemito(null);
    setActiveRoute(null);
  }, [layout.clientId]);

  function addToOrder(sku) {
    setLines((prev) => {
      const existing = prev.find((line) => line.sku.skuId === sku.skuId);
      if (existing) {
        return prev.map((line) =>
          line.sku.skuId === sku.skuId ? { ...line, qty: line.qty + 1 } : line
        );
      }
      return [...prev, { sku, qty: 1 }];
    });
    setPickResult(null);
    setRemito(null);
    setActiveRoute(null);
  }

  function changeQty(skuId, delta) {
    setLines((prev) =>
      prev.map((line) =>
        line.sku.skuId === skuId ? { ...line, qty: Math.max(1, line.qty + delta) } : line
      )
    );
    setPickResult(null);
    setRemito(null);
  }

  function removeLine(skuId) {
    setLines((prev) => prev.filter((line) => line.sku.skuId !== skuId));
    setPickResult(null);
    setRemito(null);
  }

  function prepare() {
    const result = resolveOrder(layout, stock, lines);
    setPickResult(result);
    setRemito(null);
    setActiveRoute(result.route);
  }

  function confirm() {
    const picked = pickResult.okLines.map((line) => ({
      sku: line.sku,
      rackId: line.rack.locationId,
      qty: line.qty,
    }));
    const units = picked.reduce((sum, line) => sum + line.qty, 0);
    recordOrderOutbound(picked, operator);
    setRemito({
      number: nextRemitoNumber(),
      date: new Date(),
      operator,
      lines: picked.map((line) => ({ skuId: line.sku.skuId, name: line.sku.name, qty: line.qty })),
      units,
    });
    setLines([]);
    setPickResult(null);
    setActiveRoute(null);
  }

  const orderEmpty = lines.length === 0;

  return (
    <section className="mx-auto max-w-5xl">
      <Typography
        component="h1"
        sx={{
          mb: 2.5,
          fontSize: '1.5rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'text.primary',
        }}
      >
        Egreso y picking
      </Typography>

      <SearchBox onSelect={addToOrder} />

      {/* Pedido en curso */}
      {!orderEmpty && !pickResult && (
        <section className="mt-4 max-w-[32rem] rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-text">Pedido en curso</h2>
            <span className="text-[11px] font-medium text-text-muted">{lines.length} líneas</span>
          </div>
          <ul className="mt-3 flex flex-col gap-1" aria-label="Líneas del pedido">
            {lines.map(({ sku, qty }) => (
              <li key={sku.skuId} className="flex items-center justify-between gap-2 py-1">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium text-text">{sku.name}</div>
                  <div className="font-mono-ui text-[11px] text-text-muted">{sku.skuId}</div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton size="small" aria-label={`Restar ${sku.name}`} onClick={() => changeQty(sku.skuId, -1)}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <span className="w-6 text-center font-mono-ui text-[13px] font-medium">{qty}</span>
                  <IconButton size="small" aria-label={`Sumar ${sku.name}`} onClick={() => changeQty(sku.skuId, 1)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label={`Quitar ${sku.name}`} onClick={() => removeLine(sku.skuId)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="contained" sx={{ mt: 3 }} onClick={prepare}>
            Preparar pedido
          </Button>
        </section>
      )}

      {/* Lista de picking */}
      {pickResult && (
        <section className="mt-4 max-w-[32rem] rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-text">Lista de picking</h2>
            <span className="text-[11px] font-medium text-text-muted">
              {pickResult.okLines.length} de {pickResult.lines.length} líneas listas
            </span>
          </div>
          <ul className="mt-3 flex flex-col gap-1" aria-label="Líneas de picking">
            {pickResult.lines.map((line) => {
              const status = LINE_STATUS[line.status] ?? LINE_STATUS['no-stock'];
              return (
                <li key={line.sku.skuId} className="flex items-center justify-between gap-2 py-1">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-medium text-text">{line.sku.name}</div>
                    <div className="font-mono-ui text-[11px] text-text-muted">
                      {line.qty} × {line.rack ? `estante ${line.rack.locationId}` : '—'}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
          {pickResult.okLines.length > 0 && (
            <div className="mt-3 text-[12.5px] text-text-muted">
              Total: <span className="font-mono-ui">{pickResult.totalSteps} pasos</span> ·{' '}
              <span className="font-mono-ui">{pickResult.totalDistance} tramos</span>
            </div>
          )}
          {pickResult.route && (
            <p className="mt-2 text-[12.5px] text-text-muted">
              Ruta: Despacho{' '}
              {pickResult.route.stops
                .filter((stop) => stop.kind === 'pick')
                .map((stop) => `→ Estante ${stop.locationId}`)
                .join(' ')}{' '}
              → Despacho
            </p>
          )}
          {pickResult.okLines.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <OperatorSelect value={operator} onChange={setOperator} />
              <Button variant="contained" onClick={confirm}>
                Confirmar picking
              </Button>
            </div>
          )}
          {pickResult.okLines.length === 0 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              Ninguna línea se puede preparar: revisá el stock o las ubicaciones.
            </Alert>
          )}
        </section>
      )}

      {/* Remito de despacho */}
      {remito && (
        <section className="mt-4 max-w-[32rem] rounded-2xl border border-border bg-card p-5 shadow-card" role="status">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-text">
              Remito de despacho {remito.number}
            </h2>
            <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
              Despachado
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[12.5px]">
            <dt className="text-text-muted">Cliente</dt>
            <dd className="text-right font-medium text-text">{client.name}</dd>
            <dt className="text-text-muted">Fecha</dt>
            <dd className="text-right font-mono-ui text-text">{formatDateTime(remito.date)}</dd>
            <dt className="text-text-muted">Operador</dt>
            <dd className="text-right text-text">{remito.operator}</dd>
          </dl>
          <div className="mt-3 border-t border-border pt-3">
            <ul className="flex flex-col gap-1">
              {remito.lines.map((line) => (
                <li key={line.skuId} className="flex items-center justify-between text-[13px]">
                  <span className="truncate text-text">{line.name}</span>
                  <span className="font-mono-ui text-text-muted">
                    {line.skuId} · ×{line.qty}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[13px] font-medium text-text">
              <span>Total</span>
              <span className="font-mono-ui">{remito.units} unidades</span>
            </div>
          </div>
        </section>
      )}

      <WarehouseMap route={activeRoute} />
    </section>
  );
}
