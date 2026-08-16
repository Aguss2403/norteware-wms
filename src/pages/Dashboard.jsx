// Dashboard page (spec: dashboard-overview, design D4).
// Professional SaaS overview: topbar greeting/date + search + avatar, a 4-card
// KPI row, a 60/40 grid with the dark map hero card (PR3 MapShell) and the
// rack status card, and a full-width movements table. All values come from
// the hybrid account data module: occupancy/SKUs are real seeds, orders/
// picking/movements are labeled mocks reusing seeded ids.

import { useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { useClient } from '../context/ClientContext.jsx';
import { buildDashboardData } from '../data/dashboard.js';
import WarehouseMap from '../components/WarehouseMap.jsx';
import KpiCard from '../components/KpiCard.jsx';
import RackStatusList from '../components/RackStatusList.jsx';
import MovementsTable from '../components/MovementsTable.jsx';

export default function Dashboard() {
  const { client, layout } = useClient();
  const data = useMemo(() => buildDashboardData({ client, layout }), [client, layout]);

  const dateLabel = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });

  return (
    <section className="mx-auto max-w-[74rem]">
      {/* Topbar (mockup .topbar): greeting + date, search, avatar. */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-text">
            Hola, Agustín 👋
          </h1>
          <p className="mt-1 text-[13px] text-text-muted">Así está el depósito hoy, {dateLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Presentational search affordance (mockup .search); real search
              UX stays out of scope for this slice. */}
          <div className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] text-text-muted">
            <SearchIcon sx={{ fontSize: 14, color: 'text.secondary' }} aria-hidden="true" />
            <span>Buscar SKU o pallet…</span>
          </div>
          {/* PR6 audit: ink tokens are confined to the Sidebar and the map card
              (spec "map remains the only dark element"); the topbar avatar uses
              the light brand-tint badge treatment instead of bg-ink. */}
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand/12 font-display text-xs font-semibold text-brand-deep"
            aria-hidden="true"
          >
            AG
          </span>
        </div>
      </div>

      {/* KPI row (mockup .kpis): 4 cards from dashboard.js. */}
      <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} label={kpi.label} badge={kpi.badge} value={kpi.value} sub={kpi.sub} />
        ))}
      </div>

      {/* 60/40 grid (mockup .grid): dark map hero + rack status. The map card
          is PR3's MapShell; RackStatusList gets the same mt-6 inset so both
          start aligned in their grid tracks. */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.55fr_1fr]">
        <WarehouseMap />
        <div className="mt-6">
          <RackStatusList racks={data.racks} updatedAt="2 min" />
        </div>
      </div>

      {/* Full-width movements table. */}
      <div className="mt-4">
        <MovementsTable movements={data.movements} />
      </div>
    </section>
  );
}