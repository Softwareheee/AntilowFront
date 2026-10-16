import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../api/api.js'
import AvisoAcceso from './AvisoAcceso.jsx'

/** Valores iniciales para registrar el diagnóstico, trabajo e importes del caso. */
const initialReportForm = {
    solicitud_servicio_id: '',
    diagnostico: '',
    trabajo_realizado: '',
    repuestos_utilizados: '',
    costo_mano_obra: 0,
    costo_repuestos: 0,
}

/** Obtiene reportes y solicitudes juntas para alimentar ambas listas del módulo. */
async function loadReportData() {
    const [reportsResponse, requestsResponse] = await Promise.all([
        api.get('/reportes'),
        api.get('/solicitudes-servicio'),
    ])

    return {
        reports: Array.isArray(reportsResponse.data) ? reportsResponse.data : [],
        pendingRequests: Array.isArray(requestsResponse.data)
            ? requestsResponse.data.filter((request) => !['resuelto', 'resuelta', 'completado'].includes(request.estado))
            : [],
    }
}

/** Consola administrativa para cerrar solicitudes, registrar informes y descargar facturas. */
export function Reportes({ authenticated, isAdmin, onLogin, onHome }) {
    const [reportes, setReportes] = useState([])
    const [solicitudesPendientes, setSolicitudesPendientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [downloadingId, setDownloadingId] = useState(null)
    const [downloadingPurchaseId, setDownloadingPurchaseId] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedSolicitud, setSelectedSolicitud] = useState(null)
    const [form, setForm] = useState(initialReportForm)
    const [feedback, setFeedback] = useState({ type: '', message: '' })
    const [showSuccessNotice, setShowSuccessNotice] = useState(false)
    const [savedRequestId, setSavedRequestId] = useState(null)
    const [accessReason, setAccessReason] = useState(null)

    useEffect(() => {
        if (!showSuccessNotice) return undefined

        const timeoutId = window.setTimeout(() => setShowSuccessNotice(false), 8000)
        return () => window.clearTimeout(timeoutId)
    }, [showSuccessNotice])

    const captureAccessError = (error) => {
        if (error.response?.status === 401) setAccessReason('admin-login')
        if (error.response?.status === 403) setAccessReason('admin')
    }

    /** Refresca informes y solicitudes y presenta errores del backend. */
    const fetchData = async () => {
        setLoading(true)
        setFeedback({ type: '', message: '' })
        try {
            const data = await loadReportData()
            setReportes(data.reports)
            setSolicitudesPendientes(data.pendingRequests)
        } catch (requestError) {
            captureAccessError(requestError)
            setFeedback({
                type: 'error',
                message: getApiErrorMessage(requestError, 'Error al conectar con el servidor.')
            })
        } finally {
            setLoading(false)
        }
    }

    // Carga inicial cancelable para no escribir estado después de salir del módulo.
    useEffect(() => {
        let cancelled = false

        const loadInitialData = async () => {
            try {
                const data = await loadReportData()
                if (cancelled) return
                setReportes(data.reports)
                setSolicitudesPendientes(data.pendingRequests)
            } catch (requestError) {
                captureAccessError(requestError)
                if (!cancelled) {
                    setFeedback({
                        type: 'error',
                        message: getApiErrorMessage(requestError, 'Error al conectar con el servidor.')
                    })
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadInitialData()
        return () => {
            cancelled = true
        }
    }, [])

    /** Inicializa el informe con la solicitud que el administrador eligió atender. */
    const handleOpenModal = (solicitud) => {
        setSelectedSolicitud(solicitud)
        setForm({
            ...initialReportForm,
            solicitud_servicio_id: solicitud.id,
        })
        setModalOpen(true)
    }

    /** Cierra el editor y restablece sus valores para el siguiente caso. */
    const handleCloseModal = () => {
        setModalOpen(false)
        setSelectedSolicitud(null)
        setForm(initialReportForm)
    }

    /** Registra el informe; el backend actualiza el caso y genera la factura. */
    const handleSubmitReport = async (e) => {
        e.preventDefault()
        setSaving(true)
        setFeedback({ type: '', message: '' })

        try {
            const requestId = form.solicitud_servicio_id
            await api.post('/reportes', form)
            setSavedRequestId(requestId)
            handleCloseModal()
            setFeedback({ type: '', message: '' })
            setShowSuccessNotice(true)
            await fetchData()
        } catch (error) {
            captureAccessError(error)
            const validationErrors = error.response?.data?.errors
            const firstError = validationErrors && Object.values(validationErrors)[0]?.[0]
            setFeedback({
                type: 'error',
                message: firstError || getApiErrorMessage(error, 'No se pudo guardar el reporte de servicio.')
            })
        } finally {
            setSaving(false)
        }
    }

    /** Descarga la factura como blob y crea un enlace temporal para el navegador. */
    const descargarPDF = async (reporteId, solicitudId) => {
        setDownloadingId(reporteId)
        try {
            const response = await api.get(`/reportes/${reporteId}/factura/descargar`, {
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
        } catch (requestError) {
            captureAccessError(requestError)
            let serverMessage = requestError.response?.data?.message
            if (requestError.response?.data instanceof Blob) {
                try {
                    const errorBody = JSON.parse(await requestError.response.data.text())
                    serverMessage = errorBody.message
                } catch {
                    serverMessage = ''
                }
            }
            setFeedback({
                type: 'error',
                message: serverMessage || getApiErrorMessage(requestError, 'No se pudo descargar la factura en PDF. Intenta de nuevo.')
            })
        } finally {
            setDownloadingId(null)
        }
    }

    /** Descarga el documento de compra con precio y cliente, sin usar el formato técnico. */
    const descargarFacturaCompra = async (solicitud) => {
        setDownloadingPurchaseId(solicitud.id)
        try {
            const response = await api.get(`/solicitudes-servicio/${solicitud.id}/factura-compra/descargar`, {
                responseType: 'blob',
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Proforma_Compra_Antilow_${solicitud.id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (requestError) {
            captureAccessError(requestError)
            let serverMessage = requestError.response?.data?.message
            if (requestError.response?.data instanceof Blob) {
                try {
                    const errorBody = JSON.parse(await requestError.response.data.text())
                    serverMessage = errorBody.message
                } catch {
                    serverMessage = ''
                }
            }
            setFeedback({
                type: 'error',
                message: serverMessage || getApiErrorMessage(requestError, 'No se pudo generar el detalle PDF de compra. Intenta de nuevo.')
            })
        } finally {
            setDownloadingPurchaseId(null)
        }
    }

    const costoTotalCalculado = (Number(form.costo_mano_obra) || 0) + (Number(form.costo_repuestos) || 0)

    if (accessReason || !authenticated || !isAdmin) {
        return <AvisoAcceso reason={accessReason || (!authenticated ? 'login' : 'admin')} onLogin={onLogin} onHome={onHome} />
    }

    return (
        <section className="space-y-6" aria-labelledby="reports-title">
            {showSuccessNotice && (
                <div className="report-success-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
                    <div className="report-success-notice relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#0d151b] p-7 text-center shadow-[0_24px_100px_rgba(0,0,0,.65)] sm:p-9" role="status" aria-live="polite" aria-atomic="true">
                        <div className="report-success-glow pointer-events-none absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden="true" />
                        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,.15)]">
                            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path className="report-success-check" d="m6 12.5 4 4L18.5 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[.22em] text-emerald-300">Intervención registrada</p>
                        <h2 className="relative mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white sm:text-3xl">¡Reporte creado!</h2>
                        <p className="relative mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
                            El reporte del requerimiento <strong className="text-white">#{savedRequestId}</strong> quedó guardado correctamente. El caso ya está actualizado y la información quedó disponible en el historial.
                        </p>
                        <button
                            className="relative mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d151b]"
                            type="button"
                            onClick={() => setShowSuccessNotice(false)}
                        >
                            Continuar
                        </button>
                        <div className="report-success-progress absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-300" aria-hidden="true" />
                    </div>
                </div>
            )}
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
                                <article id={`service-report-${reporte.id}`} key={reporte.id} className="rounded-xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-white/20">
                                    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-cyan-400">#REQ-{reporte.solicitud_servicio_id}</span>
                                                <h3 className="text-sm font-bold text-white">{reporte.solicitudservicio?.asunto || 'Sin Asunto'}</h3>
                                            </div>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                Cliente: <strong className="text-slate-200">{reporte.nombre_cliente || reporte.solicitudservicio?.user?.name || 'Cliente'}</strong>
                                            </p>
                                            {reporte.telefono_cliente && <p className="mt-1 text-xs text-slate-400">Teléfono: <a className="text-cyan-300 hover:text-cyan-200" href={`tel:${reporte.telefono_cliente}`}>{reporte.telefono_cliente}</a></p>}
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
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Solicitudes por atender</p>
                        <h2 className="mt-1 text-xl font-bold text-white">Clientes y compras</h2>
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
                                <article key={sol.id} className={`rounded-xl border bg-slate-950/50 p-4 ${sol.tipo === 'compra' ? 'border-cyan-300/20 shadow-lg shadow-cyan-950/10' : 'border-white/10'}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${sol.tipo === 'compra' ? 'text-cyan-300' : 'text-red-400'}`}>{sol.tipo === 'compra' ? 'Solicitud de compra' : sol.prioridad}</span>
                                            <h3 className="text-sm font-bold text-white">{sol.asunto}</h3>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                            {sol.estado}
                                        </span>
                                    </div>
                                    {sol.tipo === 'compra' ? (
                                        <div className="mt-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[.04] p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Producto solicitado</p>
                                            <p className="mt-1 text-sm font-bold text-white">{sol.producto?.nombre || sol.asunto.replace(/^Solicitud de compra:\s*/i, '')}</p>
                                            <p className="mt-1 text-xs text-slate-400">Cantidad: <strong className="text-slate-200">{sol.cantidad || 1}</strong>{(sol.precio_unitario ?? sol.producto?.precio) != null && <> · Precio unitario: <strong className="text-slate-200">${Number(sol.precio_unitario ?? sol.producto.precio).toLocaleString('es-CO')}</strong></>}</p>
                                        </div>
                                    ) : (
                                        <p className="mt-2 line-clamp-2 text-xs text-slate-400">{sol.descripcion}</p>
                                    )}
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                                        <div className="text-xs text-slate-400">
                                            <span>Cliente: <strong className="text-slate-200">{sol.nombre_cliente || sol.user?.name || 'Cliente'}</strong></span>
                                            {sol.telefono_cliente && <a className="ml-3 font-semibold text-cyan-300 hover:text-cyan-200" href={`tel:${sol.telefono_cliente}`}>☎ {sol.telefono_cliente}</a>}
                                        </div>
                                        {sol.tipo === 'compra' ? (
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    className="rounded-lg border border-emerald-300/20 bg-emerald-300/[.08] px-3 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-300/[.15] disabled:cursor-wait disabled:opacity-50"
                                                    type="button"
                                                    onClick={() => descargarFacturaCompra(sol)}
                                                    disabled={downloadingPurchaseId === sol.id}
                                                >
                                                    {downloadingPurchaseId === sol.id ? 'Generando PDF...' : 'Generar factura proforma (PDF)'}
                                                </button>
                                                {sol.telefono_cliente && <a className="rounded-lg border border-cyan-300/20 bg-cyan-300/[.08] px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/[.15]" href={`tel:${sol.telefono_cliente}`}>Contactar cliente</a>}
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(sol)}
                                                className="rounded-lg border border-cyan-500/30 bg-cyan-500/20 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/30"
                                            >
                                                Generar Reporte Técnico
                                            </button>
                                        )}
                                    </div>
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