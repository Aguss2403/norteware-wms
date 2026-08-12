# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Profesores y compañeros de la materia Administración de Sistemas de Información (UTN FR Tucumán) que evalúan la demo durante una presentación en clase. La audiencia conoce el dominio WMS a nivel conceptual (los 4 procesos) y juzga si la demo demuestra comprensión del dominio y un acabado profesional.

## Product Purpose

Demo navegable de un WMS (Warehouse Management System) de la empresa ficticia NorteWare Solutions. Demuestra los procesos de recepción (ingreso) y preparación (egreso) sobre mapas de depósito configurables por cliente: al leer un QR de una caja se asigna ubicación o se traza la ruta óptima para almacenarla; al buscar un producto se traza la ruta óptima para retirarlo. Éxito = la presentación demuestra los procesos WMS con claridad visual y deja la sensación de producto profesional, no de maqueta.

## Positioning

Un WMS regional orientado al NOA (citrícolas, ingenios, distribución mayorista) cuyo diferencial es el mapa de depósito hecho a medida por cliente con rutas óptimas calculadas (BFS) entre el muelle y cada rack. La demo prueba ese diferencial visualmente: el mapa es el corazón del producto.

## Operating Context

- Se presenta en clase desde un navegador, corriendo localmente (`npm run dev`), en una máquina con proyector.
- El demo usa datos semilla: 3 clientes (citrícola, azúcar, mayorista), 8 SKUs (5 tipos de producto) y layouts de depósito en grid.
- Interacción: switcher de cliente, ingreso por QR simulado (campo + botón, sin cámara), egreso por buscador.
- Idioma de la interfaz: español neutro (profesional). Identificadores de código en inglés.

## Capabilities and Constraints

- Dashboard con resumen del cliente activo y enlaces de entrada.
- Ingreso: lectura de QR (simulada) → si el tipo de producto no tiene ubicación, se auto-asigna el rack libre más cercano; si ya tiene, se dibuja la ruta óptima al rack. Fallbacks: código inválido, sin rack libre, destino inalcanzable.
- Egreso: buscador de productos → al seleccionar, ruta de picking al rack asignado. Fallbacks: sin coincidencia, sin ubicación, destino inalcanzable.
- Mapa de depósito en grid por cliente, con celdas tipadas (pasillo/muelle/pared/rack), leyenda, conteo de pasos/distancia y animación de ruta.
- Stack existente: Vite 5 + React 18 (JS) + react-router-dom v6 + Tailwind CSS v4 (tokens `--color-brand-*` en `@theme`).
- Sin backend, sin persistencia (la asignación no persiste entre sesiones), sin cámara QR real.
- Copy de interfaz en español neutro — no cambiar a otro idioma.

## Brand Commitments

- Nombre: **NorteWare Solutions** (navbar y README lo usan).
- Copy de interfaz en español neutro/profesional.
- Enfoque regional NOA / agroindustrial (citrícolas, ingenios, mayoristas) reflejado en los clientes semilla.
- Paleta de marca existente en tokens Tailwind: azul profundo (`--color-brand*`) con acento ámbar (`--color-brand-accent`).

## Evidence on Hand

- `../Documentation/TP 1.mkd` — estructura organizacional, los 4 procesos WMS de NorteWare, descripción de puestos.
- `../Documentation/TP 2.mkd` — adquisición de software/hardware, stack documentado.
- `README.md` — cómo correr la demo, clientes semilla y flujos.
- No hay testimonios, casos de uso reales, precios ni deployment claims — no inventar.

## Product Principles

1. El mapa es el corazón: la ruta óptima debe leerse al instante y verse como producto real, no como demo académica.
2. Demostrar el dominio WMS: cada pantalla debe reflejar los procesos de recepción/preparación con terminología correcta.
3. Preservar la identidad: NorteWare Solutions, español neutro, enfoque NOA.
4. Claridad antes que decoración: la información operativa (ubicación, ruta, estado) gana sobre el adorno.
5. Acabado profesional sobre funcionalidad extra: pocas features bien pulidas.

## Accessibility & Inclusion

Sin requisito específico establecido más allá de estados claros de éxito/error visibles (contraste de colores en el mapa y mensajes de estado legibles).
