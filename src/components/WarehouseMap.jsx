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

function visualDockPoint(layout, profile) {
  const dock = profile.docks?.[0];
  if (dock && Number.isFinite(dock.x) && Number.isFinite(dock.y)) {
    return { x: dock.x, y: dock.y };
  }
  const location = layout.index.get(layout.dockId);
  if (!location) return null;
  const { x, y, width, height } = profile.logicalGrid;
  return {
    x: x + ((location.col + 0.5) / layout.cols) * width,
    y: y + ((location.row + 0.5) / layout.rows) * height,
  };
}

function visualDockEntrance(layout, profile) {
  const dock = profile.docks?.[0];
  if (dock?.entrance && Number.isFinite(dock.entrance.x) && Number.isFinite(dock.entrance.y)) {
    return { x: dock.entrance.x, y: dock.entrance.y };
  }
  return visualDockPoint(layout, profile);
}

function bankSlots(bank) {
  const slots = [];
  const slotWidth = bank.width / bank.columns;
  const slotHeight = bank.height / bank.rows;
  for (let index = 0; index < bank.rows * bank.columns; index += 1) {
    const row = Math.floor(index / bank.columns);
    const column = index % bank.columns;
    slots.push({
      bank,
      x: bank.x + column * slotWidth,
      y: bank.y + row * slotHeight,
      width: slotWidth,
      height: slotHeight,
      center: {
        x: bank.x + (column + 0.5) * slotWidth,
        y: bank.y + (row + 0.5) * slotHeight,
      },
    });
  }
  return slots;
}

function rackSlotMap(layout, profile) {
  const rackLocations = layout.locations.filter((location) => location.type === 'rack');
  const slots = (profile.rackBanks ?? []).flatMap(bankSlots);
  return new Map(rackLocations.map((location, index) => [location.locationId, slots[index] ?? null]));
}

function rackAccessPoint(slot) {
  const { bank } = slot;
  const gap = bank.accessGap ?? 8;
  const side = bank.accessSide ?? 'bottom';
  if (side === 'top') return { x: slot.center.x, y: bank.y - gap };
  if (side === 'left') return { x: bank.x - gap, y: slot.center.y };
  if (side === 'right') return { x: bank.x + bank.width + gap, y: slot.center.y };
  return { x: slot.center.x, y: bank.y + bank.height + gap };
}

function pointFor(layout, locationId, profile, rackSlots) {
  const location = layout.index.get(locationId);
  if (!location) return null;
  if (locationId === layout.dockId) return visualDockEntrance(layout, profile);
  if (location.type === 'rack') {
    const slot = rackSlots?.get(locationId);
    if (!slot) return null;
    return { ...rackAccessPoint(slot), rackSlot: slot };
  }
  const routeGeometry = profile.routeGeometry;
  if (routeGeometry?.columnX?.[location.col] !== undefined && routeGeometry?.rowY?.[location.row] !== undefined) {
    return { x: routeGeometry.columnX[location.col], y: routeGeometry.rowY[location.row] };
  }
  const { x, y, width, height } = profile.logicalGrid;
  return {
    x: x + ((location.col + 0.5) / layout.cols) * width,
    y: y + ((location.row + 0.5) / layout.rows) * height,
  };
}

function pointsForRoute(layout, route, profile, rackSlots) {
  if (!Array.isArray(route?.path) || route.path.length === 0) return [];
  const points = route.path.map((locationId) => pointFor(layout, locationId, profile, rackSlots));
  return points.every(Boolean) ? points : [];
}

function rackSegment(start, end) {
  const { bank } = end.rackSlot;
  const side = bank.accessSide ?? 'bottom';
  const bankLeft = bank.x;
  const bankRight = bank.x + bank.width;
  const bankTop = bank.y;
  const bankBottom = bank.y + bank.height;
  const gap = bank.accessGap ?? 8;
  const sideX = start.x <= (bankLeft + bankRight) / 2 ? bankLeft - gap : bankRight + gap;
  const sideY = start.y <= (bankTop + bankBottom) / 2 ? bankTop - gap : bankBottom + gap;

  if (side === 'top') {
    return start.y > bankTop ? `H ${sideX} V ${end.y} H ${end.x}` : `V ${end.y} H ${end.x}`;
  }
  if (side === 'left') {
    return start.x > bankLeft ? `V ${sideY} H ${end.x} V ${end.y}` : `H ${end.x} V ${end.y}`;
  }
  if (side === 'right') {
    return start.x < bankRight ? `V ${sideY} H ${end.x} V ${end.y}` : `H ${end.x} V ${end.y}`;
  }
  return start.y < bankBottom ? `H ${sideX} V ${end.y} H ${end.x}` : `H ${end.x} V ${end.y}`;
}

