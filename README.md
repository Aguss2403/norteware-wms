# NorteWare WMS — Demo

Demo de un sistema de gestión de almacenes (WMS) para la materia **Administración de Sistemas de Información** (UTN FR Tucumán). Aplicación React (Vite) que simula los flujos de **ingreso de mercadería** y **egreso/picking** sobre el plano de un almacén, con búsqueda de ruta determinística (BFS) y datos de ejemplo sembrados.

Incluye sitio promocional (Landing + Nosotros), pantalla de entrada por cliente, dashboard, mapa del depósito, inventario y trazabilidad. El estado dinámico se persiste en `localStorage` y, opcionalmente, en Supabase.

## Requisitos

- Node.js >= 18

## Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # build de producción + validación de semillas
```

### Persistencia opcional (Supabase)

Sin configuración, la demo persiste solo en `localStorage` (por dispositivo) y funciona igual. Para habilitar el espejo compartido en Supabase:

1. Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
2. Aplicar el esquema: `SUPABASE_DB_URL="postgres://...:5432/postgres" node scripts/migrate.mjs`.

## Clientes de ejemplo

| Cliente | Plano | Muelle |
|---|---|---|
| Citrus del NOA S.A. | 6 × 8 | 0-0 |
| Ingenio Norte Azúcar | 5 × 8 | 4-0 |
| Distribuidora Norte Mayorista | 7 × 7 | 6-0 |

## Rutas de la aplicación

| Ruta | Contenido |
|---|---|
| `/` | Landing promocional |
| `/nosotros` | Página institucional |
| `/app/ingresar` | Pantalla de entrada (selección de cliente) |
| `/app` | Dashboard |
| `/app/ingreso` | Ingreso de mercadería |
| `/app/egreso` | Egreso y picking |
| `/app/mapa` | Mapa del depósito |
| `/app/inventario` | Inventario |
| `/app/trazabilidad` | Trazabilidad |

## Flujos de la demo

### Ingreso de mercadería (`/app/ingreso`)

1. Ingresar un código de SKU (ej. `SKU-001`) o usar un **código demo**.
2. Si el tipo de producto **no tiene** ubicación asignada, se asigna automáticamente el estante libre más cercano y se traza la ruta (ej. `SKU-001` → estante `2-6` en Citrus).
3. Si el tipo **ya está asignado**, se traza la ruta al estante más cercano de ese tipo sin asignar nada nuevo (ej. `SKU-002` → estante `1-6` en Citrus).
4. Códigos inexistentes muestran un error; tipos sin ruta accesible muestran "No hay ruta…" y almacenes sin espacio libre muestran "No hay espacio…".

### Egreso y picking (`/app/egreso`)

1. Buscar por código o nombre (ej. `lim` para Limón fresco).
2. Agregar SKUs a un **pedido en curso** (cada línea = SKU + cantidad).
3. **Preparar pedido** resuelve cada línea (ubicación + ruta + estado).
4. **Confirmar picking** registra la salida y emite un **remito de despacho**.

### Inventario y trazabilidad

- **Inventario**: stock por SKU, con lote, vencimiento y alertas de "próximo a vencer".
- **Trazabilidad**: historial de movimientos (ingresos y egresos) con operador responsable.

### Notas

- **Lectura de QR simulada**: el escaneo por cámara queda fuera de alcance; la entrada es manual o mediante códigos demo.
- La asignación de estantes es determinística y se valida en el build (`scripts/validate-seeds.mjs`).
- Sin Supabase configurado, la persistencia es local (`localStorage`); con Supabase, el estado se refleja entre dispositivos.

## Documentación

- [Documentacion/Guia-del-Proyecto.md](Documentacion/Guia-del-Proyecto.md) — resumen general e índice.
- [Documentacion/Manual-de-Uso.md](Documentacion/Manual-de-Uso.md) — qué hace y cómo se usa.
- [Documentacion/Arquitectura-Tecnica.md](Documentacion/Arquitectura-Tecnica.md) — cómo funciona por dentro.
- [Documentacion/Guion-de-Presentacion.md](Documentacion/Guion-de-Presentacion.md) — guión para la clase.
