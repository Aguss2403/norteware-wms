# NorteWare WMS — Manual de Uso

> Qué hace el sistema y cómo se usa, paso a paso. Complementa a [Guia-del-Proyecto.md](Guia-del-Proyecto.md).

---

## 1. Funcionalidades

### 1.1 Sitio promocional (público)

Dos pantallas **sin** sidebar, pensadas como la "vidriera" de la empresa:

- **Landing (`/`)**: hero, características del WMS, los 4 procesos y botones de acción.
- **Nosotros (`/nosotros`)**: página institucional con misión, visión, objetivos, estrategias y el organigrama del área de Sistemas (contenido del TP1).

### 1.2 Pantalla de entrada (`/app/ingresar`)

Sin autenticación real: permite **elegir el cliente** con el que se va a operar (cada cliente tiene su propio depósito). Lleva al dashboard.

### 1.3 Dashboard (`/app`)

Vista general estilo SaaS, con:

- **4 indicadores (KPIs)**: órdenes del día, ocupación de racks, SKUs en stock y tiempo promedio de picking.
- **Mapa del depósito** en vivo (tarjeta oscura central).
- **Estado de los estantes** (ocupado / libre).
- **Tabla de movimientos** recientes.

> Nota: "Órdenes hoy" y "Tiempo promedio de picking" son valores de muestra (mock). La **ocupación de racks**, los **SKUs en stock** y los **movimientos** son datos reales calculados en vivo.

### 1.4 Ingreso de mercadería (`/app/ingreso`)

Recepción mediante **lectura de QR simulada** (campo de texto + botones de códigos demo; sin cámara). Al ingresar un código:

1. Si el tipo de producto **no tiene ubicación asignada**, el sistema **auto-asigna el estante libre más cercano** al muelle y traza la ruta.
2. Si el tipo **ya está asignado**, traza la ruta al estante más cercano de ese tipo (sin asignar nada nuevo).
3. Casos de error: código inexistente, "no hay ruta" (estantes inalcanzables) o "no hay espacio" (almacén lleno).

### 1.5 Egreso y picking (`/app/egreso`)

Preparación de pedidos:

- Buscador de productos por código o nombre.
- Se arma un **pedido en curso** (varias líneas = SKU + cantidad).
- **"Preparar pedido"** resuelve cada línea (ubicación + ruta + estado).
- **"Confirmar picking"** registra la salida y emite un **remito de despacho**.
- Cada línea puede resultar: lista, sin ubicación, stock insuficiente o sin ruta.

### 1.6 Mapa del depósito (`/app/mapa`)

El plano industrial en SVG a pantalla completa, con zonas, pasillos, corredores, estantes, muelle y puertas. Sin ruta activa muestra el plano en reposo.

### 1.7 Inventario (`/app/inventario`)

Tabla con el stock actual por SKU: producto, lote, vencimiento, ubicación, cantidad y estado (**en stock / stock bajo / sin stock**). Los productos perecederos muestran alerta **"próximo a vencer"**.

### 1.8 Trazabilidad (`/app/trazabilidad`)

Historial de movimientos (kardex simple): cada ingreso y egreso queda registrado con fecha, SKU, tipo, ubicación, cantidad y operador responsable.

---

## 2. Cómo se usa — guía paso a paso

