// Presentational KPI card (spec: dashboard-overview KPI row, design D4).
// Pure component: renders a label row with an optional trend badge, a large
// Space Grotesk value, and a muted subtitle. No data imports — the parent
// (Dashboard) feeds everything via props.

const BADGE_TONES = {
  up: 'bg-brand/12 text-brand-deep',
  warn: 'bg-warning/14 text-[#96690F]',
};

export default function KpiCard({ label, badge, value, sub }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        {badge && (
          <span
            className={`rounded-full px-[7px] py-0.5 text-[10.5px] font-semibold ${
              BADGE_TONES[badge.tone] ?? BADGE_TONES.up
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-tight text-text">
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px] text-text-muted">{sub}</div>
    </section>
  );
}