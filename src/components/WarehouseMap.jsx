// Industrial SVG floorplan for the active client (spec: warehouse-layouts).
// The logical layout and ordered route remain the only behavioral sources.

import { useEffect, useMemo, useState } from 'react';
import { useClient } from '../context/ClientContext.jsx';
import { warehouseVisuals } from '../data/warehouseVisuals.js';

const REVEAL_STEP_MS = 150;
// PR3 (design D5): local palette remapped to the ink/lime family so the map
// reads as the dark hero card on the light canvas. The route projection,
// orthogonal path, reveal animation, reduced-motion, and status text stay
// untouched — only colors/labels around them change.
const COLORS = {
  background: '#0B140D',
  surface: '#132018',
  border: 'rgba(255,255,255,.10)',
  text: '#EAF6EE',
  muted: '#7C9186',
  brand: '#2FAE58',
  route: '#A8E063',
  routeDark: 'rgba(168,224,99,.18)',
  rack: '#1d3527',
  rackFree: '#16281e',
  // Family extras (risk table: map hardcoded hexes -> COLORS family):
  grid: 'rgba(255,255,255,.06)',
  zoneGreen: '#164e32',
  zoneAmber: '#59451d',
  zoneAmberStroke: '#9a7a35',
  lane: 'rgba(168,224,99,.14)',
  laneDash: 'rgba(168,224,99,.22)',
  aisle: '#61706a',
  access: '#6a8a72',
  door: '#8fa398',
  dockStroke: '#6ac487',
  dockGlyph: '#a8e4b9',
  assignedStroke: '#A8E063',
  assignedLabel: '#b9e5c5',
  freeStroke: 'rgba(168,224,99,.35)',
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

function visualDock(layout, profile, locationId) {
  return profile.docks?.find((dock) => dock.locationId === locationId) ?? null;
}

function visualDockPoint(layout, profile, locationId) {
  const dock = visualDock(layout, profile, locationId);
  if (dock && Number.isFinite(dock.x) && Number.isFinite(dock.y)) {
    return { x: dock.x, y: dock.y };
  }
  const location = layout.index.get(locationId);
  if (!location) return null;
  const { x, y, width, height } = profile.logicalGrid;
  return {
    x: x + ((location.col + 0.5) / layout.cols) * width,
    y: y + ((location.row + 0.5) / layout.rows) * height,
  };
}

function visualDockEntrance(layout, profile, locationId) {
  const dock = visualDock(layout, profile, locationId);
  if (dock?.entrance && Number.isFinite(dock.entrance.x) && Number.isFinite(dock.entrance.y)) {
    return { x: dock.entrance.x, y: dock.entrance.y };
  }
  return visualDockPoint(layout, profile, locationId);
}

function rackSlotMap(layout, profile) {
  const slots = new Map();
  for (const rackBank of profile.rackBanks ?? []) {
    const locationIds = rackBank.locationIds ?? [];
    const columns = rackBank.columns ?? locationIds.length;
    const rows = rackBank.rows ?? 1;
    const gap = 6;
    const paddingX = 8;
    const paddingY = 12;
    const slotWidth = (rackBank.width - (paddingX * 2) - (gap * (columns - 1))) / columns;
    const slotHeight = (rackBank.height - (paddingY * 2) - (gap * (rows - 1))) / rows;

    locationIds.forEach((locationId, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const bank = {
        x: rackBank.x + paddingX + column * (slotWidth + gap),
        y: rackBank.y + paddingY + row * (slotHeight + gap),
        width: slotWidth,
        height: slotHeight,
        accessSide: rackBank.accessSide,
        accessGap: rackBank.accessGap,
      };
      const center = { x: bank.x + bank.width / 2, y: bank.y + bank.height / 2 };
      slots.set(locationId, { bank, bankId: rackBank.id, x: bank.x, y: bank.y, width: bank.width, height: bank.height, center });
    });
  }
  return slots;
}

function rackAccessPoint(slot) {
  if (slot.accessPoint) return slot.accessPoint;
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
  if (location.type === 'dock') return visualDockEntrance(layout, profile, locationId);
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

function simplifyRoutePoints(points) {
  const simplified = [];
  for (const point of points) {
    const previous = simplified[simplified.length - 1];
    if (previous && previous.x === point.x && previous.y === point.y) {
      if (point.rackSlot) simplified[simplified.length - 1] = point;
      continue;
    }

    simplified.push(point);
    while (simplified.length >= 3) {
      const last = simplified.length - 1;
      const before = simplified[last - 2];
      const current = simplified[last - 1];
      const next = simplified[last];
      const sameColumn = before.x === current.x && current.x === next.x;
      const sameRow = before.y === current.y && current.y === next.y;
      if (current.rackSlot || (!sameColumn && !sameRow)) break;
      simplified.splice(last - 1, 1);
    }
  }

  const target = simplified[simplified.length - 1];
  while (target?.rackSlot && simplified.length >= 3) {
    const last = simplified.length - 1;
    const candidate = simplified[last - 2];
    const beforeTarget = simplified[last - 1];
    const sameColumn = candidate.x === beforeTarget.x;
    const sameRow = candidate.y === beforeTarget.y;
    const candidateDistance = Math.abs(candidate.x - target.x) + Math.abs(candidate.y - target.y);
    const beforeTargetDistance = Math.abs(beforeTarget.x - target.x) + Math.abs(beforeTarget.y - target.y);
    if ((!sameColumn && !sameRow) || candidateDistance >= beforeTargetDistance) break;
    simplified.splice(last - 1, 1);
  }
  return simplified;
}

function pointsForRoute(layout, route, profile, rackSlots) {
  if (!Array.isArray(route?.path) || route.path.length === 0) return [];
  const points = route.path.map((locationId) => pointFor(layout, locationId, profile, rackSlots));
  return points.every(Boolean) ? simplifyRoutePoints(points) : [];
}

function routeLocationIds(route) {
  const stops = route?.stops?.map((stop) => stop.locationId).filter(Boolean) ?? [];
  if (stops.length > 1) return stops;
  if (!Array.isArray(route?.path) || route.path.length === 0) return [];
  return [route.path[0], route.path.at(-1)];
}

function navigationPath(profile, fromLocationId, toLocationId) {
  const navigation = profile.navigation;
  const fromId = navigation?.locationNodes?.[fromLocationId];
  const toId = navigation?.locationNodes?.[toLocationId];
  if (!fromId || !toId) return null;

  const nodes = new Map(navigation.nodes.map((node) => [node.id, node]));
  const neighbours = new Map();
  for (const edge of navigation.edges) {
    neighbours.set(edge.from, [...(neighbours.get(edge.from) ?? []), edge.to]);
    neighbours.set(edge.to, [...(neighbours.get(edge.to) ?? []), edge.from]);
  }

  const queue = [fromId];
  const previous = new Map([[fromId, null]]);
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === toId) break;
    for (const neighbour of neighbours.get(current) ?? []) {
      if (!previous.has(neighbour)) {
        previous.set(neighbour, current);
        queue.push(neighbour);
      }
    }
  }
  if (!previous.has(toId)) return null;

  const nodeIds = [];
  for (let current = toId; current; current = previous.get(current)) nodeIds.unshift(current);
  return nodeIds.map((nodeId) => nodes.get(nodeId));
}

