import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api/api.js'
import {
    crearUsuario,
    editarSolicitudAdmin,
    editarUsuario,
    eliminarSolicitudAdmin,
    eliminarUsuario,
    listarSolicitudesAdmin,
    listarUsuarios,
} from '../assets/Servicios/usuariosService.js'

const emptyUser = { name: '', email: '', password: '', role: 'client' }

const getRequestClientKey = (request) => {
    const phone = (request.telefono_cliente || '').replace(/\D/g, '')
    if (phone) return `phone:${phone}`
    return `user:${request.user_id || request.user?.id || request.id}`
}

/** Consolida la administración de cuentas, clientes y solicitudes de servicio. */
function AdministracionPanel() {
    const [users, setUsers] = useState([])
    const [requests, setRequests] = useState([])
    const [userForm, setUserForm] = useState(emptyUser)
    const [requestForm, setRequestForm] = useState({ estado: 'pendiente', prioridad: 'normal', valor: '', notas_admin: '' })
    const [editingUser, setEditingUser] = useState(null)
    const [editingRequest, setEditingRequest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const clients = [...new Map(requests.map((request) => [getRequestClientKey(request), request])).values()]

    /** Recarga en paralelo todos los conjuntos usados por los indicadores y tablas. */
    const loadAll = async () => {
        try {
            setError('')
            setLoading(true)
            const [loadedUsers, loadedRequests] = await Promise.all([listarUsuarios(), listarSolicitudesAdmin()])
            setUsers(loadedUsers)
            setRequests(loadedRequests)
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'No se pudieron cargar los datos administrativos.'))
        } finally {
            setLoading(false)
        }
    }

    // Evita actualizar estado si el administrador abandona el panel durante la consulta.
    useEffect(() => {
        let cancelled = false
        const loadInitialData = async () => {
            try {
                const [loadedUsers, loadedRequests] = await Promise.all([listarUsuarios(), listarSolicitudesAdmin()])
                if (!cancelled) {
                    setUsers(loadedUsers)
                    setRequests(loadedRequests)
                }
            } catch (requestError) {
                if (!cancelled) setError(getApiErrorMessage(requestError, 'No se pudieron cargar los datos administrativos.'))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        loadInitialData()
        return () => { cancelled = true }
    }, [])

    /** Ejecuta altas/ediciones compartiendo feedback, bloqueo y recarga posterior. */
    const save = async (event, action, reset) => {
        event.preventDefault()
        setSaving(true)
        setError('')
        try {
            await action()
            reset()
            await loadAll()
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors
            const firstError = validationErrors && Object.values(validationErrors)[0]?.[0]
            setError(firstError || getApiErrorMessage(requestError, 'No se pudo guardar el cambio.'))
        } finally {
            setSaving(false)
        }
    }

    /** Confirma una eliminación y refresca las tablas si la API la acepta. */
    const remove = async (message, action) => {
        if (!window.confirm(message)) return
        try { await action(); await loadAll() } catch (requestError) { setError(getApiErrorMessage(requestError, 'No se pudo eliminar el registro.')) }
    }

    const userSubmit = (event) => save(event, async () => {
        const payload = { ...userForm }
        if (editingUser && !payload.password) delete payload.password
        await (editingUser ? editarUsuario(editingUser, payload) : crearUsuario(payload))
    }, () => { setEditingUser(null); setUserForm(emptyUser) })

    const requestSubmit = (event) => save(event, () => editarSolicitudAdmin(editingRequest, requestForm), () => setEditingRequest(null))

    const scrollToRequest = (requestId) => {
        const row = document.getElementById(`admin-request-${requestId}`)
        if (!row) return
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        row.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })
    }

    return (
        <section className="space-y-6" aria-labelledby="admin-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">Centro de operaciones / administrador</p><h1 id="admin-title" className="text-3xl font-black text-white sm:text-4xl">Gestión de Antilow</h1><p className="mt-2 text-sm text-slate-400">Usuarios, clientes y requerimientos en un solo espacio de control.</p></div><button className="w-fit rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-white/5" type="button" onClick={loadAll}>Actualizar datos</button></div>
            {error && <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-3"><article className="metric-card border-cyan-400/20 bg-cyan-400/10"><p>Clientes</p><strong>{clients.length}</strong><span className="text-cyan-300">Desde soporte técnico</span><div className="metric-line bg-cyan-400" /></article><article className="metric-card border-red-400/20 bg-red-400/10"><p>Requerimientos</p><strong>{requests.length}</strong><span className="text-red-300">Solicitudes recibidas</span><div className="metric-line bg-red-400" /></article><article className="metric-card border-amber-400/20 bg-amber-400/10"><p>Usuarios</p><strong>{users.length}</strong><span className="text-amber-300">Cuentas registradas</span><div className="metric-line bg-amber-400" /></article></div>

            <AdminTable title="Usuarios registrados" eyebrow="Administración de cuentas" headers={['Usuario', 'Correo', 'Rol', 'Acciones']} loading={loading} empty="No hay usuarios registrados.">{users.map((user) => <tr className="transition hover:bg-white/[.025]" key={user.id}><td className="px-5 py-4 font-semibold text-slate-200">{user.name}</td><td className="px-5 py-4 text-slate-400">{user.email}</td><td className="px-5 py-4"><span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-300">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</span></td><td className="px-5 py-4 text-right"><button className="mr-3 text-xs font-bold text-cyan-300" type="button" onClick={() => { setEditingUser(user.id); setUserForm({ name: user.name, email: user.email, password: '', role: user.role }) }}>Editar</button><button className="text-xs font-bold text-red-300" type="button" onClick={() => remove(`¿Eliminar la cuenta de ${user.name}?`, () => eliminarUsuario(user.id))}>Eliminar</button></td></tr>)}</AdminTable>
            {editingUser && <EditorForm title="Editar usuario" onSubmit={userSubmit} onCancel={() => setEditingUser(null)} saving={saving}><EditorInput name="name" label="Nombre" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required /><EditorInput name="email" label="Correo" type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required /><EditorInput name="password" label="Nueva contraseña" type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} /><EditorSelect name="role" label="Rol" value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })} options={['client', 'admin']} /></EditorForm>}

            <AdminTable title="Directorio de clientes" eyebrow="Información enviada desde soporte" headers={['Cliente', 'Teléfono', 'Último requerimiento', 'Acciones']} loading={loading} empty="Los clientes aparecerán aquí al enviar un requerimiento de soporte.">{clients.map((request) => {
                const clientName = request.nombre_cliente || request.user?.name || 'Cliente sin nombre'
                return <tr className="transition hover:bg-white/[.025]" key={getRequestClientKey(request)}>
                    <td className="px-5 py-4 font-semibold text-slate-200">{clientName}</td>
                    <td className="px-5 py-4 text-slate-400">{request.telefono_cliente ? <a className="text-cyan-300 hover:text-cyan-200" href={`tel:${request.telefono_cliente}`}>{request.telefono_cliente}</a> : 'Sin teléfono registrado'}</td>
                    <td className="px-5 py-4 text-slate-400">{request.asunto}</td>
                    <td className="px-5 py-4 text-right"><button className="text-xs font-bold text-cyan-300 hover:text-cyan-200" type="button" onClick={() => scrollToRequest(request.id)}>Ver requerimiento</button></td>
                </tr>
            })}</AdminTable>

            <AdminTable title="Requerimientos de clientes" eyebrow="Mesa de soporte" headers={['Cliente', 'Teléfono', 'Asunto y descripción', 'Servicio', 'Estado', 'Prioridad', 'Acciones']} loading={loading} empty="No hay requerimientos registrados.">{requests.map((request) => <tr id={`admin-request-${request.id}`} className="transition hover:bg-white/[.025]" key={request.id}><td className="px-5 py-4 font-semibold text-slate-200">{request.nombre_cliente || request.user?.name || 'Cliente'}</td><td className="px-5 py-4 text-slate-400">{request.telefono_cliente ? <a className="text-cyan-300 hover:text-cyan-200" href={`tel:${request.telefono_cliente}`}>{request.telefono_cliente}</a> : 'Sin teléfono'}</td><td className="px-5 py-4 text-slate-300">{request.asunto}<span className="mt-1 block max-w-[260px] whitespace-normal text-xs text-slate-500">{request.descripcion}</span></td><td className="px-5 py-4 text-slate-400">{request.tipo}</td><td className="px-5 py-4"><span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-300">{request.estado}</span></td><td className="px-5 py-4 text-slate-400">{request.prioridad}</td><td className="px-5 py-4 text-right"><button className="mr-3 text-xs font-bold text-cyan-300" type="button" onClick={() => { setEditingRequest(request.id); setRequestForm({ estado: request.estado || 'pendiente', prioridad: request.prioridad || 'normal', valor: request.valor || '', notas_admin: request.notas_admin || '' }) }}>Editar</button><button className="text-xs font-bold text-red-300" type="button" onClick={() => remove(`¿Eliminar el requerimiento "${request.asunto}"?`, () => eliminarSolicitudAdmin(request.id))}>Eliminar</button></td></tr>)}</AdminTable>
            {editingRequest && <EditorForm title="Editar requerimiento" onSubmit={requestSubmit} onCancel={() => setEditingRequest(null)} saving={saving}><EditorSelect name="estado" label="Estado" value={requestForm.estado} onChange={(event) => setRequestForm({ ...requestForm, estado: event.target.value })} options={['pendiente', 'en_proceso', 'resuelta', 'cancelada']} /><EditorSelect name="prioridad" label="Prioridad" value={requestForm.prioridad} onChange={(event) => setRequestForm({ ...requestForm, prioridad: event.target.value })} options={['baja', 'normal', 'alta', 'urgente']} /><EditorInput name="valor" label="Valor" type="number" value={requestForm.valor} onChange={(event) => setRequestForm({ ...requestForm, valor: event.target.value })} /><EditorInput name="notas_admin" label="Notas administrativas" value={requestForm.notas_admin} onChange={(event) => setRequestForm({ ...requestForm, notas_admin: event.target.value })} /></EditorForm>}
        </section>
    )
}

