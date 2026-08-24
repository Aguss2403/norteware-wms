-- NorteWare WMS — demo schema (Supabase).
-- Only DYNAMIC state lives here; seeds (clients, layouts, SKUs) stay in the
-- frontend code. Three tables:
--   assignments  rackId -> productTypeId (racks auto-assigned at inbound)
--   stock        skuId  -> qty (per-SKU units on hand)
--   movements    append-only ingreso/egreso log
-- RLS: demo-only permissive policies (no auth in this demo). Do NOT reuse in
-- production.

drop table if exists public.movements cascade;
drop table if exists public.stock cascade;
drop table if exists public.assignments cascade;

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  rack_id text not null,
  product_type_id text not null,
  created_at timestamptz not null default now(),
  unique (client_id, rack_id)
);

create table public.stock (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  sku_id text not null,
  qty integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (client_id, sku_id)
);

create table public.movements (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  sku_id text not null,
  type text not null check (type in ('ingreso', 'egreso')),
  rack_id text,
  qty integer not null default 1,
  operator text,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;
alter table public.stock enable row level security;
alter table public.movements enable row level security;

create policy "anon_all_assignments" on public.assignments for all to anon using (true) with check (true);
create policy "anon_all_stock" on public.stock for all to anon using (true) with check (true);
create policy "anon_all_movements" on public.movements for all to anon using (true) with check (true);
