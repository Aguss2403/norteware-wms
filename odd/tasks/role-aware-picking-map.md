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
- Replace free-form route projection with a strict physical corridor network: named aisles, permitted intersections, and short rack-access connectors.
- For outbound picking, render outbound and between-stop legs in green, numbered stop markers, and only the final return-to-dispatch leg in orange.
- Simplify the map by removing the quality-control zone, pallet, and forklift cues; retain scanners at Reception and Dispatch.
- Defer rack-capacity fill indicators (10 units per rack) until the corridor redesign is complete.

## Constraints

- This is not authentication or authorization. The role selector only adapts the demo UI and must not be presented as security.
- Preserve seed-domain contracts validated by `scripts/validate-seeds.mjs`; update validation only when the revised behavior is intentional.
- Keep local warehouse state authoritative and do not mirror the display role to Supabase.
- Do not commit `.env.local` or any secret.
- TDD mode: unresolved. Run the existing functional validation and build; do not invent a test runner.
- Delivery strategy: `ask-on-risk`; plan commits as independently reviewable work units.

## Acceptance criteria

- [x] ODD-01 Role selector is available in the product topbar, persists after reload, and names the active role.
- [x] ODD-02 Operator sees only operational routes; Manager sees only Dashboard, Inventory, and Traceability; blocked direct URLs redirect safely.
- [x] ODD-03 Inbound path starts at Reception and outbound path starts/ends at Dispatch, with domain and SVG views agreeing.
- [x] ODD-04 A multi-line outbound order renders one continuous ordered route across all available stops, including a return leg to Dispatch.
- [x] ODD-05 Rack labels, rack positions, and rendered route endpoints use the same logical location mapping.
- [x] ODD-06 Partial fulfillment is explicit to the operator before confirmation.
- [x] ODD-07 `node scripts/validate-seeds.mjs` and `npm run build` pass after each relevant work unit.
- [x] ODD-08 Routes use only the explicit physical corridor network; outbound legs are green and the final return leg is orange.
- [ ] ODD-09 Deferred: racks expose an occupancy fill indicator against a 10-unit capacity.

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
  - Commit: `e55d4b3` (`feat(map): separate warehouse operation endpoints`).
  - Regression fix (2026-09-26): logical rack IDs now have explicit `rackBanks[].locationIds` membership in the presentation profile. `WarehouseMap` derives each slot only from that membership and the containing bank geometry, rather than from logical route coordinates or layout-array order. Routes still use the logical BFS path; their final segment enters the mapped rack's bottom access point beside the bank aisle.
  - Regression validation: `node scripts/validate-seeds.mjs` passed; `npm run build` passed (Vite 5.4.21, 1029 modules, 2.32 s; existing >500 kB chunk warning only). Seed validation now verifies one explicit visual-bank assignment per logical rack, no duplicates, and no bank capacity overflow.
  - Regression files: `src/data/warehouseVisuals.js`, `src/components/WarehouseMap.jsx`, `scripts/validate-seeds.mjs`, `odd/tasks/role-aware-picking-map.md`.
  - Regression commit: recorded in the local delivery result (`fix(map): restore visual rack bank placement`).
- [x] ODD-03 — Build a compound multi-stop outbound route and render route legs/return-to-dispatch state.
  - Completed: `resolveOrder` now resolves available lines in selection order as one Dispatch -> rack stops -> Dispatch route. It returns the joined path, ordered stops, leg segments, total distance, and total steps; every join cell is represented once. Unavailable, insufficient, and unreachable lines retain their existing UI status and do not remove earlier valid legs.
  - Presentation: Egreso renders the compound route and a concise ordered Spanish summary. The map keeps its resting behavior and adds numbered pick-stop markers plus a return-to-dock endpoint for compound routes.
  - Validation: `scripts/validate-seeds.mjs` asserts a deterministic two-SKU citrus route for SKU-002 then SKU-003: `5-7 -> 1-6 -> 1-6 -> 5-7`, 14 tramos and 15 pasos. `node scripts/validate-seeds.mjs` passed; `npm run build` passed (Vite 5.4.21; existing chunk-size warning only).
  - Relevant files: `src/domain/order.js`, `src/pages/Egreso.jsx`, `src/components/WarehouseMap.jsx`, `scripts/validate-seeds.mjs`.
  - Rationale: routing each line from Dispatch discarded the prior pick context and showed only the first line. A compound route makes the operational itinerary coherent without changing endpoint geometry, role behavior, or partial-confirmation rules.
  - Commit: recorded in the local delivery report for this work unit.
