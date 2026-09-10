const navigationItems = [
	{ id: 'home', label: 'Página principal', mark: '01' },
	{ id: 'support', label: 'Soporte técnico', mark: '02' },
	{ id: 'inventory', label: 'Inventario', mark: '03' },
	{ id: 'reports', label: 'Reportes', mark: '04' },
]

function Navegacion({ activeSection, onSectionChange, isAdmin = false }) {
	const items = isAdmin ? [...navigationItems, { id: 'users', label: 'Usuarios', mark: '05' }] : navigationItems
	return (
		<aside className="border-b border-white/10 px-5 py-5 lg:w-64 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
			<p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Workspace</p>
			<nav aria-label="Navegación principal" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
				{items.map((item) => {
					const isActive = activeSection === item.id

					return (
						<button
							aria-current={isActive ? 'page' : undefined}
							className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${isActive ? 'bg-red-500/15 font-bold text-red-300 ring-1 ring-red-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
							key={item.id}
							type="button"
							onClick={() => onSectionChange(item.id)}
						>
							<span className={`text-xs font-black ${isActive ? 'text-red-300' : 'text-slate-600 group-hover:text-slate-400'}`}>{item.mark}</span>
							{item.label}
						</button>
					)
				})}
			</nav>
			<div className="mt-8 hidden rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 lg:block">
				<p className="text-xs font-bold text-cyan-300">Centro de ayuda</p>
				<p className="mt-2 text-xs leading-5 text-slate-400">Gestiona incidencias y mantén tus equipos en marcha.</p>
			</div>
		</aside>
	)
}

export default Navegacion
