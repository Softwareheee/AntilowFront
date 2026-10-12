const serviceCards = [
	{
		number: '01',
		title: 'Mantenimiento preventivo',
		description: 'Cuidado periódico para que tus equipos rindan mejor y duren más.',
		image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Técnico trabajando cuidadosamente con un equipo electrónico',
		action: 'Solicitar mantenimiento',
		section: 'support',
		accent: 'text-cyan-300',
	},
	{
		number: '02',
		title: 'Reparación y diagnóstico',
		description: 'Identificamos el problema y te explicamos la solución antes de actuar.',
		image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Herramientas y componentes para reparación de equipos',
		action: 'Contar qué le pasa a mi equipo',
		section: 'support',
		accent: 'text-red-300',
	},
	{
		number: '03',
		title: 'Equipos y periféricos',
		description: 'Encuentra opciones para estudiar, trabajar y disfrutar tu tecnología.',
		image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Computador portátil listo para trabajar',
		action: 'Explorar inventario',
		section: 'inventory',
		accent: 'text-amber-300',
	},
]

const serviceSteps = [
	{ number: '01', title: 'Cuéntanos', description: 'Descríbenos tu equipo y qué necesitas. Recibimos tu solicitud desde soporte.' },
	{ number: '02', title: 'Evaluamos', description: 'Revisamos el caso y te orientamos con claridad sobre los siguientes pasos.' },
	{ number: '03', title: 'Lo ponemos a punto', description: 'Realizamos el trabajo acordado y puedes seguir el avance de tu solicitud.' },
]

