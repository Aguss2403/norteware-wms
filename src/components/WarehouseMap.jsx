// Industrial SVG floorplan for the active client (spec: warehouse-layouts).
// The logical layout and ordered route remain the only behavioral sources.

import { useEffect, useMemo, useState } from 'react';
import { useClient } from '../context/ClientContext.jsx';
import { warehouseVisuals } from '../data/warehouseVisuals.js';

const REVEAL_STEP_MS = 150;
const COLORS = {
  background: '#0d1117',
  surface: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
  muted: '#8b949e',
  brand: '#0d542b',
  route: '#449b62',
  routeDark: '#08140d',
  rack: '#14261d',
  rackFree: '#101f16',
  wall: '#21262d',
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.('change', update);
    return () => mediaQuery.removeEventListener?.('change', update);
  }, []);

  return prefersReducedMotion;
}

function pointFor(layout, locationId, profile) {
  const location = layout.index.get(locationId);
  if (!location) return null;
  const { x, y, width, height } = profile.logicalGrid;
  return {
    x: x + ((location.col + 0.5) / layout.cols) * width,
    y: y + ((location.row + 0.5) / layout.rows) * height,
  };
}

function pointsForRoute(layout, route, profile) {
  if (!Array.isArray(route?.path) || route.path.length === 0) return [];
  const points = route.path.map((locationId) => pointFor(layout, locationId, profile));
  return points.every(Boolean) ? points : [];
}

function zoneFill(tone) {
  return tone === 'amber' ? '#59451d' : '#164e32';
}