function orthogonalPath(points) {
  if (points.length === 0) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (current.rackSlot) {
      path += ` ${rackSegment(previous, current)}`;
    } else if (previous.x === current.x) {
      path += ` V ${current.y}`;
    } else if (previous.y === current.y) {
      path += ` H ${current.x}`;
    } else {
      path += ` H ${current.x} V ${current.y}`;
    }
  }
  return path;
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

function RouteLaneLayer({ routeLanes }) {
  return (
    <g aria-label="Corredores de circulación" role="group">
      {routeLanes.map((lane) => {
        const isHorizontal = lane.orientation === 'horizontal';
        const x1 = isHorizontal ? lane.x1 : lane.x;
        const y1 = isHorizontal ? lane.y : lane.y1;
        const x2 = isHorizontal ? lane.x2 : lane.x;
        const y2 = isHorizontal ? lane.y : lane.y2;
        return (
          <g key={lane.id} aria-label={lane.label} role="group">
            <title>{lane.label}</title>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1d3c29" strokeWidth="26" strokeLinecap="round" strokeOpacity="0.52" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6a8a72" strokeWidth="1" strokeDasharray="2 10" strokeLinecap="round" strokeOpacity="0.7" />
          </g>
        );
      })}
    </g>
  );
}

function RackAccessMarker({ slot }) {
  const { bank } = slot;
  const side = bank.accessSide ?? 'bottom';
  if (side === 'top') return <line x1={slot.center.x} y1={bank.y} x2={slot.center.x} y2={bank.y - 6} stroke="#6a8a72" strokeWidth="2" />;
  if (side === 'left') return <line x1={bank.x} y1={slot.center.y} x2={bank.x - 6} y2={slot.center.y} stroke="#6a8a72" strokeWidth="2" />;
  if (side === 'right') return <line x1={bank.x + bank.width} y1={slot.center.y} x2={bank.x + bank.width + 6} y2={slot.center.y} stroke="#6a8a72" strokeWidth="2" />;
  return <line x1={slot.center.x} y1={bank.y + bank.height} x2={slot.center.x} y2={bank.y + bank.height + 6} stroke="#6a8a72" strokeWidth="2" />;
}

function RackLayer({ layout, profile }) {
  const rackLocations = layout.locations.filter((location) => location.type === 'rack');
  const rackSlots = rackSlotMap(layout, profile);
  let rackOffset = 0;

  return (
    <g aria-label="Estantes del almacén" role="group">
      {(profile.rackBanks ?? []).map((bank) => {
        const slots = bankSlots(bank);
        const bankLocations = rackLocations.slice(rackOffset, rackOffset + slots.length);
        rackOffset += slots.length;
        return (
          <g key={bank.id} aria-label={`${bank.label}, ${bank.aisleLabel}`} role="group">
            <title>{`${bank.label}, ${bank.aisleLabel}`}</title>
            <rect x={bank.x} y={bank.y} width={bank.width} height={bank.height} rx="4" fill={COLORS.surface} stroke={COLORS.border} strokeWidth="2" />
            <text x={bank.x} y={bank.y - 8} fill={COLORS.text} fontSize="10" fontWeight="700" letterSpacing="0.8">
              {bank.aisleLabel}
            </text>
            {slots.map((slot, index) => {
              const location = bankLocations[index];
               if (!location) {
                 return (
                   <g key={`${bank.id}-empty-${index}`}>
                     <rect x={slot.x + 3} y={slot.y + 3} width={slot.width - 6} height={slot.height - 6} fill={COLORS.rackFree} fillOpacity="0.35" stroke={COLORS.border} />
                     <RackAccessMarker slot={slot} />
                   </g>
                 );
               }
              if (!rackSlots.get(location.locationId)) return null;
              const assigned = Boolean(location.productTypeId);
              const rackLabel = assigned ? profile.rack.assignedLabel : profile.rack.freeLabel;
              const title = assigned
                ? `${profile.rack.label} ${location.locationId} — ${rackLabel} — ${location.productTypeId}`
                : `${profile.rack.label} ${location.locationId} — ${rackLabel}`;
              const slotStyle = assigned ? COLORS.rack : COLORS.rackFree;
              const statusColor = assigned ? '#b9e5c5' : COLORS.route;
              return (
                <g key={location.locationId} aria-label={title} role="group">
                   <title>{title}</title>
                   <rect x={slot.x + 3} y={slot.y + 3} width={slot.width - 6} height={slot.height - 6} fill={slotStyle} stroke={assigned ? '#3fb950' : COLORS.route} strokeWidth="1.5" />
                   <rect x={slot.x + 3} y={slot.y + 3} width="4" height={slot.height - 6} fill={assigned ? '#3fb950' : COLORS.route} />
                   <RackAccessMarker slot={slot} />
                   <text x={slot.center.x} y={slot.center.y - 6} fill={COLORS.text} fontSize="8" fontWeight="700" textAnchor="middle">
                    {location.locationId}
                  </text>
                  <text x={slot.center.x} y={slot.center.y + 8} fill={statusColor} fontSize="7" fontWeight="700" textAnchor="middle">
                    {rackLabel}
                  </text>
                </g>
              );
            })}
            {Array.from({ length: bank.rows - 1 }).map((_, index) => {
              const shelfY = bank.y + ((index + 1) / bank.rows) * bank.height;
              return <line key={`${bank.id}-row-${shelfY}`} x1={bank.x} y1={shelfY} x2={bank.x + bank.width} y2={shelfY} stroke={COLORS.border} strokeWidth="2" />;
            })}
            {Array.from({ length: bank.columns - 1 }).map((_, index) => {
              const dividerX = bank.x + ((index + 1) / bank.columns) * bank.width;
              return <line key={`${bank.id}-column-${dividerX}`} x1={dividerX} y1={bank.y} x2={dividerX} y2={bank.y + bank.height} stroke={COLORS.border} />;
            })}
            {Array.from({ length: profile.rack.shelfLines }).map((_, index) => {
              const shelfY = bank.y + ((index + 1) / (profile.rack.shelfLines + 1)) * bank.height;
              return <line key={`${bank.id}-shelf-${shelfY}`} x1={bank.x + 7} y1={shelfY} x2={bank.x + bank.width - 7} y2={shelfY} stroke={COLORS.border} strokeOpacity="0.8" />;
            })}
          </g>
        );
      })}
    </g>
  );
}

