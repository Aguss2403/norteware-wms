// Presentational rack status list (spec: dashboard-overview Rack status list,
// design D4). Pure component fed via props: a rack card (≈40% grid column)
// listing each seeded rack with a status tile (libre/medio/lleno), the product
// where assigned, and a mono occupancy percentage. No data imports.

const STATUS_COPY = {
  free: { title: 'Libre', meta: 'Capacidad total', tile: 'bg-brand/12 text-brand-deep' },
  occupied: { title: null, meta: null, tile: 'bg-warning/14 text-[#96690F]' },
  full: { title: 'Lleno', meta: 'Sin espacio disponible', tile: 'bg-danger/12 text-[#A83530]' },
};

export default function RackStatusList({ racks = [], activeRackId, updatedAt }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-1 pt-4">
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-text">
          Estado de racks
        </h3>
        <span className="text-[11px] font-medium text-text-muted">
          {racks.length} ubicaciones
        </span>
      </div>

      <ul className="list-none px-3 py-2" aria-label="Estado de racks por ubicación">
        {racks.map((rack) => {
          const copy = STATUS_COPY[rack.status] ?? STATUS_COPY.free;
          const isActive = activeRackId === rack.rackId;
          return (
            <li
              key={rack.rackId}
              className={`flex items-center justify-between rounded-[10px] px-2 py-[10px] text-[13px] ${
                isActive ? 'ring-1 ring-brand/40' : ''
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex size-[30px] shrink-0 items-center justify-center rounded-lg font-mono-ui text-[11px] font-semibold ${copy.tile}`}
                  aria-hidden="true"
                >
                  {rack.rackId}
                </span>
                <div className="leading-tight">
                  <div className="truncate font-medium text-text">
                    {rack.status === 'occupied' ? rack.productName : copy.title}
                  </div>
                  <div className="truncate text-[11px] text-text-muted">
                    {rack.status === 'occupied' ? rack.productTypeId : copy.meta}
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-mono-ui text-xs font-medium text-text">
                {rack.pct}%
              </span>
            </li>
          );
        })}
      </ul>

      {updatedAt && (
        <>
          <div className="mx-5 h-px bg-border" aria-hidden="true" />
          <div className="px-5 py-3.5 text-[11.5px] text-text-muted">
            Actualizado hace <span className="font-medium text-text">{updatedAt}</span>
          </div>
        </>
      )}
    </section>
  );
}