// Página institucional "Nosotros" (requisito de la cátedra). Contenido extraído
// del TP1 ("Estructura Organizacional y Descripción de Puestos"): rubro, misión,
// visión, objetivos, estrategias y organigrama del área de Sistemas.
// Copy en español neutro; identificadores de código en inglés. Las imágenes se
// suman después (placeholder por ahora: solo tipografía y cards).

const OBJECTIVES = [
  {
    horizon: 'Corto plazo',
    text: 'Desarrollar y lanzar la primera versión (MVP) del WMS e integrar los módulos de recepción, inventario y despacho.',
  },
  {
    horizon: 'Mediano plazo',
    text: 'Implementar el módulo IoT para control de temperatura en cámaras de frío y captar una cuota de mercado local.',
  },
  {
    horizon: 'Largo plazo',
    text: 'Posicionar a la empresa como líder del rubro frente a la competencia de Buenos Aires, centrándonos en el interior.',
  },
];

const STRATEGIES = [
  'Diferenciación por servicio: SLAs de atención presencial en planta ante caídas del sistema.',
  'Desarrollo modular: vender el software por módulos para adaptarse a PyMEs y grandes ingenios.',
  'Alianzas con proveedores de hardware para ofrecer un paquete "llave en mano".',
  'Adopción por fases: de apps móviles/PWA a terminales de radiofrecuencia y colectoras industriales.',
];

// Organigrama del área de Sistemas (TP1 §4). El CTO depende del CEO; los cinco
// roles técnicos dependen del CTO. La sección §3 del TP1 era una imagen y no
// se convirtió, así que la jerarquía se infiere de las dependencias declaradas.
const ROLES = [
  {
    title: 'Desarrollador Backend',
    text: 'Construye el motor del WMS: lógica de negocio, procesamiento y base de datos relacional.',
  },
  {
    title: 'Desarrollador Frontend / Mobile',
    text: 'Crea las interfaces web y móvil para supervisores de oficina y operarios de depósito.',
  },
  {
    title: 'Especialista en Integración Tecnológica',
    text: 'Puente entre el software y el entorno físico: hardware, RFID, IoT y telemetría.',
  },
  {
    title: 'Analista de Calidad de Software (QA)',
    text: 'Audita y valida cada funcionalidad antes de su implementación en producción.',
  },
  {
    title: 'Analista de Sistemas / Funcional',
    text: 'Traduce las necesidades logísticas del cliente en requerimientos técnicos.',
  },
];

export default function Nosotros() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <img
            src="/norteware-logo.png"
            alt="NorteWare Solutions"
            className="mx-auto h-20 w-auto sm:h-24"
          />
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            NorteWare Solutions
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-text-muted">
            Software especializado en gestión logística y agroindustrial para el Noroeste Argentino.
          </p>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">Quiénes somos</h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-text-muted">
            Desarrollamos soluciones prácticas para empresas de la región que necesitan optimizar
            sus procesos de inventario, distribución y comercio electrónico. Nuestro enfoque integra
            tecnología moderna con soporte local, permitiendo a los clientes mejorar la trazabilidad
            de sus productos, agilizar la preparación de pedidos y adaptarse al crecimiento del
            mercado digital.
          </p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-text-muted">
            Enfocarnos en un WMS específico para las necesidades del NOA —citrícolas, ingenios,
            distribución mayorista y e-commerce regional— nos da una ventaja competitiva frente a
            soluciones genéricas o empresas sin soporte presencial.
          </p>
        </div>
      </section>

      {/* Misión / Visión */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-7 shadow-card">
            <h2 className="font-display text-xl font-semibold text-text">Misión</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-text-muted">
              Proveer soluciones de software de gestión de almacenes (WMS) adaptables, robustas y
              de vanguardia, optimizando las operaciones logísticas y de trazabilidad de las
              industrias del NOA a través de la digitalización y el soporte presencial especializado.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-7 shadow-card">
            <h2 className="font-display text-xl font-semibold text-text">Visión</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-text-muted">
              Convertirnos en el socio tecnológico de referencia para la transformación digital del
              sector logístico y agroindustrial del Noroeste Argentino, expandiendo nuestras
              soluciones a toda la región.
            </p>
          </div>
        </div>
      </section>

      {/* Objetivos */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">Objetivos</h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {OBJECTIVES.map(({ horizon, text }) => (
            <div key={horizon} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-brand-deep">
                {horizon}
              </span>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Organigrama */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              Organigrama del área de Sistemas
            </h2>
            <p className="mt-2 text-[14px] text-text-muted">
              Estructura de la dirección tecnológica y los equipos de desarrollo.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center">
            {/* CEO */}
            <div className="rounded-2xl border border-border bg-surface px-8 py-3 text-center shadow-card">
              <div className="font-display text-[15px] font-semibold text-text">Dirección General</div>
              <div className="text-[12.5px] text-text-muted">CEO</div>
            </div>
            <div className="h-6 w-px bg-border" aria-hidden="true" />

            {/* CTO */}
            <div className="rounded-2xl border-2 border-brand/40 bg-surface px-8 py-3 text-center shadow-card">
              <div className="font-display text-[15px] font-semibold text-text">Gerente de Sistemas</div>
              <div className="text-[12.5px] text-text-muted">CTO · Dirección Tecnológica</div>
            </div>
            <div className="h-6 w-px bg-border" aria-hidden="true" />

            {/* Roles técnicos */}
            <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ROLES.map(({ title, text }) => (
                <div key={title} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                  <h3 className="font-display text-[14px] font-semibold text-text">{title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Estrategias */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">Estrategias</h2>
        </div>
        <ul className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
          {STRATEGIES.map((strategy) => (
            <li
              key={strategy}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-[13.5px] leading-relaxed text-text-muted shadow-card"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <span>{strategy}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