/** Presenta estados de carga/vacío con estructura de tabla reutilizable. */
function AdminTable({ title, eyebrow, headers, children, loading, empty }) {
    const tableContent = Array.isArray(children) && children.length === 0 ? <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={headers.length}>{empty}</td></tr> : children

    return <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-2xl shadow-black/20"><div className="border-b border-white/10 px-5 py-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p><h2 className="mt-1 text-xl font-bold text-white">{title}</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/[.03] text-xs uppercase tracking-wider text-slate-500"><tr>{headers.map((header) => <th className="px-5 py-3" key={header}>{header}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{loading ? <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={headers.length}>Cargando...</td></tr> : tableContent}</tbody></table></div></div>
}

/** Agrupa los campos de edición con acciones uniformes para los tres recursos. */
function EditorForm({ title, children, onSubmit, onCancel, saving }) {
    return <form className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5" onSubmit={onSubmit}><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-white">{title}</h2><button className="text-xs text-slate-400 hover:text-white" type="button" onClick={onCancel}>Cancelar</button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div><button className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button></form>
}

/** Campo controlado reutilizable para formularios administrativos. */
function EditorInput({ name, label, type = 'text', value, onChange, required = false }) {
    return <label className="block"><span className="mb-1 block text-xs font-semibold capitalize text-slate-400">{label}</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" name={name} type={type} value={value} onChange={onChange} required={required} minLength={type === 'password' && value ? 8 : undefined} /></label>
}

/** Selector controlado para estados, prioridades y roles permitidos. */
function EditorSelect({ name, label, value, onChange, options }) {
    return <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-400">{label}</span><select className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white" name={name} value={value} onChange={onChange}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
}

export default AdministracionPanel