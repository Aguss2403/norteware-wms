# Role-aware operations and multi-stop picking map

## Objective

Add a display-only role switcher for the demo, correct warehouse-map geometry, and turn outbound picking into a coherent multi-stop route from dispatch.

## Problem and rationale

The current UI exposes every screen to every user. A presentation-friendly role switcher will make the operating model clear without claiming to provide authentication. Outbound picking currently draws only the first selected SKU's path and starts at reception because inbound and outbound share one logical dock. The visual rack positions are sequentially assigned and do not match their logical grid coordinates, so routes can appear misaligned.

## Authorized scope

- Display-only roles: `operator` and `manager`, persisted per browser in localStorage.
- Operator navigation: Inbound, Outbound, Warehouse map.
- Manager navigation: Dashboard, Inventory, Traceability.
- Direct navigation to a disallowed route redirects to the role's landing page.
- Separate logical and visual endpoints for inbound reception and outbound dispatch.
- Sequential multi-SKU pick route: dispatch -> selected available stops in order -> dispatch.
- Correct visual/logical rack mapping and add clear route-leg presentation where appropriate.
- One bounded operational improvement if supported by the existing flow: make partial outbound fulfillment explicit rather than silently shipping only ready lines.

## Constraints

- This is not authentication or authorization. The role selector only adapts the demo UI and must not be presented as security.
- Preserve seed-domain contracts validated by `scripts/validate-seeds.mjs`; update validation only when the revised behavior is intentional.
- Keep local warehouse state authoritative and do not mirror the display role to Supabase.
- Do not commit `.env.local` or any secret.
- TDD mode: unresolved. Run the existing functional validation and build; do not invent a test runner.
- Delivery strategy: `ask-on-risk`; plan commits as independently reviewable work units.

## Acceptance criteria

- [x] ODD-01 Role selector is available in the product topbar, persists after reload, and names the active role.
- [ ] ODD-02 Operator sees only operational routes; Manager sees only Dashboard, Inventory, and Traceability; blocked direct URLs redirect safely.
- [ ] ODD-03 Inbound path starts at Reception and outbound path starts/ends at Dispatch, with domain and SVG views agreeing.
- [ ] ODD-04 A multi-line outbound order renders one continuous ordered route across all available stops, including a return leg to Dispatch.
- [ ] ODD-05 Rack labels, rack positions, and rendered route endpoints use the same logical location mapping.
- [ ] ODD-06 Partial fulfillment is explicit to the operator before confirmation.
- [ ] ODD-07 `node scripts/validate-seeds.mjs` and `npm run build` pass after each relevant work unit.

## Work plan

- [x] ODD-01 — Add role context, selector, filtered navigation, and role route guard.
  - Completed: browser-only `RoleContext` validates and persists `operator`/`manager`; the Dashboard topbar names the active demo role, and the Sidebar keeps the selector reachable from operational routes while filtering navigation and guarding direct routes.
  - Verification observed: `node scripts/validate-seeds.mjs` passed; `npm run build` passed (Vite 5.4.21; existing chunk-size warning only). Manual source inspection confirmed operators redirect from `/app`, `/app/inventario`, and `/app/trazabilidad` to `/app/ingreso`, while managers redirect from `/app/ingreso`, `/app/egreso`, and `/app/mapa` to `/app`. Each redirect destination is allowed for its role, preventing a redirect loop; `/app/ingresar` remains outside the guarded layout.
  - Relevant files: `src/context/RoleContext.jsx`, `src/main.jsx`, `src/pages/Dashboard.jsx`, `src/components/Sidebar.jsx`, `src/layouts/AppLayout.jsx`.
  - Rationale: this changes only demo presentation and local browser state; it is not authentication or authorization and does not secure direct access from a knowledgeable user.
- [x] ODD-02 — Model inbound/outbound endpoints and align logical grid positions with SVG rack slots.
  - Completed: each layout now declares `receptionId` and `dispatchId`; `dockId` remains an intentional compatibility alias for reception. Inbound routing and nearest-rack selection use reception, while outbound routing and nearest-rack selection use dispatch.
  - SVG alignment: every visual dock has a matching logical `locationId`, both Reception and Dispatch are rendered and labeled, and every rack slot is derived from its logical row/column through the same route geometry used for paths. Rack labels and route endpoints therefore share one coordinate model.
  - Validation: `scripts/validate-seeds.mjs` now asserts distinct valid endpoints and verifies the citrus inbound route starts at reception and the outbound route starts at dispatch.
  - Verification observed: `node scripts/validate-seeds.mjs` passed; `npm run build` passed (Vite 5.4.21; existing chunk-size warning only). Manual source inspection confirmed citrus inbound `0-0 -> 2-6` and outbound `5-7 -> 1-6`; no compound multi-SKU route or partial-fulfillment behavior was changed.
  - Rationale: endpoints must be distinct in the grid, BFS, nearest-rack selection, and SVG projection; moving only a visual marker would leave operational routes incorrect.
  - Commit: recorded in the local delivery report for this work unit.
- [ ] ODD-03 — Build a compound multi-stop outbound route and render route legs/return-to-dispatch state.
  - Route: delegated.
  - Trigger: changes domain flow, Egreso state, map rendering, and validation across 4+ files.
  - Verification: `node scripts/validate-seeds.mjs`, `npm run build`, manual multi-SKU outbound scenario.
- [ ] ODD-04 — Make partial fulfillment explicit and perform a final focused UI/readback verification.
  - Route: delegated.
  - Trigger: implementation preparation and multi-file behavior verification.
  - Verification: `node scripts/validate-seeds.mjs`, `npm run build`, manual partial-stock scenario.

## Progress and evidence

- Current state: ODD-01 complete and verified as a browser-only demo role adaptation.
- Mapping evidence: current `Egreso` stores only `result.okLines[0].route`; inbound/outbound both start from `layout.dockId`; `WarehouseMap` assigns visual rack slots by array index instead of logical row/column.
- Next step: implement ODD-02 as a bounded work unit.