- [x] ODD-04 — Make partial fulfillment explicit and perform a final focused UI/readback verification.
  - Completed: Egreso now calculates ready and excluded line/unit totals from `pickResult`. A partial order shows a warning before confirmation: “Despacho parcial. Se despacharán [lines] y [units]. Se excluirán [lines] y [units].” The action becomes “Despachar líneas disponibles”; a completely ready order uses “Confirmar despacho”.
  - Remito scope: confirmation still derives `picked` exclusively from `pickResult.okLines`, so `recordOrderOutbound` and the remito contain only intentionally dispatched lines and units.
  - Focused UI/readback verification: a complete flow has no partial-warning alert and offers “Confirmar despacho”; its remito contains all requested ready lines. A partial flow displays exact ready/excluded line and unit counts with correct singular/plural copy, offers only “Despachar líneas disponibles”, and its remito is built only from the ready lines. The existing zero-ready warning still blocks confirmation.
  - Verification actual output: `node scripts/validate-seeds.mjs` passed with `Seed validation OK:` for 3 clients, 3 layouts, 8 SKUs, the fixed auto-assign (`PT-JUGO` -> `2-6`), fixed route (`0-0` -> `2-6`, distance 8, steps 9), and the no-route case (`0-0` -> `5-5`, no crash). `npm run build` passed: Vite 5.4.21 transformed 1029 modules and built successfully in 2.35s; the existing >500 kB chunk-size warning remained non-blocking. Its nested seed validation also passed with the same output.
  - Changed files: `src/pages/Egreso.jsx`, `odd/tasks/role-aware-picking-map.md`.
  - Rationale: an available subset remains intentionally dispatchable, but the operator must see that it is not the original complete order before issuing the remito.
  - Commit: `bbc9fcd` (`feat(picking): clarify partial outbound dispatch`).
- [x] ODD-08 — Redesign the warehouse map around explicit operational corridors and direction-aware route legs.
  - Completed: Citrus now declares an auditable presentation-only navigation graph with named `Corredor principal`, `Conexión de recepción`, `Conexión de despacho`, `Pasillo A-01`, `Pasillo A-02`, and short rack-access connectors. Display routing resolves ordered endpoint and pick-stop identities through that graph; the domain BFS and assignment model remain unchanged. Profiles without navigation data use the existing safe route projection rather than failing.
  - Presentation: Dispatch-to-pick and pick-to-pick legs render green; only the final return-to-Dispatch leg renders orange. Pick markers retain their ordered numbers, and Dispatch retains distinct start and return markers. The resting map renders the physical corridors without an active colored route.
  - Citrus simplification: removed `CONTROL DE CALIDAD`, pallet, and forklift cues. Scanners are now rendered only at Reception and Dispatch.
  - Verification actual output: `node scripts/validate-seeds.mjs` passed for 3 clients, 3 layouts, and 8 SKUs; it additionally validates Citrus navigation-node references, rack access nodes, and the Dispatch navigation node. `npm run build` passed with Vite 5.4.21 (1029 modules, 2.23 s); its nested seed validation passed. The existing >500 kB chunk-size warning remained non-blocking.
  - Source audit: Dispatch (`5-7`) reaches the first Citrus rack through `Conexión de despacho` -> `Corredor principal` -> `Conexión A-01`/`A-02` -> named aisle -> vertical rack-access connector. Consecutive selected stops are emitted as individual green legs; the final `return` stop is the only orange leg. Every Citrus graph edge is horizontal or vertical, so no route crosses a zone interior.
  - Commit: `93f40ae` (`feat(map): add physical picking corridors`).
- [ ] ODD-09 — Deferred rack occupancy fill indicator.
  - Scope: fixed capacity of 10 units per rack, visual fill state driven by current stock.
  - Reason for deferral: must not be mixed with the route-network redesign.

## Progress and evidence

- Current state: ODD-01 through ODD-08 are complete and verified; ODD-09 remains explicitly deferred.
- Regression note (2026-09-26): direct logical-coordinate placement broke visual zone placement, as confirmed by the supplied screenshot. Citrus racks `2-6` and `2-7` rendered in `PICKING RÁPIDO`, while racks such as `4-3` floated in `CONTROL DE CALIDAD`, instead of remaining in their intended visual rack bays.
- Mapping evidence: every rack location has auditable explicit `rackBanks[].locationIds` membership. Citrus `2-6` and `2-7` render in `citrus-bulk` (`BAHÍA A-01`); `4-3` and `5-3` render in `citrus-main` (`BAHÍA A-02`). All are geometrically contained within their bank and therefore their intended storage zone.
- Route evidence: inbound still starts at `receptionId`, outbound still starts and returns to `dispatchId`, and multi-stop BFS behavior is unchanged. At a rack endpoint, the SVG turns into the mapped bank's bottom access point immediately above its corresponding aisle instead of projecting the rack to raw grid coordinates.
- Verification: `node scripts/validate-seeds.mjs` passed; `npm run build` passed (with the existing chunk-size warning only).
- Next step: keep ODD-09 deferred until a separate rack-occupancy work unit is approved.
