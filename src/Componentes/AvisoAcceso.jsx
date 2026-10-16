import BrandLogo from './BrandLogo.jsx'

function AvisoAcceso({ reason, onLogin, onHome }) {
	const needsLogin = reason === 'login'
	const needsAdminLogin = reason === 'admin-login'
	const requiresAdmin = reason === 'admin' || needsAdminLogin

	return (
		<section className="access-notice relative mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center" aria-labelledby="access-notice-title">
			<div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[.07] blur-3xl" aria-hidden="true" />
			<div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" aria-hidden="true" />
				<div className="access-notice-orbit relative mx-auto grid h-20 w-20 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[.08] shadow-[0_0_40px_rgba(34,211,238,.1)]">
					<span className="absolute inset-[-7px] rounded-[1.25rem] border border-cyan-300/20" aria-hidden="true" />
					{needsLogin ? (
						<svg className="h-9 w-9 text-cyan-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M7 10V7a5 5 0 0 1 10 0v3m-11 0h12a2 2 0 0 1 2 2v8H4v-8a2 2 0 0 1 2-2Zm6 4v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					) : (
						<BrandLogo className="h-12 w-12" />
					)}
				</div>
				<p className="mt-6 text-[11px] font-bold uppercase tracking-[.24em] text-cyan-300">
					{needsLogin || needsAdminLogin ? 'Acceso requerido' : 'Área protegida'}
				</p>
				<h1 id="access-notice-title" className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white sm:text-3xl">
					{needsLogin || needsAdminLogin ? 'Inicia sesión para continuar' : 'Contenido exclusivo para administradores'}
				</h1>
				<p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
					{needsLogin
						? 'Inicia sesión para enviar tu solicitud de soporte y consultar su seguimiento. Tu información estará protegida y podrás ver aquí cada avance.'
						: requiresAdmin
							? 'Para consultar los reportes técnicos, inicia sesión con una cuenta de administrador. Así protegemos la información de clientes y servicios.'
							: 'Esta sección contiene información interna de clientes y servicios. Para consultarla necesitas una cuenta administradora.'}
				</p>
				<div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
					{needsLogin && onLogin && (
						<button className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" type="button" onClick={onLogin}>
							Iniciar sesión
						</button>
					)}
					<button className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/[.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" type="button" onClick={onHome}>
						Volver al inicio
					</button>
				</div>
				<p className="mt-7 text-[11px] text-slate-600">Antilow · Soporte & equipos</p>
			</div>
		</section>
	)
}

export default AvisoAcceso
