# NorteWare WMS — Guía del Proyecto

> Documentación de referencia para el equipo. Este archivo es el **punto de entrada**: da el resumen general y enlaza a los documentos detallados.

## Documentos

| Documento | Contenido |
|---|---|
| [Manual de Uso](Manual-de-Uso.md) | Qué hace el sistema y cómo se usa (paso a paso) |
| [Arquitectura Técnica](Arquitectura-Tecnica.md) | Cómo funciona por dentro (stack, estructura, algoritmo) |
| [Guión de Presentación](Guion-de-Presentacion.md) | Secuencia sugerida para exponer en clase |

---

## 1. Resumen general

**NorteWare WMS** es una demo navegable de un *Warehouse Management System* (sistema de gestión de almacenes). Fue desarrollado para la materia **Administración de Sistemas de Información** (UTN FR Tucumán).

La aplicación simula el funcionamiento de los depósitos de una empresa ficticia, **NorteWare Solutions**, orientada al NOA argentino (citrícolas, ingenios azucareros y distribución mayorista). Su diferencial es un **mapa de depósito hecho a medida por cliente**, sobre el cual el sistema **calcula la ruta más corta** entre el muelle y cada estante.

En una frase: *una herramienta que, al leer el código de una caja, le dice al operario exactamente dónde guardarla — o dónde está para retirarla — trazando la ruta óptima en el plano del almacén.*

---

## 2. Contexto y objetivo

| Aspecto | Detalle |
|---|---|
| **Materia** | Administración de Sistemas de Información — UTN FR Tucumán |
| **Empresa** | NorteWare Solutions (ficticia) |
| **Producto** | WMS regional para el NOA |
| **Propósito de la demo** | Demostrar, con claridad visual, los procesos WMS y dejar sensación de producto profesional (no de maqueta) |
| **Público** | Profesores y compañeros que evalúan la presentación en clase |

La idea central que la demo quiere comunicar: **el mapa es el corazón del producto**. La ruta óptima debe leerse al instante y verse como un producto real.

---

## 3. ¿Qué es un WMS?

Un **WMS** (*Warehouse Management System*) es el software que administra las operaciones de un depósito: qué entra, dónde se guarda, cómo se preparan los pedidos y qué sale. El proyecto se estructura alrededor de los **cuatro procesos** clásicos del dominio:

| # | Proceso | Qué significa | Dónde se ve en la app |
|---|---|---|---|
| 01 | **Recepción** | Ingreso de mercadería, registro de lote y origen | Pantalla **Ingreso** |
| 02 | **Almacenamiento** | Asignar a cada carga una ubicación exacta | Auto-asignación de estante en **Ingreso** |
| 03 | **Preparación** | Armar el pedido recorriendo la ruta más corta | Pantalla **Egreso** (picking) |
| 04 | **Despacho** | Validar la salida y dejar documentación | **Remito de despacho** + **Trazabilidad** |

---

## Referencias

- **README.md** — cómo correr la demo, rutas y flujos principales.
- **PRODUCT.md** — visión de producto y criterios de éxito.
- **PLAN.md** — plan de implementación por fases.
- **Documentacion/Trabajo Práctico Nº 1 — …md** — estructura organizacional y descripción de puestos (TP1).
- **supabase/schema.sql** — esquema de base de datos (estado dinámico).
