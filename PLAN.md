# NorteWare WMS — Plan de implementación

> Demo WMS para **Administración de Sistemas de Información** (UTN FR Tucumán).
> Objetivo: un WMS que parezca serio y competente, con la mayor cantidad de
> funciones razonables sin que la programación se vaya de las manos. Frontend
> React + Vercel + persistencia en base de datos.

Stack: Vite 5 · React 18.3 · MUI v6 · Tailwind v4. Desplegado en Vercel
(repo `Aguss2403/norteware-wms`).

---

## 1. Decisiones de arquitectura

| Tema | Decisión |
|------|----------|
| Sitio promocional vs. producto | **Una sola app React, dos áreas.** Landing (`/`) y Nosotros (`/nosotros`) sin sidebar; el WMS vive bajo `/app/*` con el sidebar oscuro actual. |
| Logo | `~/Descargas/NorteWare Logo.png` (verde, fondo transparente). Reemplaza la marca en sidebar, favicon, landing y Nosotros. |
| Persistencia | **Supabase (Postgres)** integrado a Vercel, SDK client-side, sin backend propio. Seeds estáticos siguen en código; solo el estado dinámico va a la DB. |
| Idioma | UI en español neutro; identificadores de código en inglés. |
| Maestros | Siguen hardcodeados en `src/data/*` (determinístico, validado por `validate-seeds.mjs`). No se hace CRUD vía UI. |

---

## 2. Estructura de rutas

**Antes** → **Después**

| Ruta actual | Ruta nueva | Layout | Contenido |
|---|---|---|---|
| `/` | `/` | Marketing | Landing promocional (hero + features + CTAs) |
| — | `/nosotros` | Marketing | Página institucional (cátedra) |
| — | `/app/ingresar` | Marketing (opcional) | Pantalla de entrada "Seleccioná cliente" |
| `/` (Dashboard) | `/app` | App (sidebar) | Dashboard |
| `/ingreso` | `/app/ingreso` | App | Ingreso de mercadería |
| `/egreso` | `/app/egreso` | App | Egreso y picking |
| `/mapa` | `/app/mapa` | App | Mapa del depósito |
| — | `/app/inventario` | App | Inventario (nuevo) |
| — | `/app/trazabilidad` | App | Trazabilidad (nuevo) |
| `*` | `*` | Genérico | NotFound |

Dos layouts: `MarketingLayout` (navbar clara: logo + Inicio/Nosotros + CTA
"Ingresar al sistema") y `AppLayout` (el `Sidebar.jsx` actual + main). El logo
en la app linkea de vuelta a `/`.

---

## 3. Fases de trabajo

### Fase 0 — Fundaciones (assets + routing)

**Entregable**: logo integrado, favicon, y el split de rutas funcionando con
stubs para Landing/Nosotros.

- [ ] Copiar `NorteWare Logo.png` a `public/norteware-logo.png`.
- [ ] `index.html`: agregar `<link rel="icon">` + título correcto.
- [ ] Crear `MarketingLayout` y `AppLayout`; reestructurar `App.jsx` con las
      rutas de la tabla (Sección 2).
- [ ] `Sidebar.jsx`: reemplazar la marca (gradiente "N" + wordmark) por la
      imagen del logo, tamaño acorde al sidebar de 240px.
- [ ] Mover las rutas existentes bajo `/app` (dashboard/ingreso/egreso/mapa)
      y ajustar `NavLink` del sidebar a las nuevas rutas.
- [ ] Landing y Nosotros como stubs mínimos (título + CTA) para que no rompa.

**Nota técnica**: el modelo no puede previsualizar el PNG; al colocarlo se
verifica el contraste (verde sobre `bg-ink` y sobre fondo claro).

### Fase 1 — Landing + Nosotros (marketing)

**Entregable**: sitio promocional completo.

**Landing (`/`)**:
- [ ] Hero con logo grande + titular + subtítulo.
- [ ] Sección de características del WMS (mapa a medida, rutas óptimas BFS,
      multi-cliente, recepción/picking).
- [ ] CTA primario "Comunicate con un asesor" (muerto, no navega).
- [ ] CTA secundario "Ingresar al sistema" → `/app`.
- [ ] Footer institucional.

**Nosotros (`/nosotros`)**:
- [ ] Hero con logo grande.
- [ ] Misión, visión, objetivos (cards).
- [ ] Organigrama (lista jerárquica según el TP1).
- [ ] Rubro / enfoque NOA (citrícolas, ingenios, mayoristas).
- [ ] Imágenes placeholder (se crean/buscan después).

**Fuente de contenido**: extraer texto del `Trabajo Práctico Nº 1 - Estructura
Organizacional y Descripción de Puestos.doc` (ver Sección 6).

### Fase 2 — Store + persistencia (Supabase)

**Entregable**: estado dinámico persistido en base de datos.

- [ ] Crear proyecto Supabase (desde Vercel Dashboard → Integrations, o
      supabase.com) y capturar `SUPABASE_URL` + `SUPABASE_ANON_KEY`.
