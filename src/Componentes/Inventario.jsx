import { useEffect, useState } from 'react'
import { crearProducto, editarProducto, eliminarProducto, listarProductos, solicitarCompra } from '../assets/Servicios/usuariosService.js'

const emptyProduct = { nombre: '', categoria: 'periferico', descripcion: '', precio: '', stock: '', imagen_url: '', imagen: null, caracteristicas: '' }

function Inventario({ isAdmin = false }) {
	const [products, setProducts] = useState([])
	const [form, setForm] = useState(emptyProduct)
	const [editingId, setEditingId] = useState(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [deletingId, setDeletingId] = useState(null)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	const loadProducts = async () => {
		try {
			setError('')
			setLoading(true)
			setProducts(await listarProductos())
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'No se pudo cargar el inventario.')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let cancelled = false
		const loadInitialProducts = async () => {
			try {
				const loadedProducts = await listarProductos()
				if (!cancelled) setProducts(loadedProducts)
			} catch (requestError) {
				if (!cancelled) setError(requestError.response?.data?.message || 'No se pudo cargar el inventario.')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		loadInitialProducts()
		return () => { cancelled = true }
	}, [])

	const changeForm = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }))
	const changeImage = ({ target }) => setForm((current) => ({ ...current, imagen: target.files?.[0] || null }))
	const resetForm = () => { setForm(emptyProduct); setEditingId(null) }

	const submitProduct = async (event) => {
		event.preventDefault()
		setSaving(true)
		setError('')
		try {
			const payload = new FormData()
			payload.append('nombre', form.nombre)
			payload.append('categoria', form.categoria)
			payload.append('descripcion', form.descripcion)
			payload.append('precio', Number(form.precio))
			payload.append('stock', Number(form.stock))
			payload.append('caracteristicas', JSON.stringify(form.caracteristicas.split(',').map((item) => item.trim()).filter(Boolean)))
			if (form.imagen_url) payload.append('imagen_url', form.imagen_url)
			if (form.imagen) payload.append('imagen', form.imagen)
			if (editingId) await editarProducto(editingId, payload)
			else await crearProducto(payload)
			resetForm()
			await loadProducts()
			setMessage('Producto guardado correctamente.')
		} catch (requestError) {
			const validationErrors = requestError.response?.data?.errors
			setError(validationErrors ? Object.values(validationErrors)[0]?.[0] : requestError.response?.data?.message || 'No se pudo guardar el producto.')
		} finally {
			setSaving(false)
		}
	}

	const startEdit = (product) => {
		setEditingId(product.id)
		setForm({ ...product, imagen: null, caracteristicas: (product.caracteristicas || []).join(', ') })
		setMessage('')
		setError('')
	}

	const deleteProduct = async (product) => {
		if (!window.confirm(`¿Eliminar ${product.nombre} del inventario?`)) return
		setDeletingId(product.id)
		setError('')
		setMessage('')
		try {
			await eliminarProducto(product.id)
			if (editingId === product.id) resetForm()
			await loadProducts()
			setMessage(`${product.nombre} fue eliminado del inventario.`)
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'No se pudo eliminar el producto.')
		} finally {
			setDeletingId(null)
		}
	}

	const buyProduct = async (product) => {
		try {
			setError('')
			await solicitarCompra(product.id, product)
			setMessage(`Solicitud enviada para ${product.nombre}. El equipo te contactará pronto.`)
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'No se pudo enviar la solicitud de compra.')
		}
	}

	return (
		<section className="space-y-7" aria-labelledby="inventory-title">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Catálogo Antilow / inventario</p><h1 id="inventory-title" className="text-3xl font-black text-white sm:text-4xl">Periféricos listos para tu setup</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Explora equipos disponibles, compara sus características y solicita una compra directamente a nuestro equipo.</p></div><button className="w-fit rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-white/5" type="button" onClick={loadProducts}>Actualizar catálogo</button></div>
			{message && <p className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200" role="status">{message}</p>}
			{error && <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{error}</p>}
			{isAdmin && <form className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5" onSubmit={submitProduct}><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Administración de stock</p><h2 className="mt-1 font-bold text-white">{editingId ? 'Editar producto' : 'Añadir periférico'}</h2></div>{editingId && <button className="text-xs text-slate-400 hover:text-white" type="button" onClick={resetForm}>Cancelar</button>}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input className="catalog-input" name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={changeForm} required /><select className="catalog-input" name="categoria" value={form.categoria} onChange={changeForm}><option value="periferico">Periférico</option><option value="audio">Audio</option><option value="gaming">Gaming</option><option value="oficina">Oficina</option></select><input className="catalog-input" name="precio" type="number" min="0" step="0.01" placeholder="Precio" value={form.precio} onChange={changeForm} required /><input className="catalog-input" name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={changeForm} required /><label className="catalog-input cursor-pointer sm:col-span-2"><span className="block text-xs text-slate-400">Imagen desde tu PC</span><input className="mt-2 w-full text-xs text-slate-300" name="imagen" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={changeImage} /></label><input className="catalog-input sm:col-span-2" name="imagen_url" type="url" placeholder="O usa una URL compatible" value={form.imagen_url} onChange={changeForm} /><input className="catalog-input sm:col-span-2 lg:col-span-4" name="caracteristicas" placeholder="Características separadas por comas" value={form.caracteristicas} onChange={changeForm} /><textarea className="catalog-input sm:col-span-2 lg:col-span-4" name="descripcion" placeholder="Descripción del producto" rows="2" value={form.descripcion} onChange={changeForm} /><button className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-300" type="submit" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Publicar producto'}</button></div></form>}
			{loading ? <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-400">Cargando catálogo...</div> : products.length === 0 ? <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-400">No hay productos disponibles en este momento.</div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/30" key={product.id}><div className="relative aspect-[4/3] overflow-hidden bg-slate-950">{product.imagen_url ? <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.imagen_url} alt={product.nombre} /> : <div className="grid h-full place-items-center text-5xl text-slate-700">⌘</div>}<span className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">{product.categoria}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold text-white">{product.nombre}</h2><strong className="whitespace-nowrap text-lg text-cyan-300">${Number(product.precio).toLocaleString('es-CO')}</strong></div><p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{product.descripcion || 'Periférico seleccionado por Antilow.'}</p><div className="mt-4 flex flex-wrap gap-2">{(product.caracteristicas || []).map((feature) => <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300" key={feature}>{feature}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4"><span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-300' : 'text-red-300'}`}>{product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</span>{isAdmin ? <div><button className="mr-3 text-xs font-bold text-cyan-300" type="button" onClick={() => startEdit(product)}>Editar</button><button className="text-xs font-bold text-red-300 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={deletingId === product.id} onClick={() => deleteProduct(product)}>{deletingId === product.id ? 'Eliminando...' : 'Eliminar'}</button></div> : <button className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!product.stock} onClick={() => buyProduct(product)}>Solicitar compra</button>}</div></div></article>)}</div>}
		</section>
	)
}

export default Inventario