function Inicio({ onNavigate, onLogin, onRegister }) {
	return (
		<section className="landing-page space-y-16 pb-8 sm:space-y-24" aria-labelledby="landing-title">
			<section className="landing-hero relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/30 sm:rounded-[2rem]">
				<img className="landing-hero-image absolute inset-0 -z-20 h-full w-full object-cover" src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1800&q=90" alt="" fetchPriority="high" />
				<div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080b12] via-[#080b12]/95 to-[#080b12]/55" aria-hidden="true" />
				<div className="landing-grid absolute inset-0 -z-10 opacity-30" aria-hidden="true" />
				<div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-red-500/20 blur-[100px]" aria-hidden="true" />

				<div className="grid min-h-[570px] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-14">
					<div className="landing-hero-copy max-w-2xl">
						<p className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-red-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 sm:text-xs">
							<span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_#f87171]" />
							Tecnología cercana en el Oriente Antioqueño
						</p>
						<h1 id="landing-title" className="font-['Space_Grotesk'] text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
							Tu tecnología, en buenas manos<span className="text-red-400">.</span>
						</h1>
						<p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
							Mantenimiento, reparación y soporte para que tus equipos vuelvan a acompañarte en lo que más importa.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<button className="landing-primary-button inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300" type="button" onClick={() => onNavigate('support')}>
								Solicitar soporte
								<svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
							</button>
							<button className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[.04] px-5 py-3.5 text-sm font-bold text-slate-200 transition hover:border-white/30 hover:bg-white/[.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" type="button" onClick={() => onNavigate('inventory')}>
								Ver equipos
							</button>
						</div>
						<div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs font-semibold text-slate-400">
							<span className="flex items-center gap-2"><span className="text-cyan-300">✳</span> Diagnóstico claro</span>
							<span className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Servicio con garantía</span>
							<span className="flex items-center gap-2"><span className="text-amber-300">⌁</span> Atención cercana</span>
						</div>
					</div>

					<div className="landing-hero-visual relative mx-auto w-full max-w-md lg:ml-auto">
						<div className="landing-image-frame relative aspect-[4/4.2] overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-900 shadow-2xl shadow-black/40">
							<img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1100&q=85" alt="Profesional revisando un equipo durante un servicio técnico" />
							<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" aria-hidden="true" />
							<div className="absolute bottom-5 left-5 right-5">
								<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">Antilow · Soporte & equipos</p>
								<p className="mt-1 text-lg font-bold text-white">Soluciones confiables para tu día a día.</p>
							</div>
						</div>
					</div>
				</div>
				<div className="absolute bottom-0 left-0 h-1 w-2/5 bg-gradient-to-r from-red-500 via-cyan-400 to-transparent" aria-hidden="true" />
			</section>

			<section aria-labelledby="services-title">
				<div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
					<div><p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Lo que hacemos</p><h2 id="services-title" className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-white sm:text-4xl">Tecnología lista para seguir</h2></div>
					<p className="max-w-md text-sm leading-6 text-slate-400">Soluciones para cuidar, recuperar y elegir tus equipos, con atención pensada para personas.</p>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					{serviceCards.map((service, index) => <article className="landing-service-card group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/10" key={service.number} style={{ animationDelay: `${index * 100}ms` }}>
						<div className="relative h-52 overflow-hidden">
							<img className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={service.image} alt={service.imageAlt} loading="lazy" />
							<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" aria-hidden="true" />
							<span className={`absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1 text-[10px] font-black tracking-widest ${service.accent}`}>{service.number}</span>
						</div>
						<div className="p-5">
							<h3 className="text-lg font-bold text-white">{service.title}</h3>
							<p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{service.description}</p>
							<button className={`mt-4 inline-flex items-center gap-2 text-xs font-bold ${service.accent} transition group-hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`} type="button" onClick={() => onNavigate(service.section)}>
								{service.action}<span aria-hidden="true">→</span>
							</button>
						</div>
					</article>)}
				</div>
			</section>

			<section className="grid gap-4 lg:grid-cols-2" aria-label="Misión y visión de Antilow">
				<article className="landing-purpose-card relative overflow-hidden rounded-2xl border border-red-300/15 bg-gradient-to-br from-red-400/[.10] to-slate-900/80 p-7 sm:p-9">
					<div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-400/10 blur-3xl" aria-hidden="true" />
					<p className="relative text-xs font-bold uppercase tracking-[0.22em] text-red-300">Nuestra misión</p>
					<h2 className="relative mt-5 font-['Space_Grotesk'] text-2xl font-semibold leading-relaxed text-white sm:text-3xl">“Transformamos la tecnología en soluciones confiables con garantía para todos.”</h2>
					<div className="relative mt-7 h-px w-16 bg-red-400/70" aria-hidden="true" />
					<p className="relative mt-4 text-sm leading-6 text-slate-400">Cada equipo cuenta una historia. Nos dedicamos a ayudar a que pueda seguir adelante.</p>
				</article>
				<article className="landing-purpose-card landing-purpose-card-delayed relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/[.08] to-slate-900/80 p-7 sm:p-9">
					<div className="absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden="true" />
					<p className="relative text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Nuestra visión · 2030</p>
					<h2 className="relative mt-5 font-['Space_Grotesk'] text-xl font-semibold leading-relaxed text-white sm:text-2xl">“Para el 2030, seremos la primera opción y el referente indiscutible de confianza en el Oriente Antioqueño, expandiendo nuestra atención para transformar la experiencia tecnológica de miles de familias y usuarios.”</h2>
				</article>
			</section>

			<section aria-labelledby="process-title">
				<div className="mb-7 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Así trabajamos</p><h2 id="process-title" className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-white sm:text-4xl">Acompañamiento de principio a fin</h2></div>
				<div className="grid gap-3 md:grid-cols-3">
					{serviceSteps.map((step, index) => <article className="landing-step-card relative rounded-2xl border border-white/10 bg-slate-900/60 p-6" key={step.number} style={{ animationDelay: `${index * 100}ms` }}>
						<span className="font-['Space_Grotesk'] text-4xl font-bold text-white/10">{step.number}</span>
						<h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
						<p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
						{index < serviceSteps.length - 1 && <span className="absolute -right-2 top-1/2 z-10 hidden h-4 w-4 rotate-45 border-r border-t border-cyan-300/40 bg-[#0b0f18] md:block" aria-hidden="true" />}
					</article>)}
				</div>
			</section>

			<section className="landing-cta relative overflow-hidden rounded-2xl border border-red-300/20 bg-gradient-to-r from-red-500/15 via-slate-900/90 to-cyan-400/10 px-6 py-10 text-center sm:px-10 sm:py-14">
				<div className="landing-cta-glow absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-red-400/10 blur-3xl" aria-hidden="true" />
				<p className="relative text-xs font-bold uppercase tracking-[0.22em] text-red-300">Estamos para ayudarte</p>
				<h2 className="relative mx-auto mt-3 max-w-2xl font-['Space_Grotesk'] text-3xl font-bold text-white sm:text-4xl">Démosle una nueva oportunidad a tu tecnología.</h2>
				<p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">Cuéntanos qué necesitas y encontraremos contigo el siguiente paso.</p>
				<div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
					<button className="landing-primary-button rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300" type="button" onClick={() => onNavigate('support')}>Hablar con soporte</button>
					{onRegister && <button className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/[.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" type="button" onClick={onRegister}>Crear mi cuenta</button>}
					{onLogin && <button className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" type="button" onClick={onLogin}>Ya tengo una cuenta</button>}
				</div>
			</section>
			<footer className="flex flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-600 sm:flex-row">
				<span>Antilow · Soporte & equipos</span><span>Soluciones tecnológicas para el Oriente Antioqueño.</span>
			</footer>
		</section>
	)
}

export default Inicio
