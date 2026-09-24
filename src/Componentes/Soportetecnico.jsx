import { useEffect, useState } from 'react'
import { crearSolicitud, listarMisSolicitudes } from '../assets/Servicios/solicitudesService.js'

const initialForm = {
	tipo: '',
	asunto: '',
	descripcion: '',
	prioridad: 'normal',
}

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
	cancelada: 'Cancelada',
}

function Soportetecnico() {
	const [form, setForm] = useState(initialForm)
	const [requests, setRequests] = useState([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [feedback, setFeedback] = useState({ type: '', message: '' })

	const loadRequests = async () => {
		try {
			const loadedRequests = await listarMisSolicitudes()
			setRequests(loadedRequests)
		} catch (error) {
			setFeedback({ type: 'error', message: error.response?.data?.message || 'No se pudieron cargar tus solicitudes.' })
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let cancelled = false

		listarMisSolicitudes()
			.then((loadedRequests) => {
				if (!cancelled) setRequests(loadedRequests)
			})
			.catch((error) => {
				if (!cancelled) setFeedback({ type: 'error', message: error.response?.data?.message || 'No se pudieron cargar tus solicitudes.' })
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => { cancelled = true }
	}, [])

	const handleSubmit = async (event) => {
		event.preventDefault()
		setSaving(true)
		setFeedback({ type: '', message: '' })

		try {
			await crearSolicitud(form)
			setForm(initialForm)
			setFeedback({ type: 'success', message: 'Requerimiento enviado. La mesa de soporte ya puede atenderlo.' })
			await loadRequests()
		} catch (error) {
			const validationErrors = error.response?.data?.errors
			const firstError = validationErrors && Object.values(validationErrors)[0]?.[0]
			setFeedback({ type: 'error', message: firstError || error.response?.data?.message || 'No se pudo enviar el requerimiento.' })
		} finally {
			setSaving(false)
		}
	}

	return (
		<section className="space-y-6" aria-labelledby="support-title">
			<div className="max-w-3xl">
				<p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-red-400">Mesa de ayuda / 02</p>
				<h1 id="support-title" className="text-4xl font-black tracking-tight text-white sm:text-5xl">Soporte técnico <span className="text-red-400">sin vueltas.</span></h1>
				<p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Selecciona el servicio que necesitas y describe tu caso. Tu requerimiento llegará directamente a la mesa de soporte.</p>
			</div>

			{feedback.message && <p className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-red-400/25 bg-red-400/10 text-red-200'}`} role="alert">{feedback.message}</p>}

			<div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
				<form className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 sm:p-6" onSubmit={handleSubmit}>
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
						<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Asunto</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" type="text" maxLength="150" placeholder="Ej. Mi equipo no enciende" value={form.asunto} onChange={(event) => setForm({ ...form, asunto: event.target.value })} required /></label>
						<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Descripción del problema</span><textarea className="min-h-32 w-full resize-y rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" placeholder="Cuéntanos qué sucede, desde cuándo y qué has intentado..." value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} required /></label>
						<label className="block"><span className="mb-2 block text-sm font-semibold text-slate-300">Prioridad</span><select className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none focus:border-cyan-400" value={form.prioridad} onChange={(event) => setForm({ ...form, prioridad: event.target.value })}><option value="baja">Baja · Puede esperar</option><option value="normal">Normal · Atención habitual</option><option value="alta">Alta · Afecta mi operación</option><option value="urgente">Urgente · Operación detenida</option></select></label>
					</div>
					<button className="mt-5 w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>{saving ? 'Enviando requerimiento...' : 'Enviar a mesa de soporte'}</button>
				</form>

				<div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 sm:p-6">
					<div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Seguimiento</p><h2 className="mt-1 text-xl font-bold text-white">Mis requerimientos</h2></div><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">{requests.length} total</span></div>
					<div className="mt-5 space-y-3">
						{loading && <p className="py-8 text-center text-sm text-slate-500">Cargando tus requerimientos...</p>}
						{!loading && requests.length === 0 && <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm leading-6 text-slate-500">Aún no tienes requerimientos. Elige un servicio para comenzar.</p>}
						{!loading && requests.map((request) => <article className="rounded-xl border border-white/10 bg-slate-950/50 p-4" key={request.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-white">{request.asunto}</p><p className="mt-1 text-xs capitalize text-slate-500">{request.tipo}</p></div><span className="shrink-0 rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300">{statusLabels[request.estado] || request.estado}</span></div><p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{request.descripcion}</p><div className="mt-3 flex justify-between border-t border-white/5 pt-3 text-[11px] text-slate-600"><span>Prioridad: <strong className="font-semibold text-slate-400">{request.prioridad}</strong></span><time>{new Date(request.created_at).toLocaleDateString('es-CO')}</time></div></article>)}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Soportetecnico
