import api from '../../api/api.js'

/** Recupera las solicitudes asociadas a la cuenta autenticada. */
export async function listarMisSolicitudes() {
    const { data } = await api.get('/solicitudes-servicio')
    return data
}

/** Crea una solicitud de soporte vinculada al usuario de la sesión. */
export async function crearSolicitud(solicitud) {
    const { data } = await api.post('/solicitudes-servicio', solicitud)
    return data
}