### 2.1 Puesta en marcha

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # build de producción + validación automática de datos semilla
```

Requisito: **Node.js >= 18**.

### 2.2 Flujo de demo recomendado

1. **Abrir la app** → cae en la Landing (`/`).
2. **"Ingresar al sistema"** → pantalla de entrada; elegir **Citrus del NOA S.A.**.
3. **Dashboard**: explicar los KPIs y el mapa.
4. **Ingreso**: tocar el código demo **SKU-001** (Jugo de naranja). Como su tipo no tiene ubicación, el sistema **auto-asigna el estante `2-6`** y dibuja la ruta. Luego **SKU-002** (Naranja fresca): como su tipo ya está asignado, traza la ruta al estante `1-6`.
5. **Inventario**: mostrar que el stock y las ubicaciones reflejan lo ingresado.
6. **Egreso**: buscar "lim" → seleccionar **Limón fresco** → "Preparar pedido" → "Confirmar picking" → aparece el **remito de despacho**.
7. **Trazabilidad**: mostrar el historial de movimientos generado.
8. **Cambiar de cliente** (sidebar, abajo) para mostrar que cada cliente tiene su propio depósito.

### 2.3 Ejemplos concretos de comportamiento

**Ingreso (cliente Citrus):**

| Código | Tipo de producto | Resultado |
|---|---|---|
| `SKU-001` | PT-JUGO (sin ubicación) | Auto-asigna estante `2-6` y traza ruta |
| `SKU-002` / `SKU-003` | PT-CITRICO (asignado) | Traza ruta al estante `1-6` |
| `SKU-006` / `SKU-007` | PT-ENVASE (inaccesible) | "No hay ruta al estante…" |
| código inexistente | — | "Código de SKU desconocido" |

**Egreso (cliente Citrus):**

| Búsqueda | Resultado |
|---|---|
| `lim` | Limón fresco (SKU-003) |
| Producto sin ubicación (PT-JUGO antes de asignar) | "sin stock" |
| Tipo inaccesible (PT-ENVASE) | "sin ruta" |

---

## 3. Datos de ejemplo (semilla)

### 3.1 Clientes

| Cliente | Plano | Muelle | Rubro |
|---|---|---|---|
| Citrus del NOA S.A. | 6 × 8 | `0-0` | Citrícola y empaque |
| Ingenio Norte Azúcar | 5 × 8 | `4-0` | Ingenio azucarero |
| Distribuidora Norte Mayorista | 7 × 7 | `6-0` | Distribución mayorista |

### 3.2 SKUs y tipos de producto

| SKU | Producto | Tipo | Lote | Vencimiento |
|---|---|---|---|---|
| SKU-001 | Jugo de naranja | PT-JUGO | L-001 | 60 días |
| SKU-002 | Naranja fresca | PT-CITRICO | L-002 | 15 días |
| SKU-003 | Limón fresco | PT-CITRICO | L-003 | 15 días |
| SKU-004 | Azúcar refinada | PT-AZUCAR | L-004 | — |
| SKU-005 | Azúcar morena | PT-AZUCAR | L-005 | — |
| SKU-006 | Botella PET 1L | PT-ENVASE | — | — |
| SKU-007 | Caja de cartón corrugado | PT-ENVASE | — | — |
| SKU-008 | Salsa de tomate | PT-ALIMENTO | L-006 | 180 días |

Hay **8 SKUs** agrupados en **5 tipos de producto**. Cada tipo se asigna a estantes; algunos tipos no tienen ubicación asignada a propósito, para poder demostrar la auto-asignación en vivo.

### 3.3 Operadores

La app ofrece un selector con tres operadores de ejemplo (se registran en cada movimiento): **Operario 1**, **Operario 2** y **Jefe de depósito**.

---

## 4. Glosario

| Término | Significado |
|---|---|
| **WMS** | Warehouse Management System — sistema de gestión de almacenes |
| **SKU** | Stock Keeping Unit — identificador único de un producto |
| **Tipo de producto** | Categoría que agrupa SKUs (ej. PT-CITRICO) y determina dónde se guarda |
| **Estante / rack** | Celda de la grilla donde se almacena un tipo de producto |
| **Muelle / dock** | Punto de entrada y salida del depósito |
| **BFS** | Breadth-First Search — algoritmo de búsqueda en anchura usado para la ruta más corta |
| **Auto-asignación** | Asignar automáticamente el estante libre más cercano a un producto entrante |
| **Picking** | Proceso de recolectar productos para preparar un pedido |
| **Kardex** | Registro histórico de movimientos de stock |
| **Remito** | Documento que acompaña la salida de mercadería |
| **Semilla (seed)** | Datos de ejemplo embebidos en el código (clientes, layouts, SKUs) |
