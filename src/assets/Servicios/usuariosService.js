import api from '../../api/api.js'

/** Lista las cuentas disponibles para la consola administrativa. */
export async function listarUsuarios() {
    const { data } = await api.get('/usuarios')
    return data
}

/** Crea una cuenta desde el panel de administración. */
export async function crearUsuario(usuario) {
    const { data } = await api.post('/usuarios', usuario)
    return data
}

/** Actualiza campos de usuario, incluidos rol y contraseña cuando se envían. */
export async function editarUsuario(id, usuario) {
    const { data } = await api.patch(`/usuarios/${id}`, usuario)
    return data
}

/** Elimina una cuenta existente. */
export async function eliminarUsuario(id) {
    await api.delete(`/usuarios/${id}`)
}

/** Devuelve el directorio de clientes para el administrador. */
export async function listarClientesAdmin() {
    const { data } = await api.get('/clientes')
    return data
}

/** Actualiza la información de contacto de un cliente. */
export async function editarClienteAdmin(id, cliente) {
    const { data } = await api.put(`/clientes/${id}`, cliente)
    return data
}

/** Elimina un registro del directorio de clientes. */
export async function eliminarClienteAdmin(id) {
    await api.delete(`/clientes/${id}`)
}

/** Recupera solicitudes propias para clientes o todas para administradores. */
export async function listarSolicitudesAdmin() {
    const { data } = await api.get('/solicitudes-servicio')
    return data
}

/** Actualiza estado, prioridad, costos y notas administrativas de una solicitud. */
export async function editarSolicitudAdmin(id, solicitud) {
    const { data } = await api.patch(`/solicitudes-servicio/${id}`, solicitud)
    return data
}

/** Elimina una solicitud desde el panel administrativo. */
export async function eliminarSolicitudAdmin(id) {
    await api.delete(`/solicitudes-servicio/${id}`)
}

/** Obtiene los productos visibles según el rol de la sesión. */
export async function listarProductos() {
    const { data } = await api.get('/productos')
    return data
}

/** Crea un producto, incluyendo imagen local como multipart/form-data. */
export async function crearProducto(producto) {
    const { data } = await api.post('/productos', producto, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

/** Actualiza un producto usando method spoofing para admitir subida de archivos. */
export async function editarProducto(id, producto) {
    const { data } = await api.post(`/productos/${id}?_method=PUT`, producto, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

/** Elimina el producto y su imagen almacenada desde la API. */
export async function eliminarProducto(id) {
    await api.delete(`/productos/${id}`)
}

/** Registra una solicitud de compra asociada al producto del catálogo. */
export async function solicitarCompra(product_id, producto) {
    const { data } = await api.post('/solicitudes-servicio', {
        product_id,
        tipo: 'compra',
        asunto: `Solicitud de compra: ${producto.nombre}`,
        descripcion: `El cliente solicita información y disponibilidad de ${producto.nombre}.`,
        prioridad: 'normal',
    })
    return data
}