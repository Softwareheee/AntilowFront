import api from '../../api/api.js'

export async function listarUsuarios() {
    const { data } = await api.get('/usuarios')
    return data
}

export async function crearUsuario(usuario) {
    const { data } = await api.post('/usuarios', usuario)
    return data
}

export async function editarUsuario(id, usuario) {
    const { data } = await api.patch(`/usuarios/${id}`, usuario)
    return data
}

export async function eliminarUsuario(id) {
    await api.delete(`/usuarios/${id}`)
}

export async function listarClientesAdmin() {
    const { data } = await api.get('/clientes')
    return data
}

export async function editarClienteAdmin(id, cliente) {
    const { data } = await api.put(`/clientes/${id}`, cliente)
    return data
}

export async function eliminarClienteAdmin(id) {
    await api.delete(`/clientes/${id}`)
}

export async function listarSolicitudesAdmin() {
    const { data } = await api.get('/solicitudes-servicio')
    return data
}

export async function editarSolicitudAdmin(id, solicitud) {
    const { data } = await api.patch(`/solicitudes-servicio/${id}`, solicitud)
    return data
}

export async function eliminarSolicitudAdmin(id) {
    await api.delete(`/solicitudes-servicio/${id}`)
}