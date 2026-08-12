// Warehouse map for the active client (design D1, spec: Route visualization).
// Renders the client's grid with CSS Grid. When a `route` prop is provided,
// the path reveals cell by cell (previous reveal resets first) and step /
// distance counts are shown. Renders a plain grid when no route is active.

import { useEffect, useMemo, useState } from 'react';
import { useClient } from '../context/ClientContext.jsx';

const REVEAL_STEP_MS = 150;

function cellClassName(location, isRouteCell) {
  if (isRouteCell) return 'cell cell-route';
  if (!location) return 'cell cell-empty';
  switch (location.type) {
    case 'wall':
      return 'cell cell-wall';
    case 'dock':
      return 'cell cell-dock';
    case 'rack':
      return location.productTypeId ? 'cell cell-rack' : 'cell cell-rack cell-free';
    default:
      return 'cell cell-path';
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
    <div className="warehouse-map-wrap">
      <div
        className="warehouse-map"
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
              className={cellClassName(location, isRouteCell)}
              title={cellTitle(location)}
              style={isRouteCell ? { animationDelay: `${routeIndex * REVEAL_STEP_MS}ms` } : undefined}
            >
              {cellGlyph(location)}
            </div>
          );
        })}
      </div>
      <ul className="map-legend" aria-label="Leyenda del plano">
        <li className="map-legend-item">
          <span className="map-legend-swatch map-legend-swatch-dock" /> Muelle (D)
        </li>
        <li className="map-legend-item">
          <span className="map-legend-swatch map-legend-swatch-assigned" /> Estante asignado (A)
        </li>
        <li className="map-legend-item">
          <span className="map-legend-swatch map-legend-swatch-free" /> Estante libre (L)
        </li>
        <li className="map-legend-item">
          <span className="map-legend-swatch map-legend-swatch-wall" /> Pared (#)
        </li>
        <li className="map-legend-item">
          <span className="map-legend-swatch map-legend-swatch-route" /> Ruta
        </li>
      </ul>
      <p className="map-stats" role="status">
        {hasRoute && finished
          ? `Ruta: ${route.steps} pasos · ${route.distance} tramos`
          : hasRoute
            ? 'Calculando ruta…'
            : 'Sin ruta activa'}
      </p>
    </div>
  );
}
