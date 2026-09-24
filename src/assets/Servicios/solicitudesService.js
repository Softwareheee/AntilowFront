import api from '../../api/api.js'

export async function listarMisSolicitudes() {
    const { data } = await api.get('/solicitudes-servicio')
    return data
}

export async function crearSolicitud(solicitud) {
    const { data } = await api.post('/solicitudes-servicio', solicitud)
    return data
}