# NorteWare WMS — Demo

Demo de un sistema de gestión de almacenes (WMS) para la materia **Administración de Sistemas de Información** (UTN FR Tucumán). Aplicación React (Vite) que simula los flujos de **ingreso de mercadería** y **egreso/picking** sobre el plano de un almacén, con búsqueda de ruta determinística y datos de ejemplo sembrados.

## Requisitos

- Node.js >= 18

## Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # build de producción + validación de semillas
```

## Clientes de ejemplo

El selector de la barra superior permite alternar entre los tres clientes sembrados; cada uno tiene su propio plano de almacén:

| Cliente | Plano | Dock |
|---|---|---|
| Citrus del NOA S.A. | 6 × 8 | 0-0 |
| Ingenio Norte Azúcar | 5 × 8 | 4-0 |
| Distribuidora Norte Mayorista | 7 × 7 | 6-0 |

## Flujos de la demo

### Ingreso de mercadería (`/ingreso`)

1. Ingresar un código de SKU (ej. `SKU-001`) o usar el botón **Código demo**.
2. Si el tipo de producto **no tiene** ubicación asignada, se asigna automáticamente el estante libre más cercano y se traza la ruta (ej. `SKU-001` → estante `2-6` en Citrus).
3. Si el tipo **ya está asignado**, se traza la ruta al estante más cercano de ese tipo sin asignar nada nuevo (ej. `SKU-002` → estante `1-6` en Citrus).
4. Códigos inexistentes muestran un error; tipos sin ruta accesible muestran "No hay ruta…" y almacenes sin espacio libre muestran "No hay espacio…".

### Egreso y picking (`/egreso`)

1. Buscar por código o nombre (ej. `lim` para Limón fresco) — los resultados muestran el estado de ubicación de cada SKU.
2. Seleccionar un producto con ubicación asignada traza la ruta de picking desde el muelle.
3. Productos sin ubicación reportan "sin stock"; tipos inaccesibles reportan "sin ruta".

### Notas

- **Lectura de QR simulada**: el escaneo por cámara queda fuera de alcance; la entrada es manual o mediante el botón de código demo.
- La asignación de estantes es determinística y se valida en el build (`scripts/validate-seeds.mjs`).
- No hay backend ni persistencia: todos los datos viven en memoria.
