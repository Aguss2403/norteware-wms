# NorteWare WMS — Arquitectura Técnica

> Cómo funciona el sistema por dentro. Complementa a [Guia-del-Proyecto.md](Guia-del-Proyecto.md).

---

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Build | Vite 5 |
| UI | React 18.3 (JavaScript) |
| Ruteo | react-router-dom v6 |
| Componentes | Material UI (MUI) v6 |
| Estilos | Tailwind CSS v4 + tokens de tema MUI |
| Persistencia | localStorage + Supabase (Postgres) |
| Tipografías | Self-hosted (@fontsource): Space Grotesk, Inter, IBM Plex Mono |

> Importante: las fuentes están **auto-alojadas**, por lo que la demo funciona **sin conexión** (ideal para presentar en el aula).

---

## 2. Estructura del código

```
src/
├── data/          # Datos semilla: clientes, layouts, SKUs, dashboard, visuales
├── domain/        # Lógica de negocio pura (sin UI, testeable)
│   ├── model.js       # Modelo de ubicación + grilla del depósito
│   ├── bfs.js         # Búsqueda en anchura (ruta más corta)
│   ├── assign.js      # Auto-asignación de estante libre más cercano
│   ├── inbound.js     # Resolución del flujo de ingreso
│   ├── outbound.js    # Resolución del flujo de egreso
│   ├── order.js       # Pedidos multi-línea
│   └── warehouseState.js # Estado dinámico sobre el layout semilla
├── store/         # Persistencia (localStorage + Supabase)
├── context/       # Estado compartido de la app (cliente activo + estado)
├── lib/           # Cliente de Supabase
├── components/    # Piezas de UI reutilizables (mapa, sidebar, buscador…)
├── layouts/       # MarketingLayout (público) y AppLayout (con sidebar)
├── pages/         # Una por pantalla (Landing, Dashboard, Ingreso…)
└── theme.js       # Tema claro "SaaS workspace"
```

---

## 3. El modelo del depósito

El plano de cada cliente es una **grilla** de celdas. Cada celda tiene un **tipo**:

- `dock` — muelle de entrada/salida
- `path` — pasillo (transitable)
- `rack` — estante (con capacidad y, opcionalmente, un tipo de producto asignado)
- `wall` — pared (intransitable)

Un estante **libre** es un rack sin tipo de producto asignado. Esta estructura es la que alimenta el cálculo de rutas.

---

## 4. La ruta óptima (BFS determinista)

El sistema usa **Breadth-First Search (BFS)** — búsqueda en anchura — sobre la grilla para encontrar la **ruta más corta** entre el muelle y un estante:

- El orden de los vecinos está **fijo** (arriba, derecha, abajo, izquierda), por lo que el resultado es **siempre el mismo** (determinista).
- Las paredes bloquean el paso; los racks no se pueden atravesar (solo se entra al estante destino).
- Un destino inalcanzable devuelve "sin ruta" en lugar de fallar.

---

## 5. Auto-asignación

Cuando un tipo de producto no tiene ubicación, el sistema:

1. Filtra los **estantes libres**.
2. Calcula la distancia BFS desde el muelle a cada uno.
3. Elige el más cercano (desempate por fila y columna, para ser determinista).
4. Lo asigna y traza la ruta.

---

## 6. Persistencia

El estado dinámico por cliente es:

- `assignments` — estante → tipo de producto (asignaciones automáticas)
- `stock` — SKU → cantidad
- `movements` — registro de ingresos y egresos (log)

Este estado se guarda en **dos capas**:

1. **localStorage** (autoritativo, por dispositivo): funciona siempre, incluso sin backend.
2. **Supabase** (espejo compartido, opcional): permite que el estado sobreviva entre dispositivos. Se activa solo si están configuradas las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (ver `.env.example`).

Sin Supabase configurado, la demo **degrada a localStorage** y sigue funcionando perfectamente para la presentación.

El esquema de Supabase (`supabase/schema.sql`) define tres tablas que espejan ese estado: `assignments`, `stock` y `movements`. Solo el estado **dinámico** vive en la base; los datos semilla (clientes, layouts, SKUs) permanecen en el código del frontend.

---

## 7. Separación de responsabilidades

El diseño sigue un principio claro: la **lógica de negocio vive en `src/domain/` como funciones puras** (sin React ni DOM), de modo que:

- El mismo cálculo sirve para todas las pantallas.
- Es **testeable sin navegador**.
- Un script de **validación** (`scripts/validate-seeds.mjs`) corre en cada `npm run build` y verifica que los datos semilla, las rutas y la auto-asignación sigan comportándose como se espera (esto "traba" el build si algo se rompe).

---

## 8. Arquitectura visual y marca

- **Identidad**: NorteWare Solutions, con paleta en **verde profundo** (`--color-brand*`) y acento ámbar.
- **Idioma de la interfaz**: español neutro/profesional; los identificadores de código (SKUs, rutas) en inglés.
- **Dos áreas**: el sitio promocional (fondo claro) y el producto WMS con **sidebar oscuro** de 240px. El mapa es el único elemento oscuro dentro del lienzo claro del producto.
- **Mapa industrial**: SVG con zonas operativas (recepción, almacenamiento a granel, rack principal, picking rápido, control de calidad, despacho), corredores, pasillos, estantes, muelle, puertas y siluetas (camión, palet, carretilla, escáner).
