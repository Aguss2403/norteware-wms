# Tasks: claude-dashboard — Light SaaS shell, dark sidebar + map hero

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1000 (6 slices) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 tokens/fonts → PR2 shell+sidebar+`/mapa` → PR3 map hero → PR4 dashboard → PR5 pages restyle → PR6 audit |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

Tracker branch `feature/claude-dashboard` (from `14cd355`). PR #1 base = tracker; PR #n base = PR #(n-1) branch.

### Suggested Work Units

| Unit | Goal | Likely PR | Base boundary | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|---------------|----------------------|-----------------|-------------------|
| 1 | Light theme + fonts foundation | PR 1 | feature/claude-dashboard | `npm run build` | `npm run dev` → light canvas + Space Grotesk/Inter/mono render | revert `src/theme.js`, `src/index.css`, `src/main.jsx`, `package.json` |
| 2 | Dark sidebar + `/mapa` shell | PR 2 | PR 1 branch | `npm run build` | `npm run dev` → nav, active state, `/mapa`, NotFound keeps sidebar | revert `Sidebar.jsx`, `App.jsx`, `ClientSwitcher.jsx`, `WarehouseMapPage.jsx`, delete `Navbar.jsx` |
| 3 | Map hero restyle | PR 3 | PR 2 branch | `npm run build` | `npm run dev` → dark map card, lime route on light canvas | revert `WarehouseMap.jsx` only |
| 4 | Dashboard + hybrid data | PR 4 | PR 3 branch | `npm run build` | `npm run dev` → KPIs match seeds; mocks labeled; switch clients | revert `Dashboard.jsx`, `src/data/dashboard.js`, `KpiCard/RackStatusList/MovementsTable.jsx` |
| 5 | Pages restyle | PR 5 | PR 4 branch | `npm run build` | `npm run dev` → mono codes, h1 contrast, Ingreso/Egreso flows | revert `Ingreso/Egreso/NotFound.jsx`, `SearchBox.jsx`, `QrInput.jsx` |
| 6 | Audit + contrast sweep | PR 6 | PR 5 branch | `npm run build` | `npm run dev` full smoke + switch clients | revert audit fixes only |

## Phase 1 (PR1): Tokens & Fonts

- [x] 1.1 **theme.js light rewrite** — `createTheme` mode light: primary `#2FAE58`/dark `#1F8A44`/contrastText `#FFF`, secondary `#A8E063`/`#10241A`, bg `#F4F7F3`/paper `#FFF`, text `#10241A`/`#5C6B62`, success `#2FAE58`, warning `#E8A93B`, error `#E1554F`, info `#3B82C4`, divider `#E1E8E0`; h1–h4 Space Grotesk, body Inter, `shape.borderRadius:16`, MuiCard shadow+border, MuiButton radius 10 + contained green-deep; drop `MuiAppBar`. **AC**: build green; canvas `#F4F7F3`, text `#10241A`. **Files**: `src/theme.js`

- [x] 1.2 **index.css @theme remap + color-scheme light** — add `--color-brand/-brand-deep/-lime/-ink/-ink-soft/-card/-text/-text-muted/-border/-warning/-danger/-info` + `--font-display/-mono-ui`; remove `--color-brand-dark/-brand-accent/-bg`; `:root { color-scheme: light }`; body `bg-surface`/`text` light. **AC**: `bg-surface border-border shadow-card text-text-muted` still resolve light; no removed token references. **Files**: `src/index.css`

- [x] 1.3 **@fontsource deps + imports** — add `@fontsource/space-grotesk` (500/600/700), `/inter` (400/500/600), `/ibm-plex-mono` (400/500); import 8 css files in `main.jsx` before `index.css`. **AC**: offline fonts bundle into dist; build green. **Files**: `package.json`, `src/main.jsx`

## Phase 2 (PR2): Shell & Sidebar

- [x] 2.1 **Sidebar.jsx (new)** — 240px `bg-ink`: gradient logo + "NorteWare/Solutions WMS", GENERAL (Dashboard/Ingreso/Egreso/Mapa del depósito) + ANÁLISIS (Inventario/Trazabilidad disabled "Próximamente"), NavLink active = `rgba(47,174,88,.16)` + inset bar, footer `ClientSwitcher` slot. **AC**: active state + disabled placeholders render; Spanish labels. **Files**: `src/components/Sidebar.jsx`

- [x] 2.2 **App.jsx flex-row + delete Navbar.jsx** — `<Sidebar/>` outside `<Routes>` + `<main class="flex-1 px-6 pb-10 pt-7">`; routes `/`, `/ingreso`, `/egreso`, `/mapa`, `*`. **AC**: sidebar fixed 240px; sidebar persists on NotFound. **Files**: `src/App.jsx`, delete `src/components/Navbar.jsx`

- [x] 2.3 **ClientSwitcher footer pill** — restyle to dark ink-soft pill (MUI Select + InputLabel), lime dot, same `useClient` contract. **AC**: 3 seeded clients switch context; keyboard/label a11y intact. **Files**: `src/components/ClientSwitcher.jsx`