function ZoneLayer({ zones, mapId }) {
  return (
    <g aria-label="Zonas operativas" role="group">
      {zones.map((zone) => {
        const labelId = `${mapId}-zone-${zone.id}`;
        return (
          <g key={zone.id} aria-labelledby={labelId} role="group">
            <title id={labelId}>{zone.label}</title>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              rx="10"
              fill={zoneFill(zone.tone)}
              fillOpacity="0.2"
              stroke={zone.tone === 'amber' ? '#9a7a35' : COLORS.brand}
              strokeDasharray="5 7"
              strokeWidth="1.5"
            />
            <text x={zone.x + 16} y={zone.y + 26} fill={COLORS.text} fontSize="13" fontWeight="700" letterSpacing="1.1">
              {zone.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function AisleLayer({ aisles }) {
  return (
    <g aria-label="Pasillos operativos" role="group">
      {aisles.map((aisle) => {
        const isHorizontal = aisle.orientation === 'horizontal';
        const x1 = isHorizontal ? aisle.x : aisle.x + aisle.width / 2;
        const y1 = isHorizontal ? aisle.y + aisle.height / 2 : aisle.y;
        const x2 = isHorizontal ? aisle.x + aisle.width : x1;
        const y2 = isHorizontal ? y1 : aisle.y + aisle.height;
        return (
          <g key={aisle.id} aria-label={aisle.label} role="group">
            <title>{aisle.label}</title>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#61706a" strokeDasharray="2 8" strokeWidth="1" />
            <text
              x={isHorizontal ? aisle.x : x1 + 8}
              y={isHorizontal ? aisle.y - 7 : aisle.y + 15}
              fill={COLORS.muted}
              fontSize="11"
              fontWeight="700"
              letterSpacing="1"
            >
              {aisle.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function RackLayer({ layout, profile }) {
  const rackLocations = layout.locations.filter((location) => location.type === 'rack');
  const cellWidth = profile.logicalGrid.width / layout.cols;
  const cellHeight = profile.logicalGrid.height / layout.rows;
  const rackWidth = Math.min(cellWidth * 0.78, 94);
  const rackHeight = Math.min(cellHeight * 0.68, 48);

  return (
    <g aria-label="Estantes del almacén" role="group">
      {rackLocations.map((location) => {
        const point = pointFor(layout, location.locationId, profile);
        const assigned = Boolean(location.productTypeId);
        const rackLabel = assigned ? profile.rack.assignedLabel : profile.rack.freeLabel;
        const title = assigned
          ? `${profile.rack.label} ${location.locationId} — ${rackLabel} — ${location.productTypeId}`
          : `${profile.rack.label} ${location.locationId} — ${rackLabel}`;
        const rackX = point.x - rackWidth / 2;
        const rackY = point.y - rackHeight / 2;
        return (
          <g key={location.locationId} aria-label={title} role="group">
            <title>{title}</title>
            <rect
              x={rackX}
              y={rackY}
              width={rackWidth}
              height={rackHeight}
              rx="3"
              fill={assigned ? COLORS.rack : COLORS.rackFree}
              stroke={assigned ? '#3fb950' : COLORS.route}
              strokeWidth="1.5"
            />
            <rect x={rackX} y={rackY} width="4" height={rackHeight} fill={assigned ? '#3fb950' : COLORS.route} />
            {Array.from({ length: profile.rack.shelfLines }).map((_, index) => {
              const shelfY = rackY + ((index + 1) / (profile.rack.shelfLines + 1)) * rackHeight;
              return <line key={shelfY} x1={rackX + 8} y1={shelfY} x2={rackX + rackWidth - 7} y2={shelfY} stroke={COLORS.border} />;
            })}
            <text x={point.x} y={point.y - 2} fill={COLORS.text} fontSize="9" fontWeight="700" textAnchor="middle">
              {profile.rack.label}
            </text>
            <text x={point.x} y={point.y + 10} fill={assigned ? '#b9e5c5' : COLORS.route} fontSize="8" fontWeight="700" textAnchor="middle">
              {rackLabel}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function WallLayer({ layout, profile }) {
  const cellWidth = profile.logicalGrid.width / layout.cols;
  const cellHeight = profile.logicalGrid.height / layout.rows;
  return (
    <g aria-label="Paredes" role="group">
      {layout.locations.filter((location) => location.type === 'wall').map((location) => {
        const point = pointFor(layout, location.locationId, profile);
        return (
          <rect
            key={location.locationId}
            x={point.x - cellWidth / 2}
            y={point.y - cellHeight / 2}
            width={cellWidth}
            height={cellHeight}
            fill={COLORS.wall}
            stroke="#3b434c"
            strokeWidth="2"
          />
        );
      })}
    </g>
  );
}

function DockLayer({ layout, profile }) {
  const point = pointFor(layout, layout.dockId, profile);
  const dock = profile.docks[0];
  if (!point || !dock) return null;
  return (
    <g aria-label={`${dock.label} de recepción`} role="group">
      <title>{`${dock.label} de recepción`}</title>
      <rect x={point.x - 35} y={point.y - 30} width="70" height="60" rx="6" fill={COLORS.brand} fillOpacity="0.9" stroke="#6ac487" strokeWidth="2" />
      <path d={`M ${point.x - 20} ${point.y - 13} H ${point.x + 20} M ${point.x - 20} ${point.y} H ${point.x + 20} M ${point.x - 20} ${point.y + 13} H ${point.x + 20}`} stroke="#a8e4b9" strokeWidth="2" />
      <text x={point.x + dock.labelDx} y={point.y + dock.labelDy} fill={COLORS.text} fontSize="13" fontWeight="700" letterSpacing="1">
        {dock.label}
      </text>
    </g>
  );
}

function DoorLayer({ doors }) {
  return (
    <g aria-label="Puertas de circulación" role="group">
      {doors.map((door) => (
        <g key={door.id} aria-label={door.label} role="group">
          <title>{door.label}</title>
          <rect x={door.x} y={door.y} width={door.width} height={door.height} rx="3" fill={COLORS.surface} stroke="#9aa4ad" strokeWidth="2" />
          <path d={`M ${door.x + 10} ${door.y + door.height / 2} H ${door.x + door.width - 10}`} stroke={COLORS.muted} strokeDasharray="4 4" />
          <text x={door.x + door.width / 2} y={door.y + door.height + 15} fill={COLORS.muted} fontSize="10" fontWeight="700" textAnchor="middle">
            {door.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function CueLayer({ cues }) {
  return (
    <g aria-hidden="true">
      {cues.map((cue) => (
        <g key={cue.kind} transform={`translate(${cue.x} ${cue.y})`}>
          {cue.kind === 'truck' && (
            <>
              <rect x="-24" y="-10" width="32" height="19" rx="2" fill="#768391" />
              <path d="M 8 -7 H 19 L 25 1 V 9 H 8 Z" fill="#aeb8c2" />
              <circle cx="-14" cy="11" r="4" fill="#0d1117" stroke="#aeb8c2" strokeWidth="2" />
              <circle cx="17" cy="11" r="4" fill="#0d1117" stroke="#aeb8c2" strokeWidth="2" />
            </>
          )}
          {cue.kind === 'forklift' && (
            <>
              <rect x="-15" y="-14" width="23" height="21" rx="2" fill="#c48a3a" />
              <rect x="-11" y="-23" width="13" height="10" fill="#f0b85c" />
              <path d="M 8 -20 V 10 M 8 7 H 26" stroke="#f0b85c" strokeWidth="3" />
              <circle cx="-9" cy="10" r="4" fill="#0d1117" stroke="#f0b85c" strokeWidth="2" />
              <circle cx="9" cy="10" r="4" fill="#0d1117" stroke="#f0b85c" strokeWidth="2" />
            </>
          )}
          {cue.kind === 'pallet' && (
            <>
              <rect x="-24" y="-15" width="48" height="10" fill="#bd8b4b" stroke="#e2b66f" />
              <rect x="-24" y="-3" width="48" height="10" fill="#a87238" stroke="#e2b66f" />
              <path d="M -24 12 H 24 M -16 7 V 15 M 0 7 V 15 M 16 7 V 15" stroke="#e2b66f" strokeWidth="3" />
            </>
          )}
          {cue.kind === 'scanner' && (
            <>
              <rect x="-18" y="-16" width="34" height="22" rx="3" fill="#243943" stroke="#62b9b1" strokeWidth="2" />
              <rect x="-11" y="-10" width="20" height="9" fill="#9de2d5" />
              <path d="M -2 6 V 22 M -13 22 H 10" stroke="#62b9b1" strokeWidth="3" />
            </>
          )}
          <text y="39" fill={COLORS.muted} fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.8">
            {cue.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function RouteLayer({ points, finished }) {
  if (points.length === 0) return null;
  const pointString = points.map((point) => `${point.x},${point.y}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <g aria-label="Ruta operativa" role="group">
      <title>Ruta calculada desde el muelle hasta el estante</title>
      <polyline points={pointString} fill="none" stroke={COLORS.routeDark} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pointString} fill="none" stroke={COLORS.route} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={first.x} cy={first.y} r="10" fill={COLORS.brand} stroke={COLORS.text} strokeWidth="2" />
      <text x={first.x + 16} y={first.y - 14} fill={COLORS.text} fontSize="11" fontWeight="700">INICIO · MUELLE</text>
      {finished && (
        <>
          <circle cx={last.x} cy={last.y} r="14" fill={COLORS.route} fillOpacity="0.25" stroke={COLORS.route} strokeWidth="3" />
          <path d={`M ${last.x - 8} ${last.y} H ${last.x + 8} M ${last.x} ${last.y - 8} V ${last.y + 8}`} stroke={COLORS.text} strokeWidth="2" />
          <text x={last.x + 18} y={last.y + 5} fill={COLORS.text} fontSize="11" fontWeight="700">DESTINO · ESTANTE</text>
        </>
      )}
    </g>
  );
}

function Legend() {
  const items = [
    ['bg-brand', 'MUELLE'],
    ['bg-[#14261d]', 'ESTANTE · ASIGNADO'],
    ['bg-[#101f16]', 'ESTANTE · LIBRE'],
    ['bg-[#21262d]', 'PARED'],
    ['border border-[#9aa4ad]', 'PUERTA'],
    ['bg-[#449b62]', 'RUTA'],
  ];
  return (
    <ul className="mx-0 mb-0 mt-[0.7rem] flex list-none flex-wrap gap-x-[1.1rem] gap-y-[0.4rem] p-0 text-[0.8rem] text-text-muted" aria-label="Leyenda del plano">
      {items.map(([symbol, label]) => (
        <li key={label} className="flex items-center gap-[0.35rem] whitespace-nowrap">
          <span className={`inline-block size-[0.8rem] rounded-sm ${symbol}`} aria-hidden="true" /> {label}
        </li>
      ))}
    </ul>
  );
}

export default function WarehouseMap({ route = null }) {
  const { client, layout } = useClient();
  const profile = warehouseVisuals[layout.clientId] ?? warehouseVisuals.citrus;
  const [revealCount, setRevealCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasRoute = Boolean(route && Array.isArray(route.path) && route.path.length > 0);
  const projectedRoute = useMemo(() => pointsForRoute(layout, route, profile), [layout, profile, route]);
  const hasRenderableRoute = hasRoute && projectedRoute.length === route.path.length;
  const visibleRoute = hasRenderableRoute ? projectedRoute.slice(0, revealCount) : [];
  const mapId = `warehouse-map-${layout.clientId}`;
  const descriptionId = `${mapId}-description`;

  useEffect(() => {
    setRevealCount(0);
    setFinished(false);
    if (!hasRenderableRoute) return undefined;
    if (prefersReducedMotion) {
      setRevealCount(projectedRoute.length);
      setFinished(true);
      return undefined;
    }

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setRevealCount(index);
      if (index >= projectedRoute.length) {
        setFinished(true);
        clearInterval(timer);
      }
    }, REVEAL_STEP_MS);
    return () => clearInterval(timer);
  }, [hasRenderableRoute, layout, prefersReducedMotion, projectedRoute.length, route]);

  const status = hasRenderableRoute && finished
    ? `Ruta: ${route.steps} pasos · ${route.distance} tramos`
    : hasRoute
      ? 'Calculando ruta…'
      : 'Sin ruta activa';

  return (
    <div className="mt-6">
      <div className="max-w-[74rem] overflow-x-auto rounded-lg border border-border bg-border p-[0.375rem] shadow-card">
        <div className="min-w-[48rem]">
          <svg
            className="block h-auto w-full"
            viewBox={profile.viewBox}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-labelledby={`${mapId}-title ${descriptionId}`}
          >
            <title id={`${mapId}-title`}>Plano industrial de {client.name}</title>
            <desc id={descriptionId}>
              Mapa operativo con seis zonas, estantes, pasillos, muelles y puertas del almacén activo de {client.name}. La ruta se calcula desde el muelle hasta el estante destino.
            </desc>
            <defs>
              <pattern id={`${mapId}-floor`} width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#263039" strokeWidth="1" strokeOpacity="0.55" />
              </pattern>
            </defs>
            <rect width="1200" height="680" fill={COLORS.background} />
            <rect x="24" y="24" width="1152" height="632" rx="16" fill={COLORS.surface} stroke={COLORS.border} strokeWidth="2" />
            <rect x="42" y="78" width="1116" height="542" rx="12" fill={`url(#${mapId}-floor)`} />
            <text x="52" y="52" fill={COLORS.muted} fontSize="11" fontWeight="700" letterSpacing="2">PLANO OPERATIVO</text>
            <text x="1150" y="52" fill={COLORS.text} fontSize="15" fontWeight="700" textAnchor="end">{client.name}</text>
            <ZoneLayer zones={profile.zones} mapId={mapId} />
            <AisleLayer aisles={profile.aisles} />
            <WallLayer layout={layout} profile={profile} />
            <RackLayer layout={layout} profile={profile} />
            <DockLayer layout={layout} profile={profile} />
            <DoorLayer doors={profile.doors} />
            <CueLayer cues={profile.cues} />
            <RouteLayer points={visibleRoute} finished={finished} />
          </svg>
        </div>
      </div>
      <Legend />
      <p className="mx-0 mb-0 mt-[0.6rem] text-sm text-text-muted" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
