import { useEffect, useState } from 'react'
import { crearSolicitud, listarMisSolicitudes } from '../assets/Servicios/solicitudesService.js'
import { getApiErrorMessage } from '../api/api.js'
import AvisoAcceso from './AvisoAcceso.jsx'

/** Valores iniciales del formulario de tickets del cliente. */
const initialForm = {
	tipo: '',
	asunto: '',
	descripcion: '',
	prioridad: 'normal',
	nombre_cliente: '',
	telefono_cliente: '',
}

/** Catálogo de servicios y recursos visuales seleccionables en soporte. */
const supportServices = [
	{ value: 'soporte remoto', label: 'Soporte remoto', description: 'Ayuda para resolver incidencias sin desplazamiento.', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=80' },
	{ value: 'diagnóstico de equipo', label: 'Diagnóstico de equipo', description: 'Revisión de fallas de hardware, software o rendimiento.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80' },
	{ value: 'mantenimiento preventivo', label: 'Mantenimiento preventivo', description: 'Limpieza, optimización y revisión general del equipo.', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=700&q=80' },
	{ value: 'mantenimiento correctivo y reparación de piezas', label: 'Mantenimiento correctivo', description: 'Reparación o reemplazo de piezas para recuperar el funcionamiento del equipo.', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80' },
	{ value: 'instalación y configuración', label: 'Instalación y configuración', description: 'Instalación de programas, periféricos o dispositivos.', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=700&q=80' },
	{ value: 'seguridad y respaldo', label: 'Seguridad y respaldo', description: 'Protección de información, copias y recuperación de datos.', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=700&q=80' },
]

const statusLabels = {
	pendiente: 'Pendiente',
	en_proceso: 'En proceso',
	resuelta: 'Resuelta',
	resuelto: 'Resuelta',
	cancelada: 'Cancelada',
}

/** Módulo de creación y seguimiento de solicitudes del cliente autenticado. */
const maintenanceStages = [
	{ status: 'pendiente', label: 'Recibido' },
	{ status: 'en_proceso', label: 'En mantenimiento' },
	{ status: 'resuelta', label: 'Finalizado' },
]

const priorityStyles = {
	urgente: 'bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-400/30',
	alta: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30',
	normal: 'bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-300/25',
	baja: 'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-300/25',
}

const serviceVisuals = {
	'soporte remoto': { icon: 'M8 12h8m-8 4h5m-6 5h10a2 2 0 0 0 2-2v-1a3 3 0 0 0-3-3h-1v-2a4 4 0 1 0-8 0v2H6a3 3 0 0 0-3 3v1a2 2 0 0 0 2 2h1Z', color: 'border-cyan-400/20', iconColor: 'bg-cyan-400/10 text-cyan-300', glow: 'bg-cyan-400/10' },
	'diagnóstico de equipo': { icon: 'm9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', color: 'border-violet-400/20', iconColor: 'bg-violet-400/10 text-violet-300', glow: 'bg-violet-400/10' },
	'mantenimiento preventivo': { icon: 'm14.7 6.3 3 3M4 20l4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Zm10-13 3 3', color: 'border-emerald-400/20', iconColor: 'bg-emerald-400/10 text-emerald-300', glow: 'bg-emerald-400/10' },
	'mantenimiento correctivo y reparación de piezas': { icon: 'm14.7 6.3 3 3M4 20l4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Zm10-13 3 3', color: 'border-orange-400/20', iconColor: 'bg-orange-400/10 text-orange-300', glow: 'bg-orange-400/10' },
	'instalación y configuración': { icon: 'M12 8v8m-4-4h8m-4-9a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', color: 'border-blue-400/20', iconColor: 'bg-blue-400/10 text-blue-300', glow: 'bg-blue-400/10' },
	'seguridad y respaldo': { icon: 'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-3-11 2 2 4-4', color: 'border-rose-400/20', iconColor: 'bg-rose-400/10 text-rose-300', glow: 'bg-rose-400/10' },
}

const fallbackServiceVisual = {
	icon: 'M14.7 6.3 17.7 9.3M4 20l4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z',
	color: 'border-white/10',
	iconColor: 'bg-slate-400/10 text-slate-300',
	glow: 'bg-slate-400/10',
}

const getRequestStatus = (status) => status === 'resuelto' ? 'resuelta' : status

function Soportetecnico({ authenticated, onLogin, onHome }) {
	const [form, setForm] = useState(initialForm)
	const [requests, setRequests] = useState([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [feedback, setFeedback] = useState({ type: '', message: '' })
	const [showSuccessNotice, setShowSuccessNotice] = useState(false)
	const [accessReason, setAccessReason] = useState(null)
	const [expandedRequestId, setExpandedRequestId] = useState(null)
	const [requestFilter, setRequestFilter] = useState('todos')

	const captureAccessError = (error) => {
		if (error.response?.status === 401) setAccessReason('login')
		if (error.response?.status === 403) setAccessReason('admin')
	}

	useEffect(() => {
		if (!showSuccessNotice) return undefined

		const timeoutId = window.setTimeout(() => setShowSuccessNotice(false), 8000)
		return () => window.clearTimeout(timeoutId)
	}, [showSuccessNotice])

	const requestSummary = [
		{ label: 'Pendientes', status: 'pendiente', icon: '◷', color: 'border-amber-300/20 bg-amber-300/[.06] text-amber-200', glow: 'bg-amber-300/10' },
		{ label: 'En mantenimiento', status: 'en_proceso', icon: '⚙', color: 'border-cyan-300/20 bg-cyan-300/[.06] text-cyan-200', glow: 'bg-cyan-300/10' },
		{ label: 'Finalizados', status: 'resuelta', icon: '✓', color: 'border-emerald-300/20 bg-emerald-300/[.06] text-emerald-200', glow: 'bg-emerald-300/10' },
	].map((item) => ({
		...item,
		count: requests.filter((request) => getRequestStatus(request.estado) === item.status).length,
	}))
	const activeRequestCount = requestSummary
		.filter((item) => item.status === 'pendiente' || item.status === 'en_proceso')
		.reduce((total, item) => total + item.count, 0)
	const requestFilters = [
		{ id: 'todos', label: 'Todos', count: requests.length },
		{ id: 'activos', label: 'Activos', count: activeRequestCount },
		{ id: 'finalizados', label: 'Finalizados', count: requestSummary.find((item) => item.status === 'resuelta').count },
	]
	const filteredRequests = requests.filter((request) => {
		const status = getRequestStatus(request.estado)
		if (requestFilter === 'activos') return status === 'pendiente' || status === 'en_proceso'
		if (requestFilter === 'finalizados') return status === 'resuelta'
		return true
	})

	/** Recarga la lista personal luego de crear una solicitud. */
	const loadRequests = async () => {
		try {
			const loadedRequests = await listarMisSolicitudes()
			setRequests(loadedRequests)
		} catch (error) {
			captureAccessError(error)
			setFeedback({ type: 'error', message: getApiErrorMessage(error, 'No se pudieron cargar tus solicitudes.') })
		} finally {
			setLoading(false)
		}
	}

	// Recupera el historial del cliente al entrar y evita actualizaciones tras desmontar.
	useEffect(() => {
		let cancelled = false

		listarMisSolicitudes()
			.then((loadedRequests) => {
				if (!cancelled) setRequests(loadedRequests)
			})
			.catch((error) => {
				if (!cancelled) {
					captureAccessError(error)
					setFeedback({ type: 'error', message: getApiErrorMessage(error, 'No se pudieron cargar tus solicitudes.') })
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => { cancelled = true }
	}, [])

	/** Valida y envía el requerimiento elegido a la mesa de soporte. */
	const handleSubmit = async (event) => {
		event.preventDefault()
		setSaving(true)
		setFeedback({ type: '', message: '' })

		try {
			await crearSolicitud(form)
			setForm(initialForm)
			setFeedback({ type: '', message: '' })
			setShowSuccessNotice(true)
			await loadRequests()
		} catch (error) {
			captureAccessError(error)
			const validationErrors = error.response?.data?.errors
			const firstError = validationErrors && Object.values(validationErrors)[0]?.[0]
			setFeedback({ type: 'error', message: firstError || getApiErrorMessage(error, 'No se pudo enviar el requerimiento.') })
		} finally {
			setSaving(false)
		}
	}

	if (accessReason || !authenticated) {
		return <AvisoAcceso reason={accessReason || 'login'} onLogin={onLogin} onHome={onHome} />
	}

	return (
		<section className="space-y-6" aria-labelledby="support-title">
			{showSuccessNotice && (
				<div className="support-notice-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
					<div className="support-success-notice relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#0d151b] p-7 text-center shadow-[0_24px_100px_rgba(0,0,0,.65)] sm:p-9" role="status" aria-live="polite" aria-atomic="true">
						<div className="support-notice-glow pointer-events-none absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden="true" />
						<div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,.15)]">
							<svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path className="support-success-check" d="m6 12.5 4 4L18.5 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<p className="relative mt-5 text-[11px] font-bold uppercase tracking-[.22em] text-emerald-300">Solicitud recibida</p>
						<h2 className="relative mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white sm:text-3xl">¡Ya está hecho!</h2>
						<p className="relative mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
							Tu reporte quedó registrado y nuestros técnicos se encargarán de revisarlo. Ya puedes estar tranquilo; te mantendremos al tanto de cada avance.
						</p>
						<button
							className="relative mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d151b]"
							type="button"
							onClick={() => setShowSuccessNotice(false)}
						>
							Entendido
						</button>
						<div className="support-notice-progress absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-300" aria-hidden="true" />
					</div>
				</div>
			)}
			<div className="max-w-3xl">
				<p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-red-400">Mesa de ayuda / 02</p>
				<h1 id="support-title" className="text-4xl font-black tracking-tight text-white sm:text-5xl">Soporte técnico <span className="text-red-400">sin vueltas.</span></h1>
				<p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Selecciona el servicio que necesitas y describe tu caso. Tu requerimiento llegará directamente a la mesa de soporte.</p>
			</div>

			{feedback.message && <p className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-red-400/25 bg-red-400/10 text-red-200'}`} role="alert">{feedback.message}</p>}

			<div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
				<form id="support-form" className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 sm:p-6" onSubmit={handleSubmit}>
					<div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Nuevo requerimiento</p><h2 className="mt-1 text-xl font-bold text-white">¿En qué podemos ayudarte?</h2></div>
					<div className="space-y-4">
						<fieldset>
							<legend className="mb-2 block text-sm font-semibold text-slate-300">Servicio requerido</legend>
							<div className="grid gap-3 sm:grid-cols-2">
								{supportServices.map((service) => {
									const isSelected = form.tipo === service.value

									return <button className={`group overflow-hidden rounded-xl border text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${isSelected ? 'border-cyan-400 bg-cyan-400/10 ring-1 ring-cyan-400/50' : 'border-white/10 bg-slate-950/60 hover:border-white/30 hover:bg-white/[.04]'}`} key={service.value} type="button" aria-pressed={isSelected} onClick={() => setForm({ ...form, tipo: service.value })}>
										<img className="h-24 w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100" src={service.image} alt="" loading="lazy" />
										<span className="block p-3"><span className="flex items-center justify-between gap-2 text-sm font-bold text-white"><span>{service.label}</span>{isSelected && <span className="text-xs text-cyan-300">Seleccionado</span>}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{service.description}</span></span>
									</button>
								})}
							</div>
						</fieldset>
						{form.tipo && <p className="-mt-2 text-xs leading-5 text-slate-500">{supportServices.find((service) => service.value === form.tipo)?.description}</p>}
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Tu nombre</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" type="text" maxLength="255" autoComplete="name" placeholder="Nombre y apellido" value={form.nombre_cliente} onChange={(event) => setForm({ ...form, nombre_cliente: event.target.value })} required /></label>
							<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Teléfono de contacto</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" type="tel" maxLength="30" autoComplete="tel" placeholder="Tu número de contacto" value={form.telefono_cliente} onChange={(event) => setForm({ ...form, telefono_cliente: event.target.value })} required /></label>
						</div>
						<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Asunto</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" type="text" maxLength="150" placeholder="Ej. Mi equipo no enciende" value={form.asunto} onChange={(event) => setForm({ ...form, asunto: event.target.value })} required /></label>
						<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Descripción del problema</span><textarea className="min-h-32 w-full resize-y rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" placeholder="Cuéntanos qué sucede, desde cuándo y qué has intentado..." value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} required /></label>
						<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Prioridad</span><select className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400" value={form.prioridad} onChange={(event) => setForm({ ...form, prioridad: event.target.value })}><option value="baja">Baja · Puede esperar</option><option value="normal">Normal · Atención habitual</option><option value="alta">Alta · Afecta mi operación</option><option value="urgente">Urgente · Operación detenida</option></select></label>
					</div>
					<button className="mt-5 w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>{saving ? 'Enviando requerimiento...' : 'Enviar a mesa de soporte'}</button>
				</form>

				<div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 sm:p-6">
					<div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Seguimiento</p><h2 className="mt-1 text-xl font-bold text-white">Mis requerimientos</h2></div><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{requests.length} total</span></div>
					{!loading && <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Resumen de requerimientos">
						{requestSummary.map((item, index) => <div className={`support-summary-card relative overflow-hidden rounded-xl border p-3 sm:p-4 ${item.color}`} key={item.status} style={{ animationDelay: `${index * 90}ms` }}>
							<span className={`pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full blur-2xl ${item.glow}`} aria-hidden="true" />
							<div className="relative flex items-center justify-between gap-1">
								<span className="text-[9px] font-bold uppercase leading-3 tracking-wider opacity-80 sm:text-[10px]">{item.label}</span>
								<span className="text-sm opacity-80 sm:text-base" aria-hidden="true">{item.icon}</span>
							</div>
							<p className="relative mt-2 font-['Space_Grotesk'] text-2xl font-bold leading-none text-white sm:text-3xl" aria-label={`${item.count} ${item.label.toLowerCase()}`}>{item.count}</p>
						</div>)}
					</div>}
					{!loading && requests.length > 0 && <div className="mt-5 flex gap-2 overflow-x-auto rounded-xl border border-white/5 bg-slate-950/50 p-1.5" role="group" aria-label="Filtrar requerimientos">
						{requestFilters.map((filter) => {
							const isSelected = requestFilter === filter.id
							return <button className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${isSelected ? 'bg-cyan-400/15 text-cyan-200 shadow-sm shadow-cyan-950/30' : 'text-slate-500 hover:bg-white/[.04] hover:text-slate-300'}`} key={filter.id} type="button" aria-pressed={isSelected} onClick={() => setRequestFilter(filter.id)}>
								{filter.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isSelected ? 'bg-cyan-300/15 text-cyan-100' : 'bg-white/5 text-slate-500'}`}>{filter.count}</span>
							</button>
						})}
					</div>}
					<div className="mt-5 space-y-3">
						{loading && <p className="py-8 text-center text-sm text-slate-500">Cargando tus requerimientos...</p>}
						{!loading && requests.length === 0 && <div className="support-empty-state rounded-xl border border-dashed border-white/10 bg-slate-950/30 px-5 py-8 text-center">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.06] text-cyan-300">
								<svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 8.5A2.5 2.5 0 0 1 9.5 6h13A2.5 2.5 0 0 1 25 8.5v10a2.5 2.5 0 0 1-2.5 2.5H16l-5 4v-4h-1.5A2.5 2.5 0 0 1 7 18.5v-10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 12h8m-8 4h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
							</div>
							<h3 className="mt-4 text-sm font-bold text-white">Tu mesa de ayuda está lista</h3>
							<p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-500">Cuando necesites asistencia, crea un requerimiento y podrás seguir cada avance desde aquí.</p>
							<a className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-200 ring-1 ring-inset ring-cyan-300/20 transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" href="#support-form">
								Crear mi primer requerimiento<svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 4v12m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
							</a>
						</div>}
						{!loading && requests.length > 0 && filteredRequests.length === 0 && <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm leading-6 text-slate-500">No hay requerimientos en esta categoría.</p>}
						{!loading && filteredRequests.map((request, index) => {
							const status = getRequestStatus(request.estado)
							const currentStage = maintenanceStages.findIndex((stage) => stage.status === status)
							const isCancelled = status === 'cancelada'
							const serviceVisual = serviceVisuals[request.tipo?.toLowerCase()] || fallbackServiceVisual
							const isExpanded = expandedRequestId === request.id
							const hasAdminNote = Boolean(request.notas_admin?.trim())
							const requestValue = request.valor === null || request.valor === undefined || request.valor === '' ? null : Number(request.valor)

							return <article className={`support-request-card relative overflow-hidden rounded-xl border bg-slate-950/50 p-4 ${serviceVisual.color}`} key={request.id} style={{ animationDelay: `${index * 70}ms` }}>
								<span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${serviceVisual.glow}`} aria-hidden="true" />
								<div className="relative flex items-start justify-between gap-3">
									<div className="flex min-w-0 items-center gap-3">
										<span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${serviceVisual.iconColor}`} aria-hidden="true">
											<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={serviceVisual.icon} /></svg>
										</span>
										<div className="min-w-0"><p className="truncate text-sm font-bold text-white">{request.asunto}</p><p className="mt-1 truncate text-xs capitalize text-slate-400">{request.tipo}</p></div>
									</div>
									<span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${isCancelled ? 'bg-red-400/10 text-red-300' : status === 'resuelta' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-cyan-400/10 text-cyan-300'}`}>{statusLabels[status] || request.estado}</span>
								</div>
								<p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{request.descripcion}</p>
								{status === 'resuelta' && <div className="support-completed-banner mt-4 flex items-center gap-3 rounded-lg border border-emerald-300/15 bg-gradient-to-r from-emerald-400/[.09] to-transparent px-3 py-2.5">
									<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-300" aria-hidden="true"><svg className="h-4 w-4" viewBox="0 0 20 20" fill="none"><path d="m5 10 3.2 3.2L15 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
									<div><p className="text-xs font-bold text-emerald-200">Servicio completado</p>{request.updated_at && <p className="mt-0.5 text-[10px] text-emerald-200/50">Última actualización: {new Date(request.updated_at).toLocaleDateString('es-CO')}</p>}</div>
								</div>}
								<button className="mt-3 inline-flex items-center gap-2 rounded-md text-xs font-bold text-cyan-300 transition-colors hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" type="button" aria-expanded={isExpanded} aria-controls={`request-details-${request.id}`} onClick={() => setExpandedRequestId(isExpanded ? null : request.id)}>
									{isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
									<svg className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
								</button>
								<div className={`support-request-details-grid ${isExpanded ? 'is-open' : ''}`} id={`request-details-${request.id}`} aria-hidden={!isExpanded}>
									<div className="min-h-0 overflow-hidden">
										<div className="mt-3 space-y-3 rounded-lg border border-white/5 bg-slate-900/70 p-3">
											<div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Descripción completa</p><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-300">{request.descripcion}</p></div>
											{hasAdminNote && <div className="border-t border-white/5 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">Nota del técnico</p><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-300">{request.notas_admin}</p></div>}
											{Number.isFinite(requestValue) && <div className="border-t border-white/5 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Costo registrado</p><p className="mt-1 text-sm font-bold text-emerald-300">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(requestValue)}</p></div>}
										</div>
									</div>
								</div>
								<div className="mt-5 rounded-lg border border-white/5 bg-white/[.02] p-3">
									<div className="mb-4 flex items-center justify-between gap-2">
										<p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Progreso del mantenimiento</p>
										{request.updated_at && <time className="text-[10px] text-slate-600" dateTime={request.updated_at}>Actualizado {new Date(request.updated_at).toLocaleDateString('es-CO')}</time>}
									</div>
									{isCancelled ? <p className="rounded-md bg-red-400/10 px-3 py-2 text-xs font-medium text-red-200">Este requerimiento fue cancelado.</p> : <ol className="grid grid-cols-3" aria-label={`Progreso: ${statusLabels[status] || request.estado}`}>
										{maintenanceStages.map((stage, index) => {
											const isComplete = currentStage >= 0 && index < currentStage
											const isCurrent = index === currentStage
											const isReached = isComplete || isCurrent

											return <li className="relative flex flex-col items-center text-center" key={stage.status} aria-current={isCurrent ? 'step' : undefined}>
												{index > 0 && <span className={`absolute left-0 right-1/2 top-2.5 h-0.5 ${currentStage >= index ? 'bg-cyan-400' : 'bg-white/10'}`} aria-hidden="true" />}
												{index < maintenanceStages.length - 1 && <span className={`absolute left-1/2 right-0 top-2.5 h-0.5 ${currentStage > index ? 'bg-cyan-400' : 'bg-white/10'}`} aria-hidden="true" />}
												<span className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${isReached ? 'border-cyan-300 bg-cyan-400 text-slate-950' : 'border-white/20 bg-slate-900 text-slate-500'}`} aria-hidden="true">{isComplete ? '✓' : index + 1}</span>
												<span className={`mt-2 text-[10px] leading-4 sm:text-xs ${isCurrent ? 'font-bold text-cyan-200' : isComplete ? 'text-slate-300' : 'text-slate-600'}`}>{stage.label}</span>
											</li>
										})}
									</ol>}
								</div>
								<div className="mt-3 flex justify-between border-t border-white/5 pt-3 text-[11px] text-slate-600"><span className="flex items-center gap-2">Prioridad: <strong className={`rounded-full px-2 py-0.5 font-bold capitalize ${priorityStyles[request.prioridad] || 'bg-slate-400/10 text-slate-300'}`}>{request.prioridad}</strong></span><time dateTime={request.created_at}>Recibido {new Date(request.created_at).toLocaleDateString('es-CO')}</time></div>
							</article>
						})}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Soportetecnico