- [ ] Variables de entorno: `.env.local` (dev) + Vercel Dashboard (prod):
      `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- [ ] Agregar `@supabase/supabase-js` y un cliente (`src/lib/supabase.js`).
- [ ] Crear módulo `src/store/` con una interfaz limpia (leer/escribir estado)
      para desacoplar la UI del motor de persistencia.
- [ ] Esquema inicial (solo estado dinámico; seeds quedan en código):
  - `movements` (id, client_id, sku_id, type ingreso|egreso, rack_id, qty,
    operator, created_at)
  - `stock` (sku_id, client_id, rack_id, qty, lot, expiry)
- [ ] Migrar la asignación de racks y el flujo ingreso/egreso para que lean y
      escriban el store.

**Decisión pendiente**: Supabase (SDK client-side, sin backend) vs. Vercel
Postgres/Neon (requiere API routes = backend). Recomendación: **Supabase**.

### Fase 3 — Núcleo WMS funcional

**Entregable**: la demo cuenta la historia ingreso → egreso de verdad.

- [ ] Estado compartido: `Ingreso` escribe la ubicación asignada; `Egreso` la
      lee (hoy son funciones puras que no persisten → la demo "rompe").
- [ ] Stock/cantidad por SKU (dejar el binario ocupado/libre).
- [ ] Log de movimientos real (cada ingreso/egreso deja huella).
- [ ] Confirmación de picking (marcar recolectado).
- [ ] Página `/app/inventario`: listado de SKUs + ubicación + stock + alertas
      simples (stock bajo).
- [ ] Página `/app/trazabilidad`: historial de movimientos por SKU (kardex
      simple).

### Fase 4 — Features nivel 2 (suma "competencia")

- [ ] Órdenes multi-línea + pick list (pantalla "preparar pedido" que agrupa
      líneas y traza la ruta óptima).
- [ ] Recepción con cantidad + discrepancias (recibido vs esperado, simple).
- [ ] Lote + vencimiento como atributos visibles en SKUs perecederos (citrus /
      alimento), sin módulo de lotes completo.
- [ ] Zonas de depósito como capa visual (colorear racks por zona), sin tocar
      BFS/assign.
- [ ] Remito simple (pantalla de confirmación) + operador responsable
      (selector).

### Fase 5 — Pulido

- [ ] Buscador del dashboard funcional (o eliminarlo si no aporta).
- [ ] Saludo `"Hola, Agustín"`: llevarlo a una constante/config (el usuario es
      Agustín, así que puede quedarse; decidir).
- [ ] `updatedAt="2 min"` hardcodeado → valor real/derivado.
- [ ] (Opcional) pantalla de entrada `/app/ingresar` reutilizando
      `ClientSwitcher`.

---

## 4. Qué queda FUERA (descartado / nivel 3)

Bajo valor de demo o alto costo:

- CRUD de maestros (SKU/cliente) vía UI.
- Multi-ubicación por SKU con cantidades parciales.
- Pick list por oleada / wave picking.
- Recepción contra ASN / orden de compra esperada.
- Put-away manual (override de la ubicación auto-asignada).
- Packing / verificación de despacho.
- Transportista / carrier.
- Kardex por lote completo.
- Conteo cíclico / ajustes de inventario / devoluciones.
- Zonificación con impacto en el ruteo.

---

## 5. Criterios de éxito (para la presentación)

1. El mapa es el corazón: la ruta óptima se lee al instante.
2. La demo demuestra los 4 procesos WMS con terminología correcta.
3. Identidad NorteWare Solutions consistente (logo + español neutro + NOA).
4. Persistencia real: lo que se ingresa queda y se ve en inventario/movimientos.
5. Acabado profesional sobre funcionalidad extra.

---

## 6. Fuentes y assets

- **Logo**: `~/Descargas/NorteWare Logo.png` (1024×559 RGBA, verde, transparente).
- **TP1**: `Documentacion/Trabajo Práctico Nº 1 - Estructura Organizacional y
  Descripción de Puestos.doc` (Word binario). Sin herramientas de conversión
  instaladas (`libreoffice`/`antiword`/`pandoc` = NO). Opciones: (a) instalar
  una herramienta, (b) extraer con `strings` (texto aproximado), (c) que el
  usuario pegue el texto. **Pendiente de decidir.**
- **TP1.mkd / TP2.mkd**: perdidos (formateo de otra PC); el `.doc` es la única
  fuente que queda.

---

## 7. Preguntas abiertas

1. Persistencia: ¿confirmamos **Supabase** (recomendado) o Vercel Postgres/Neon?
2. Extracción del TP1 del `.doc`: ¿instalo herramienta, uso `strings`, o pegás
   el texto?
3. Saludo del dashboard: ¿"Hola, Agustín" fijo o lo generalizamos?
4. Pantalla de entrada `/app/ingresar`: ¿la sumamos (queda pro) o directo a
   `/app`?
