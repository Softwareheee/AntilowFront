import axiosClient from '../../api/api.js'

export async function listarClientes() {
  const { data } = await axiosClient.get('/clientes');
  return data;
}

export async function registrarCliente(cliente) {
  const { data } = await axiosClient.post('/clientes', cliente);
  return data;
}

export async function editarCliente(id, cliente) {
  const { data } = await axiosClient.put(`/clientes/${id}`, cliente);
  return data;
}

export async function eliminarCliente(id) {
  const { data } = await axiosClient.delete(`/clientes/${id}`);
  return data;
}