function DockLayer({ layout, profile }) {
  const point = visualDockPoint(layout, profile);
  const entrance = visualDockEntrance(layout, profile);
  const dock = profile.docks[0];
  if (!point || !dock) return null;
  return (
    <g aria-label={`${dock.label} de recepción`} role="group">
       <title>{`${dock.label} de recepción`}</title>
       <rect x={point.x - 35} y={point.y - 30} width="70" height="60" rx="6" fill={COLORS.brand} fillOpacity="0.9" stroke="#6ac487" strokeWidth="2" />
       <path d={`M ${point.x - 20} ${point.y - 13} H ${point.x + 20} M ${point.x - 20} ${point.y} H ${point.x + 20} M ${point.x - 20} ${point.y + 13} H ${point.x + 20}`} stroke="#a8e4b9" strokeWidth="2" />
       <path d={`M ${point.x} ${point.y + 30} V ${entrance.y}`} stroke="#6a8a72" strokeWidth="3" strokeDasharray="3 5" />
       <circle cx={entrance.x} cy={entrance.y} r="5" fill={COLORS.routeDark} stroke="#a8e4b9" strokeWidth="2" />
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
  const pathData = orthogonalPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <g aria-label="Ruta operativa" role="group">
      <title>Ruta calculada desde el muelle hasta el estante</title>
      <path d={pathData} fill="none" stroke={COLORS.routeDark} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathData} fill="none" stroke={COLORS.route} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={first.x} cy={first.y} r="10" fill={COLORS.brand} stroke={COLORS.text} strokeWidth="2" />
      <text x={first.x + 16} y={first.y - 14} fill={COLORS.text} fontSize="11" fontWeight="700">INICIO · MUELLE</text>
      {finished && (
        <>
           <circle cx={last.x} cy={last.y} r="10" fill={COLORS.route} fillOpacity="0.25" stroke={COLORS.route} strokeWidth="3" />
           <path d={`M ${last.x - 6} ${last.y} H ${last.x + 6} M ${last.x} ${last.y - 6} V ${last.y + 6}`} stroke={COLORS.text} strokeWidth="2" />
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
    ['border border-[#61706a]', 'PASILLO · CIRCULACIÓN'],
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
  const rackSlots = useMemo(() => rackSlotMap(layout, profile), [layout, profile]);
  const projectedRoute = useMemo(() => pointsForRoute(layout, route, profile, rackSlots), [layout, profile, rackSlots, route]);
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
               Mapa operativo con seis zonas, estantes, corredores, muelles y puertas del almacén activo de {client.name}. La ruta se calcula desde la entrada del muelle hasta el acceso del estante destino.
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
             <RouteLaneLayer routeLanes={profile.routeLanes ?? []} />
             <AisleLayer aisles={profile.aisles} />
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
