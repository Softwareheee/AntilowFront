import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const initialReportForm = {
    solicitud_servicio_id: '',
    diagnostico: '',
    trabajo_realizado: '',
    repuestos_utilizados: '',
    costo_mano_obra: 0,
    costo_repuestos: 0,
}

export function Reportes() {
    const [reportes, setReportes] = useState([])
    const [solicitudesPendientes, setSolicitudesPendientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [downloadingId, setDownloadingId] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSolicitud, setSelectedSolicitud] = useState(null)
    const [form, setForm] = useState(initialReportForm)
    const [feedback, setFeedback] = useState({ type: '', message: '' })

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            }
        }
    }

    const fetchData = async () => {
        setLoading(true)
        setFeedback({ type: '', message: '' })
        try {
            const headers = getAuthHeaders()

            const [resReportes, resSolicitudes] = await Promise.all([
                axios.get(`${API_URL}/reportes`, headers).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/solicitudes-servicio`, headers).catch(() => ({ data: [] }))
            ])

            setReportes(Array.isArray(resReportes.data) ? resReportes.data : [])

            const pendientes = Array.isArray(resSolicitudes.data)
                ? resSolicitudes.data.filter(sol => sol.estado !== 'resuelto' && sol.estado !== 'completado')
                : []
            setSolicitudesPendientes(pendientes)
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error.response?.data?.message || 'Error al conectar con el servidor.'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenModal = (solicitud) => {
        setSelectedSolicitud(solicitud)
        setForm({
            ...initialReportForm,
            solicitud_servicio_id: solicitud.id
        })
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
        setSelectedSolicitud(null)
        setForm(initialReportForm)
    }

    const handleSubmitReport = async (e) => {
        e.preventDefault()
        setSaving(true)
        setFeedback({ type: '', message: '' })

        try {
            await axios.post(`${API_URL}/reportes`, form, getAuthHeaders())
            setFeedback({
                type: 'success',
                message: `Reporte técnico guardado con éxito para el requerimiento #${form.solicitud_servicio_id}.`
            })
            handleCloseModal()
            await fetchData()
        } catch (error) {
            const validationErrors = error.response?.data?.errors
            const firstError = validationErrors && Object.values(validationErrors)[0]?.[0]
            setFeedback({
                type: 'error',
                message: firstError || error.response?.data?.message || 'No se pudo guardar el reporte de servicio.'
            })
        } finally {
            setSaving(false)
        }
    }

    const descargarPDF = async (reporteId, solicitudId) => {
        setDownloadingId(reporteId)
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')
            const response = await axios.get(`${API_URL}/reportes/${reporteId}/factura/descargar`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Factura_Antilow_REQ_${solicitudId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            setFeedback({
                type: 'error',
                message: 'No se pudo descargar la factura en PDF. Intenta de nuevo.'
            })
        } finally {
            setDownloadingId(null)
        }
    }

    const costoTotalCalculado = (Number(form.costo_mano_obra) || 0) + (Number(form.costo_repuestos) || 0)

    return (
        <section className="space-y-6" aria-labelledby="reports-title">
            <div className="max-w-3xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Módulo Operativo / 04</p>
                <h1 id="reports-title" className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                    Reportes de <span className="text-amber-400">Servicio.</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                    Registro de intervenciones, mantenimientos realizados e insumos asignados a los equipos ingresados.
                </p>
            </div>

            {feedback.message && (
                <p className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-red-400/25 bg-red-400/10 text-red-200'}`} role="alert">
                    {feedback.message}
                </p>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
                {/* Historial de Mantenimientos Realizados */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Auditoría Interna</p>
                            <h2 className="mt-1 text-xl font-bold text-white">Historial de Mantenimientos</h2>
                        </div>
                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                            {reportes.length} atendidos
                        </span>
                    </div>

                    {loading ? (
                        <p className="py-8 text-center text-sm text-slate-500">Cargando reportes del sistema...</p>
                    ) : reportes.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
                            Aún no se han generado reportes técnicos.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {reportes.map((reporte) => (
                                <article key={reporte.id} className="rounded-xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-white/20">
                                    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-cyan-400">#REQ-{reporte.solicitud_servicio_id}</span>
                                                <h3 className="text-sm font-bold text-white">{reporte.solicitudservicio?.asunto || 'Sin Asunto'}</h3>
                                            </div>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                Cliente: <strong className="text-slate-200">{reporte.solicitudservicio?.user?.name || 'Cliente'}</strong>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-extrabold text-emerald-400">
                                                ${Number(reporte.costo_total).toLocaleString('es-CO')}
                                            </span>
                                            <span className="block text-[10px] text-slate-500">Total Facturado</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2 text-xs leading-5">
                                        <div>
                                            <strong className="text-cyan-300">Diagnóstico: </strong>
                                            <span className="text-slate-300">{reporte.diagnostico}</span>
                                        </div>
                                        <div>
                                            <strong className="text-amber-300">Trabajo Realizado: </strong>
                                            <span className="text-slate-300">{reporte.trabajo_realizado}</span>
                                        </div>
                                        {reporte.repuestos_utilizados && (
                                            <div>
                                                <strong className="text-slate-400">Repuestos / Piezas: </strong>
                                                <span className="text-slate-400">{reporte.repuestos_utilizados}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-500">
                                        <span>Técnico: <strong className="text-slate-400">{reporte.administrador?.name || 'Admin'}</strong></span>
                                        <time>{new Date(reporte.created_at).toLocaleDateString('es-CO')}</time>
                                    </div>

                                    {/* Botón de Descarga de Factura PDF */}
                                    <button
                                        type="button"
                                        onClick={() => descargarPDF(reporte.id, reporte.solicitud_servicio_id)}
                                        disabled={downloadingId === reporte.id}
                                        className="mt-3 flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                                    >
                                        📄 {downloadingId === reporte.id ? 'Generando PDF...' : 'Descargar Factura (PDF)'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {/* Solicitudes de Clientes Pendientes */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 sm:p-6">
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Pendientes de Diagnóstico</p>
                        <h2 className="mt-1 text-xl font-bold text-white">Solicitudes de Clientes</h2>
                    </div>

                    {loading ? (
                        <p className="py-8 text-center text-sm text-slate-500">Cargando solicitudes...</p>
                    ) : solicitudesPendientes.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
                            No hay solicitudes pendientes por resolver.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {solicitudesPendientes.map((sol) => (
                                <article key={sol.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">{sol.prioridad}</span>
                                            <h3 className="text-sm font-bold text-white">{sol.asunto}</h3>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                            {sol.estado}
                                        </span>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">{sol.descripcion}</p>

                                    <button
                                        onClick={() => handleOpenModal(sol)}
                                        className="mt-3 w-full rounded-lg bg-cyan-500/20 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/30 border border-cyan-500/30"
                                    >
                                        Generar Reporte Técnico
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para Crear el Reporte */}
            {modalOpen && selectedSolicitud && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <p className="text-xs font-bold uppercase text-cyan-400">Atención de Caso #REQ-{selectedSolicitud.id}</p>
                                <h3 className="text-lg font-bold text-white">{selectedSolicitud.asunto}</h3>
                            </div>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
                            <label className="block">
                                <span className="mb-1 block text-xs font-semibold text-slate-300">Diagnóstico Técnico</span>
                                <textarea
                                    className="w-full min-h-20 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                    placeholder="Detalla qué fallas o problemas se encontraron en el equipo..."
                                    value={form.diagnostico}
                                    onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-semibold text-slate-300">Trabajo / Mantenimiento Realizado</span>
                                <textarea
                                    className="w-full min-h-20 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                    placeholder="Describe las correcciones o mantenimientos ejecutados..."
                                    value={form.trabajo_realizado}
                                    onChange={(e) => setForm({ ...form, trabajo_realizado: e.target.value })}
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-semibold text-slate-300">Repuestos o Piezas Utilizadas (Opcional)</span>
                                <input
                                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                    type="text"
                                    placeholder="Ej. Memoria RAM 16GB, Pasta térmica..."
                                    value={form.repuestos_utilizados}
                                    onChange={(e) => setForm({ ...form, repuestos_utilizados: e.target.value })}
                                />
                            </label>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold text-slate-300">Costo Mano de Obra ($)</span>
                                    <input
                                        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                        type="number"
                                        min="0"
                                        value={form.costo_mano_obra}
                                        onChange={(e) => setForm({ ...form, costo_mano_obra: e.target.value })}
                                        required
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-semibold text-slate-300">Costo Repuestos ($)</span>
                                    <input
                                        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                        type="number"
                                        min="0"
                                        value={form.costo_repuestos}
                                        onChange={(e) => setForm({ ...form, costo_repuestos: e.target.value })}
                                        required
                                    />
                                </label>
                            </div>

                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-right">
                                <span className="text-xs text-slate-400 block">Total Liquidado para Facturación:</span>
                                <span className="text-lg font-black text-emerald-400">
                                    ${costoTotalCalculado.toLocaleString('es-CO')}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-lg px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Completar y Guardar Reporte'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Reportes