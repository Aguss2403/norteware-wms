// Warehouse map for the active client (design D1, spec: Route visualization).
// Renders the client's grid with CSS Grid. When a `route` prop is provided,
// the path reveals cell by cell (previous reveal resets first) and step /
// distance counts are shown. Renders a plain grid when no route is active.

import { useEffect, useMemo, useState } from 'react';
import { useClient } from '../context/ClientContext.jsx';

const REVEAL_STEP_MS = 150;

// D4 static class maps — literal strings so the JIT never purges them.
// CELL_BASE carries the shared geometry; each variant owns its own bg/text
// utilities (one utility per visual property, base or variant, never both).
// 'free' = rack without productTypeId.
const CELL_BASE =
  'aspect-square flex items-center justify-center rounded-sm text-[0.72rem] font-bold leading-none min-w-0 overflow-hidden select-none transition-colors';
const CELL_VARIANTS = {
  route: 'animate-cell-reveal bg-brand-accent text-[#5c4305]',
  empty: '',
  path: 'bg-[#e9edf2]',
  dock: 'bg-brand text-white',
  wall: 'bg-[#37414b] text-[#a9b4bf]',
  rack: 'bg-[#d9c9a3] text-[#6b5624]',
  free: 'bg-[#b7d7b0] text-[#2f5d2a]',
};

function cellVariant(location, isRouteCell) {
  if (isRouteCell) return CELL_VARIANTS.route;
  if (!location) return CELL_VARIANTS.empty;
  switch (location.type) {
    case 'wall':
      return CELL_VARIANTS.wall;
    case 'dock':
      return CELL_VARIANTS.dock;
    case 'rack':
      return location.productTypeId ? CELL_VARIANTS.rack : CELL_VARIANTS.free;
    default:
      return CELL_VARIANTS.path;
  }
}

const TYPE_LABELS = { rack: 'Estante', dock: 'Muelle', wall: 'Pared', path: 'Pasillo' };

function cellTitle(location) {
  if (!location) return '';
  if (location.type === 'rack') {
    return location.productTypeId
      ? `Estante ${location.locationId} — ${location.productTypeId}`
      : `Estante libre ${location.locationId}`;
  }
  return `${TYPE_LABELS[location.type] ?? location.type} ${location.locationId}`;
}

function cellGlyph(location) {
  if (!location) return '';
  if (location.type === 'rack') return location.productTypeId ? 'A' : 'L';
  if (location.type === 'dock') return 'D';
  if (location.type === 'wall') return '#';
  return '';
}

export default function WarehouseMap({ route = null }) {
  const { layout } = useClient();
  const [revealCount, setRevealCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const cells = useMemo(() => {
    const list = [];
    for (let row = 0; row < layout.rows; row += 1) {
      for (let col = 0; col < layout.cols; col += 1) {
        list.push({ locationId: `${row}-${col}`, row, col, location: layout.index.get(`${row}-${col}`) });
      }
    }
    return list;
  }, [layout]);

  const routePosition = useMemo(() => {
    const positions = new Map();
    (route?.path ?? []).forEach((locationId, index) => positions.set(locationId, index));
    return positions;
  }, [route]);

  useEffect(() => {
    if (route && route.path && route.path.length > 0) {
      setRevealCount(0); // reset previous reveal before animating
      setFinished(false);
      let index = 0;
      const timer = setInterval(() => {
        index += 1;
        setRevealCount(index);
        if (index >= route.path.length) {
          setFinished(true);
          clearInterval(timer);
        }
      }, REVEAL_STEP_MS);
      return () => clearInterval(timer);
    }
    setRevealCount(0);
    setFinished(false);
  }, [route]);

  const hasRoute = Boolean(route && route.path && route.path.length > 0);

  return (
    <div className="mt-6">
      <div
        className="grid gap-[3px] rounded-lg border border-border bg-border p-[0.375rem] shadow-card max-w-[34rem]"
        style={{ gridTemplateColumns: `repeat(${layout.cols}, 1fr)` }}
        role="img"
        aria-label={`Plano del almacén de ${layout.rows} por ${layout.cols} celdas`}
      >
        {cells.map(({ locationId, location }) => {
          const routeIndex = routePosition.get(locationId);
          const isRouteCell = routeIndex !== undefined && routeIndex < revealCount;
          return (
            <div
              key={locationId}
              className={`${CELL_BASE} ${cellVariant(location, isRouteCell)}`}
              title={cellTitle(location)}
              style={isRouteCell ? { animationDelay: `${routeIndex * REVEAL_STEP_MS}ms` } : undefined}
            >
              {cellGlyph(location)}
            </div>
          );
        })}
      </div>
      <ul
        className="mx-0 mb-0 mt-[0.7rem] flex list-none flex-wrap gap-x-[1.1rem] gap-y-[0.4rem] p-0 text-[0.8rem] text-text-muted"
        aria-label="Leyenda del plano"
      >
        <li className="flex items-center gap-[0.35rem] whitespace-nowrap">
          <span className="size-[0.8rem] rounded-sm border border-[#10324b]/25 bg-brand" /> Muelle (D)
        </li>
        <li className="flex items-center gap-[0.35rem] whitespace-nowrap">
          <span className="size-[0.8rem] rounded-sm border border-[#10324b]/25 bg-[#d9c9a3]" /> Estante asignado (A)
        </li>
        <li className="flex items-center gap-[0.35rem] whitespace-nowrap">
          <span className="size-[0.8rem] rounded-sm border border-[#10324b]/25 bg-[#b7d7b0]" /> Estante libre (L)
        </li>
        <li className="flex items-center gap-[0.35rem] whitespace-nowrap">
          <span className="size-[0.8rem] rounded-sm border border-[#10324b]/25 bg-[#37414b]" /> Pared (#)
        </li>
        <li className="flex items-center gap-[0.35rem] whitespace-nowrap">
          <span className="size-[0.8rem] rounded-sm border border-[#10324b]/25 bg-brand-accent" /> Ruta
        </li>
      </ul>
      <p className="mx-0 mb-0 mt-[0.6rem] text-sm text-text-muted" role="status">
        {hasRoute && finished
          ? `Ruta: ${route.steps} pasos · ${route.distance} tramos`
          : hasRoute
            ? 'Calculando ruta…'
            : 'Sin ruta activa'}
      </p>
    </div>
  );
}
