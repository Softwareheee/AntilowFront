import axiosClient from '../../api/api.js'

/** Operaciones CRUD del directorio de clientes reservado al administrador. */
export async function listarClientes() {
  const { data } = await axiosClient.get('/clientes');
  return data;
}

/** Agrega un registro al directorio de clientes. */
export async function registrarCliente(cliente) {
  const { data } = await axiosClient.post('/clientes', cliente);
  return data;
}

/** Envía los campos editados del cliente indicado. */
export async function editarCliente(id, cliente) {
  const { data } = await axiosClient.put(`/clientes/${id}`, cliente);
  return data;
}

/** Elimina el cliente indicado por su identificador. */
export async function eliminarCliente(id) {
  const { data } = await axiosClient.delete(`/clientes/${id}`);
  return data;
}