function displayRoute(layout, route, profile, rackSlots) {
  const locations = routeLocationIds(route);
  if (locations.length < 2) return { legs: [], stopPoints: new Map() };

  const legs = [];
  const stopPoints = new Map();
  for (let index = 0; index < locations.length - 1; index += 1) {
    const fromId = locations[index];
    const toId = locations[index + 1];
    const points = navigationPath(profile, fromId, toId)
      ?? pointsForRoute(layout, { path: [fromId, toId] }, profile, rackSlots);
    if (points.length === 0) continue;
    stopPoints.set(toId, points.at(-1));
    legs.push({ points, phase: index === locations.length - 2 && route?.stops?.at(-1)?.kind === 'return' ? 'return' : 'outbound' });
  }
  return { legs, stopPoints };
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
  return tone === 'amber' ? COLORS.zoneAmber : COLORS.zoneGreen;
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
              stroke={zone.tone === 'amber' ? COLORS.zoneAmberStroke : COLORS.brand}
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
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.aisle} strokeDasharray="2 8" strokeWidth="1" />
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
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.lane} strokeWidth="26" strokeLinecap="round" strokeOpacity="0.35" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.laneDash} strokeWidth="1" strokeDasharray="2 10" strokeLinecap="round" strokeOpacity="0.7" />
          </g>
        );
      })}
    </g>
  );
}