- [x] 2.4 **/mapa route + WarehouseMapPage.jsx (new)** — dedicated page rendering `<WarehouseMap/>` (no route prop) + back CTA. **AC**: `/mapa` renders, item active, no crash. **Files**: `src/pages/WarehouseMapPage.jsx`, `src/App.jsx`

## Phase 3 (PR3): Map Hero

- [x] 3.1 **WarehouseMap COLORS → ink/lime + dotted grid** — local `COLORS`: background `#0B140D`, surface `#132018`, border `rgba(255,255,255,.10)`, text `#EAF6EE`, muted `#7C9186`, brand `#2FAE58`, route lime `#A8E063`, routeDark `rgba(168,224,99,.18)`, rack `#1d3527`, rackFree `#16281e`; dotted 16px grid. **AC**: projection/reveal/route contract untouched; build green. **Files**: `src/components/WarehouseMap.jsx`

- [x] 3.2 **chips + legend + MapShell dark card** — dark `bg-ink` card wrapper w/ header "Mapa del depósito · en vivo", chips Distancia/Pasos/Estado (or "Sin ruta activa"), legend (lime route/libre/lleno). **AC**: chips read unchanged `route.distance`/`route.steps`; map is only dark element on light canvas. **Files**: `src/components/WarehouseMap.jsx`

## Phase 4 (PR4): Dashboard

- [x] 4.1 **src/data/dashboard.js (hybrid)** — `buildDashboardData({client,layout})` → `{kpis,racks,movements}`; occupancy/SKUs derived from seeds, orders/picking/movements labeled mock reusing seeded SKU/rack ids. **AC**: not imported by `validate-seeds.mjs`; build green. **Files**: `src/data/dashboard.js`

- [x] 4.2 **KpiCard.jsx (new)** — props `{label,badge?,value,sub}`; label row + pill badge, Space Grotesk 26px value, muted sub. **AC**: pure presentational, no data imports. **Files**: `src/components/KpiCard.jsx`

- [x] 4.3 **RackStatusList.jsx (new)** — props `{racks,activeRackId?,updatedAt?}`; mono rack tile (free green/mid warning/full danger), status copy, mono pct. **AC**: seeded racks reflect assignments; client switch updates list. **Files**: `src/components/RackStatusList.jsx`

- [x] 4.4 **MovementsTable.jsx (new)** — props `{movements}`; MUI Table: mono SKU/location, Inter product, ingreso=green/egreso=info badge, time. **AC**: no backend call; rows render all columns. **Files**: `src/components/MovementsTable.jsx`

- [x] 4.5 **Dashboard.jsx rewrite** — topbar greeting/date + search + avatar, 4 KpiCard row, 60/40 grid (dark MapShell + RackStatusList), full-width MovementsTable. **AC**: real KPIs match seeds and change with client; mocks labeled. **Files**: `src/pages/Dashboard.jsx`

## Phase 5 (PR5): Pages Restyle

- [x] 5.1 **Ingreso/Egreso h1 → text.primary** — headings use `text.primary` (never `primary.main`); cards/forms keep light tokens. **AC**: h1 contrast ≥4.5:1; flows still work. **Files**: `src/pages/Ingreso.jsx`, `src/pages/Egreso.jsx`

- [x] 5.2 **NotFound restyle** — h1 `text.primary`, contained Button green-deep. **AC**: renders on unknown route; no dark hardcodes. **Files**: `src/pages/NotFound.jsx`

- [x] 5.3 **SearchBox SEARCH_STATUS retune + QrInput mono** — `SEARCH_STATUS` hexes → `success/warning/error` tokens; SKU fields `IBM Plex Mono`. **AC**: no dark-theme hex leftovers; mono codes render. **Files**: `src/components/SearchBox.jsx`, `src/components/QrInput.jsx`

## Phase 6 (PR6): Audit

- [x] 6.1 **Contrast sweep** — verify white never rests on `#2FAE58`; buttons use `#1F8A44`; h1 `text.primary`; ink-text/ink-muted over ink surfaces ≥3:1 large. **AC**: ratios meet AA. **Files**: theme/pages/components as needed

- [x] 6.2 **Token/dark-hex sweep** — grep `--color-brand-dark/-brand-accent/-bg`, `#3fb950/#d29922/#f85149` and stray dark hexes; confirm ink only in Sidebar/map. **AC**: zero leftover references. **Files**: `src/index.css`, `src/components/*`

- [x] 6.3 **Build + smoke + copy byte-check** — `npm run build` (vite + validate-seeds), `npm run dev` full route/flow smoke, Spanish copy (labels/placeholders) UTF-8 intact; no diff on `src/domain/*`, `scripts/validate-seeds.mjs`, `src/data/{clients,layouts,skus}.js`, `src/data/warehouseVisuals.js`. **AC**: all success criteria green. **Files**: repo-wide audit