function NavigationLayer({ navigation }) {
  if (!navigation) return null;
  const nodes = new Map(navigation.nodes.map((node) => [node.id, node]));
  const labeledCorridors = new Set();
  return (
    <g aria-label="Red física de corredores" role="group">
      {navigation.edges.map((edge, index) => {
        const from = nodes.get(edge.from);
        const to = nodes.get(edge.to);
        if (!from || !to) return null;
        const showLabel = !edge.label.startsWith('Acceso') && !labeledCorridors.has(edge.label);
        if (showLabel) labeledCorridors.add(edge.label);
        return (
          <g key={`${edge.from}-${edge.to}-${index}`} aria-label={edge.label} role="group">
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={COLORS.lane} strokeWidth="20" strokeLinecap="round" strokeOpacity="0.35" />
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={COLORS.laneDash} strokeWidth="1" strokeDasharray="2 10" strokeLinecap="round" strokeOpacity="0.7" />
            {showLabel && (
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 12} fill={COLORS.muted} fontSize="9" fontWeight="700" textAnchor="middle">
                {edge.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function RackAccessMarker({ slot }) {
  const { bank } = slot;
  const side = bank.accessSide ?? 'bottom';
  if (side === 'top') return <line x1={slot.center.x} y1={bank.y} x2={slot.center.x} y2={bank.y - 6} stroke={COLORS.access} strokeWidth="2" />;
  if (side === 'left') return <line x1={bank.x} y1={slot.center.y} x2={bank.x - 6} y2={slot.center.y} stroke={COLORS.access} strokeWidth="2" />;
  if (side === 'right') return <line x1={bank.x + bank.width} y1={slot.center.y} x2={bank.x + bank.width + 6} y2={slot.center.y} stroke={COLORS.access} strokeWidth="2" />;
  return <line x1={slot.center.x} y1={bank.y + bank.height} x2={slot.center.x} y2={bank.y + bank.height + 6} stroke={COLORS.access} strokeWidth="2" />;
}

function RackLayer({ layout, profile }) {
  const rackLocations = layout.locations.filter((location) => location.type === 'rack');
  const rackSlots = rackSlotMap(layout, profile);
  return (
    <g aria-label="Estantes del almacén" role="group">
      {rackLocations.map((location) => {
        const slot = rackSlots.get(location.locationId);
        if (!slot) return null;
        const assigned = Boolean(location.productTypeId);
        const title = assigned
          ? `${profile.rack.label} ${location.locationId} — ${profile.rack.assignedLabel} — ${location.productTypeId}`
          : `${profile.rack.label} ${location.locationId} — ${profile.rack.freeLabel}`;
        return (
          <g key={location.locationId} aria-label={title} role="group">
            <title>{title}</title>
            <rect
              x={slot.x}
              y={slot.y}
              width={slot.width}
              height={slot.height}
              rx="4"
              fill={assigned ? COLORS.rack : COLORS.rackFree}
              stroke={assigned ? COLORS.assignedStroke : COLORS.freeStroke}
              strokeWidth="1.5"
            />
            <RackAccessMarker slot={slot} />
            <text x={slot.center.x} y={slot.center.y - 4} fill={COLORS.text} fontSize="8" fontWeight="700" textAnchor="middle">
              {location.locationId}
            </text>
            <text x={slot.center.x} y={slot.center.y + 8} fill={assigned ? COLORS.assignedLabel : COLORS.muted} fontSize="7" fontWeight="700" textAnchor="middle">
              {assigned ? profile.rack.assignedLabel : profile.rack.freeLabel}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function DockLayer({ layout, profile }) {
  return (
    <g aria-label="Muelles operativos" role="group">
      {profile.docks.map((dock) => {
        const point = visualDockPoint(layout, profile, dock.locationId);
        const entrance = visualDockEntrance(layout, profile, dock.locationId);
        if (!point || !entrance) return null;
        return (
          <g key={dock.id} aria-label={dock.label} role="group">
            <title>{dock.label}</title>
            <rect x={point.x - 35} y={point.y - 30} width="70" height="60" rx="6" fill={COLORS.brand} fillOpacity="0.9" stroke={COLORS.dockStroke} strokeWidth="2" />
            <path d={`M ${point.x - 20} ${point.y - 13} H ${point.x + 20} M ${point.x - 20} ${point.y} H ${point.x + 20} M ${point.x - 20} ${point.y + 13} H ${point.x + 20}`} stroke={COLORS.dockGlyph} strokeWidth="2" />
            <path d={`M ${point.x} ${point.y + 30} V ${entrance.y}`} stroke={COLORS.access} strokeWidth="3" strokeDasharray="3 5" />
            <circle cx={entrance.x} cy={entrance.y} r="5" fill={COLORS.routeDark} stroke={COLORS.dockGlyph} strokeWidth="2" />
            <text x={point.x + dock.labelDx} y={point.y + dock.labelDy} fill={COLORS.text} fontSize="13" fontWeight="700" letterSpacing="1">
              {dock.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function DoorLayer({ doors }) {
  return (
    <g aria-label="Puertas de circulación" role="group">
      {doors.map((door) => (
        <g key={door.id} aria-label={door.label} role="group">
          <title>{door.label}</title>
          <rect x={door.x} y={door.y} width={door.width} height={door.height} rx="3" fill={COLORS.surface} stroke={COLORS.door} strokeWidth="2" />
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
        <g key={cue.id ?? cue.kind} transform={`translate(${cue.x} ${cue.y})`}>
          {cue.kind === 'truck' && (
            <>
              <rect x="-24" y="-10" width="32" height="19" rx="2" fill="#768391" />
              <path d="M 8 -7 H 19 L 25 1 V 9 H 8 Z" fill="#aeb8c2" />
              <circle cx="-14" cy="11" r="4" fill={COLORS.background} stroke="#aeb8c2" strokeWidth="2" />
              <circle cx="17" cy="11" r="4" fill={COLORS.background} stroke="#aeb8c2" strokeWidth="2" />
            </>
          )}
          {cue.kind === 'forklift' && (
            <>
              <rect x="-15" y="-14" width="23" height="21" rx="2" fill="#c48a3a" />
              <rect x="-11" y="-23" width="13" height="10" fill="#f0b85c" />
              <path d="M 8 -20 V 10 M 8 7 H 26" stroke="#f0b85c" strokeWidth="3" />
              <circle cx="-9" cy="10" r="4" fill={COLORS.background} stroke="#f0b85c" strokeWidth="2" />
              <circle cx="9" cy="10" r="4" fill={COLORS.background} stroke="#f0b85c" strokeWidth="2" />
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

function RouteLayer({ legs, stops, finished }) {
  if (legs.length === 0) return null;
  const first = legs[0].points[0];
  const last = legs.at(-1).points.at(-1);
  return (
    <g aria-label="Ruta operativa" role="group">
      <title>Ruta operativa continua</title>
      {legs.map((leg, index) => {
        const color = leg.phase === 'return' ? '#f0a24b' : COLORS.route;
        const pathData = orthogonalPath(leg.points);
        return <g key={`${leg.phase}-${index}`}>
          <path d={pathData} fill="none" stroke={COLORS.routeDark} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          <path d={pathData} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </g>;
      })}
      <circle cx={first.x} cy={first.y} r="10" fill={COLORS.brand} stroke={COLORS.text} strokeWidth="2" />
      <text x={first.x + 16} y={first.y - 14} fill={COLORS.text} fontSize="11" fontWeight="700">INICIO · MUELLE</text>
      {finished && stops.filter((stop) => stop.kind === 'pick').map((stop) => (
        <g key={`${stop.order}-${stop.locationId}`}>
          <circle cx={stop.point.x} cy={stop.point.y} r="10" fill={COLORS.routeDark} stroke={COLORS.route} strokeWidth="3" />
          <text x={stop.point.x} y={stop.point.y + 4} fill={COLORS.text} fontSize="10" fontWeight="700" textAnchor="middle">
            {stop.order}
          </text>
        </g>
      ))}
      {finished && (
        <>
          <circle cx={last.x} cy={last.y} r="10" fill="#f0a24b" fillOpacity="0.25" stroke="#f0a24b" strokeWidth="3" />
           <path d={`M ${last.x - 6} ${last.y} H ${last.x + 6} M ${last.x} ${last.y - 6} V ${last.y + 6}`} stroke={COLORS.text} strokeWidth="2" />
          <text x={last.x + 18} y={last.y + 5} fill={COLORS.text} fontSize="11" fontWeight="700">
            {stops.at(-1)?.kind === 'return' ? 'REGRESO · MUELLE' : 'DESTINO · ESTANTE'}
          </text>
        </>
      )}
    </g>
  );
}

function Legend() {
  // PR3: legend inside the dark hero card, swatches bound to the local COLORS
  // family. Seeds only yield free/occupied racks (design D4), so the third
  // entry reads "ocupado" — "lleno" is reserved for the inventory module.
  const items = [
    [COLORS.route, 'Tramos de salida y picking'],
    ['#f0a24b', 'Regreso a despacho'],
    [COLORS.rack, 'Rack ocupado'],
    [COLORS.rackFree, 'Rack libre'],
  ];
  return (
    <ul className="mt-[14px] flex list-none flex-wrap gap-x-[14px] gap-y-[6px] p-0 text-[11px] text-ink-muted" aria-label="Leyenda del plano">
      {items.map(([color, label]) => (
        <li key={label} className="flex items-center gap-[5px] whitespace-nowrap">
          <span className="inline-block size-[9px] rounded-[2px]" style={{ background: color }} aria-hidden="true" /> {label}
        </li>
      ))}
    </ul>
  );
}

function RouteChip({ label, value, accent = false }) {
  // PR3: dark hero-card chip (mockup .chip). Values read live from
  // route.distance / route.steps — no hardcoded numbers.
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-white/[0.08] bg-white/[0.06] px-[11px] py-[7px] text-[11.5px] text-[#C9D6CE]">
      {label}
      <b className="font-mono-ui font-medium" style={{ color: accent ? COLORS.route : COLORS.text }}>
        {value}
      </b>
    </span>
  );
}

function MapShell({ headerTag, children }) {
  // PR3: the dark hero card (ink bg, rounded, title + active route tag) that
  // wraps the floorplan in every surface (Dashboard, /mapa, Ingreso, Egreso).
  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-ink shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-1 pt-4">
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-ink-text">
          Mapa del depósito · en vivo
        </h3>
        <span className="text-[11px] font-medium text-ink-muted">{headerTag}</span>
      </div>
      {children}
    </div>
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
  const projectedRoute = useMemo(() => displayRoute(layout, route, profile, rackSlots), [layout, profile, rackSlots, route]);
  const projectedStops = useMemo(
    () => (route?.stops ?? [])
      .map((stop) => ({ ...stop, point: projectedRoute.stopPoints.get(stop.locationId) ?? pointFor(layout, stop.locationId, profile, rackSlots) }))
      .filter((stop) => stop.point),
    [layout, profile, rackSlots, route, projectedRoute]
  );
  const hasRenderableRoute = hasRoute && projectedRoute.legs.length > 0;
  const visibleRoute = hasRenderableRoute ? projectedRoute.legs.slice(0, revealCount) : [];
  const mapId = `warehouse-map-${layout.clientId}`;
  const descriptionId = `${mapId}-description`;

  useEffect(() => {
    setRevealCount(0);
    setFinished(false);
    if (!hasRenderableRoute) return undefined;
    if (prefersReducedMotion) {
      setRevealCount(projectedRoute.legs.length);
      setFinished(true);
      return undefined;
    }

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setRevealCount(index);
      if (index >= projectedRoute.legs.length) {
        setFinished(true);
        clearInterval(timer);
      }
    }, REVEAL_STEP_MS);
    return () => clearInterval(timer);
  }, [hasRenderableRoute, layout, prefersReducedMotion, projectedRoute.legs.length, route]);

  const status = hasRenderableRoute && finished
    ? `Ruta: ${route.steps} pasos · ${route.distance} tramos`
    : hasRoute
      ? 'Calculando ruta…'
      : 'Sin ruta activa';

  // MapShell header tag — truthful origin/destination derived from the route
  // path endpoints (dock -> rack), no invented data.
  const activeTag = hasRoute
    ? (() => {
        const startId = route.path[0];
        const endId = route.path[route.path.length - 1];
        const startLocation = layout.index.get(startId);
        const endLocation = layout.index.get(endId);
        const origin = startId === layout.dockId || startLocation?.type === 'dock' ? 'Muelle' : startId;
        const destination = endLocation?.type === 'rack' ? `Rack ${endId}` : endId;
        return `Ruta activa: ${origin} → ${destination}`;
      })()
    : 'Sin ruta activa';

  const chips = hasRenderableRoute && finished ? (
    <div className="mt-3 flex flex-wrap gap-2">
      <RouteChip label="Distancia" value={`${route.distance} tramos`} />
      <RouteChip label="Pasos" value={String(route.steps)} />
      <RouteChip label="Estado" value="Óptima" accent />
    </div>
  ) : hasRoute ? (
    <div className="mt-3 flex flex-wrap gap-2">
      <RouteChip label="Estado" value="Calculando…" />
    </div>
  ) : (
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="flex items-center whitespace-nowrap rounded-[9px] border border-white/[0.08] bg-white/[0.06] px-[11px] py-[7px] text-[11.5px] text-[#C9D6CE]">
        Sin ruta activa
      </span>
    </div>
  );

  return (
    <MapShell headerTag={activeTag}>
      <div className="relative px-4 pb-4">
        <div className="min-w-[48rem] overflow-x-auto">
          <svg
            className="block h-auto w-full"
            viewBox={profile.viewBox}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-labelledby={`${mapId}-title ${descriptionId}`}
          >
            <title id={`${mapId}-title`}>Plano industrial de {client.name}</title>
            <desc id={descriptionId}>
               Mapa operativo con corredores físicos, estantes, muelles y puertas del almacén activo de {client.name}. Las rutas visibles recorren únicamente corredores y conectores de acceso.
            </desc>
            <rect width="1200" height="680" fill={COLORS.background} />
            <rect x="24" y="24" width="1152" height="632" rx="16" fill={COLORS.surface} stroke={COLORS.border} strokeWidth="2" />
            <text x="52" y="52" fill={COLORS.muted} fontSize="11" fontWeight="700" letterSpacing="2">PLANO OPERATIVO</text>
             <text x="1150" y="52" fill={COLORS.text} fontSize="15" fontWeight="700" textAnchor="end">{client.name}</text>
             <ZoneLayer zones={profile.zones} mapId={mapId} />
             <NavigationLayer navigation={profile.navigation} />
             <RouteLaneLayer routeLanes={profile.navigation ? [] : profile.routeLanes ?? []} />
             <AisleLayer aisles={profile.aisles} />
             <RackLayer layout={layout} profile={profile} />
            <DockLayer layout={layout} profile={profile} />
            <DoorLayer doors={profile.doors} />
            <CueLayer cues={profile.cues} />
            <RouteLayer legs={visibleRoute} stops={projectedStops} finished={finished} />
          </svg>
        </div>
        {/* Dotted 16px background grid (mockup .map-grid): covers the whole map
            area card-wide, pointer-events-none so it never blocks the SVG. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${COLORS.grid} 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
          aria-hidden="true"
        />
        <div className="relative">
          {chips}
          <Legend />
          <p className="mx-0 mb-0 mt-[0.6rem] text-sm text-ink-muted" role="status" aria-live="polite">
            {status}
          </p>
        </div>
      </div>
    </MapShell>
  );
}
