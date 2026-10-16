import { useEffect, useState } from 'react'
import { crearProducto, editarProducto, eliminarProducto, listarProductos, solicitarCompra } from '../assets/Servicios/usuariosService.js'
import { getApiErrorMessage } from '../api/api.js'

/** Catálogo público y herramientas administrativas de stock y productos. */
const emptyProduct = { nombre: '', categoria: 'periferico', descripcion: '', precio: '', stock: '', imagen_url: '', imagen: null, caracteristicas: '' }

function Inventario({ isAdmin = false, authenticated = false, onLogin, onRegister }) {
	const [products, setProducts] = useState([])
	const [form, setForm] = useState(emptyProduct)
	const [editingId, setEditingId] = useState(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [deletingId, setDeletingId] = useState(null)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [purchaseProduct, setPurchaseProduct] = useState(null)
	const [purchaseForm, setPurchaseForm] = useState({ nombre_cliente: '', telefono_cliente: '', cantidad: '1' })
	const [purchaseSaving, setPurchaseSaving] = useState(false)
	const [purchaseError, setPurchaseError] = useState('')
	const [purchaseSuccess, setPurchaseSuccess] = useState('')

	useEffect(() => {
		if (!purchaseSuccess) return undefined

		const timeoutId = window.setTimeout(() => setPurchaseSuccess(''), 8000)
		return () => window.clearTimeout(timeoutId)
	}, [purchaseSuccess])

	/** Actualiza el catálogo desde la API y refleja errores de conectividad. */
	const loadProducts = async () => {
		try {
			setError('')
			setLoading(true)
			setProducts(await listarProductos())
		} catch (requestError) {
			setError(getApiErrorMessage(requestError, 'No se pudo cargar el inventario.'))
		} finally {
			setLoading(false)
		}
	}

	// Carga el catálogo al entrar y descarta respuestas tardías al desmontar la vista.
	useEffect(() => {
		let cancelled = false
		const loadInitialProducts = async () => {
			try {
				const loadedProducts = await listarProductos()
				if (!cancelled) setProducts(loadedProducts)
			} catch (requestError) {
				if (!cancelled) setError(getApiErrorMessage(requestError, 'No se pudo cargar el inventario.'))
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		loadInitialProducts()
		return () => { cancelled = true }
	}, [])

	const changeForm = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }))
	/** Conserva el archivo seleccionado para enviarlo luego como multipart. */
	const changeImage = ({ target }) => setForm((current) => ({ ...current, imagen: target.files?.[0] || null }))
	const resetForm = () => { setForm(emptyProduct); setEditingId(null) }

	/** Envía campos e imagen como multipart para crear o actualizar un producto. */
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
			setError(validationErrors ? Object.values(validationErrors)[0]?.[0] : getApiErrorMessage(requestError, 'No se pudo guardar el producto.'))
		} finally {
			setSaving(false)
		}
	}

	/** Carga los datos existentes en el formulario de edición del administrador. */
	const startEdit = (product) => {
		setEditingId(product.id)
		setForm({ ...product, imagen: null, caracteristicas: (product.caracteristicas || []).join(', ') })
		setMessage('')
		setError('')
	}

	/** Elimina un producto después de confirmación y refresca el catálogo. */
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
			setError(getApiErrorMessage(requestError, 'No se pudo eliminar el producto.'))
		} finally {
			setDeletingId(null)
		}
	}

	/** Abre una solicitud de compra con el producto ya seleccionado. */
	const buyProduct = (product) => {
		if (!authenticated) {
			onLogin?.()
			return
		}

		setError('')
		setPurchaseError('')
		setPurchaseForm({ nombre_cliente: '', telefono_cliente: '', cantidad: '1' })
		setPurchaseProduct(product)
	}

	const closePurchaseForm = () => {
		if (purchaseSaving) return
		setPurchaseProduct(null)
		setPurchaseError('')
	}

	/** Envía al administrador la compra solicitada y los datos para contactar al cliente. */
	const submitPurchase = async (event) => {
		event.preventDefault()
		if (!purchaseProduct) return

		setPurchaseSaving(true)
		setPurchaseError('')
		try {
			await solicitarCompra(purchaseProduct.id, purchaseProduct, purchaseForm)
			setPurchaseProduct(null)
			setPurchaseSuccess(purchaseProduct.nombre)
		} catch (requestError) {
			const validationErrors = requestError.response?.data?.errors
			setPurchaseError(validationErrors ? Object.values(validationErrors)[0]?.[0] : getApiErrorMessage(requestError, 'No se pudo enviar la solicitud de compra.'))
		} finally {
			setPurchaseSaving(false)
		}
	}

	return (
		<section className="space-y-7" aria-labelledby="inventory-title">
			{purchaseSuccess && (
				<div className="report-success-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 py-8 backdrop-blur-sm">
					<div className="report-success-notice relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#0d151b] p-7 text-center shadow-[0_24px_100px_rgba(0,0,0,.65)] sm:p-9" role="status" aria-live="polite" aria-atomic="true">
						<div className="report-success-glow pointer-events-none absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden="true" />
						<div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,.15)]">
							<svg className="h-8 w-8 report-success-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 12.5 4 4L18.5 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
						</div>
						<p className="relative mt-5 text-[11px] font-bold uppercase tracking-[.22em] text-emerald-300">Solicitud de compra enviada</p>
						<h2 className="relative mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white sm:text-3xl">¡Gracias por elegirnos!</h2>
						<p className="relative mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
							Registramos tu interés en <strong className="text-white">{purchaseSuccess}</strong>. Nuestro equipo revisará la disponibilidad y se comunicará contigo al teléfono que indicaste.
						</p>
						<button className="relative mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200" type="button" onClick={() => setPurchaseSuccess('')}>Entendido</button>
						<div className="report-success-progress absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-300" aria-hidden="true" />
					</div>
				</div>
			)}
			{purchaseProduct && (
				<div className="purchase-modal-backdrop fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closePurchaseForm() }}>
					<section className="purchase-modal-card relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#0b111b] shadow-[0_24px_100px_rgba(0,0,0,.7)]" role="dialog" aria-modal="true" aria-labelledby="purchase-modal-title">
						<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" aria-hidden="true" />
						<div className="flex items-start justify-between gap-4 border-b border-white/10 p-6 sm:p-7">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-300">Solicitud de compra</p>
								<h2 id="purchase-modal-title" className="mt-2 font-['Space_Grotesk'] text-2xl font-bold text-white">Hablemos de este equipo</h2>
								<p className="mt-2 text-sm leading-5 text-slate-400">Déjanos tus datos y un técnico te contactará para confirmar disponibilidad.</p>
							</div>
							<button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-white/25 hover:text-white disabled:opacity-50" type="button" onClick={closePurchaseForm} disabled={purchaseSaving} aria-label="Cerrar formulario">✕</button>
						</div>
						<form className="space-y-5 p-6 sm:p-7" onSubmit={submitPurchase}>
							<div className="flex items-center gap-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/[.05] p-3">
								<div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-950">
									{purchaseProduct.imagen_url ? <img className="h-full w-full object-cover" src={purchaseProduct.imagen_url} alt="" /> : <div className="grid h-full place-items-center text-3xl text-slate-700">⌘</div>}
								</div>
								<div className="min-w-0">
									<p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Producto seleccionado</p>
									<h3 className="mt-1 truncate text-sm font-bold text-white">{purchaseProduct.nombre}</h3>
									<p className="mt-1 text-sm font-semibold text-cyan-200">${Number(purchaseProduct.precio).toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-500">· {purchaseProduct.stock} disponibles</span></p>
								</div>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<label className="block sm:col-span-2">
									<span className="mb-1.5 block text-xs font-semibold text-slate-300">Nombre completo</span>
									<input className="catalog-input" name="nombre_cliente" type="text" autoComplete="name" maxLength="255" placeholder="¿Con quién nos comunicamos?" value={purchaseForm.nombre_cliente} onChange={({ target }) => setPurchaseForm((current) => ({ ...current, nombre_cliente: target.value }))} required />
								</label>
								<label className="block">
									<span className="mb-1.5 block text-xs font-semibold text-slate-300">Teléfono de contacto</span>
									<input className="catalog-input" name="telefono_cliente" type="tel" autoComplete="tel" maxLength="30" placeholder="300 123 4567" value={purchaseForm.telefono_cliente} onChange={({ target }) => setPurchaseForm((current) => ({ ...current, telefono_cliente: target.value }))} required />
								</label>
								<label className="block">
									<span className="mb-1.5 block text-xs font-semibold text-slate-300">Cantidad</span>
									<input className="catalog-input" name="cantidad" type="number" min="1" max={purchaseProduct.stock} step="1" value={purchaseForm.cantidad} onChange={({ target }) => setPurchaseForm((current) => ({ ...current, cantidad: target.value }))} required />
								</label>
							</div>
							{purchaseError && <p className="rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs leading-5 text-red-200" role="alert">{purchaseError}</p>}
							<div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
								<button className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[.05] disabled:opacity-50" type="button" onClick={closePurchaseForm} disabled={purchaseSaving}>Cancelar</button>
								<button className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={purchaseSaving}>{purchaseSaving ? 'Enviando solicitud...' : 'Enviar solicitud'}</button>
							</div>
						</form>
					</section>
				</div>
			)}
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Catálogo Antilow / inventario</p><h1 id="inventory-title" className="text-3xl font-black text-white sm:text-4xl">Periféricos listos para tu setup</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Explora equipos disponibles, compara sus características y solicita una compra directamente a nuestro equipo.</p></div><button className="w-fit rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-white/5" type="button" onClick={loadProducts}>Actualizar catálogo</button></div>
			{message && <p className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200" role="status">{message}</p>}
			{error && <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">{error}</p>}
			{!authenticated && !isAdmin && <div className="flex flex-col justify-between gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-4 sm:flex-row sm:items-center"><p className="text-sm text-slate-300">Puedes explorar el catálogo sin cuenta. Para solicitar una compra, inicia sesión o crea tu cuenta de cliente.</p><div className="flex shrink-0 gap-2"><button className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-300" type="button" onClick={onLogin}>Iniciar sesión</button><button className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-300" type="button" onClick={onRegister}>Crear cuenta</button></div></div>}
			{isAdmin && <form className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5" onSubmit={submitProduct}><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Administración de stock</p><h2 className="mt-1 font-bold text-white">{editingId ? 'Editar producto' : 'Añadir periférico'}</h2></div>{editingId && <button className="text-xs text-slate-400 hover:text-white" type="button" onClick={resetForm}>Cancelar</button>}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input className="catalog-input" name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={changeForm} required /><select className="catalog-input" name="categoria" value={form.categoria} onChange={changeForm}><option value="periferico">Periférico</option><option value="audio">Audio</option><option value="gaming">Gaming</option><option value="oficina">Oficina</option></select><input className="catalog-input" name="precio" type="number" min="0" step="0.01" placeholder="Precio" value={form.precio} onChange={changeForm} required /><input className="catalog-input" name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={changeForm} required /><label className="catalog-input cursor-pointer sm:col-span-2"><span className="block text-xs text-slate-400">Imagen desde tu PC</span><input className="mt-2 w-full text-xs text-slate-300" name="imagen" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={changeImage} /></label><input className="catalog-input sm:col-span-2" name="imagen_url" type="url" placeholder="O usa una URL compatible" value={form.imagen_url} onChange={changeForm} /><input className="catalog-input sm:col-span-2 lg:col-span-4" name="caracteristicas" placeholder="Características separadas por comas" value={form.caracteristicas} onChange={changeForm} /><textarea className="catalog-input sm:col-span-2 lg:col-span-4" name="descripcion" placeholder="Descripción del producto" rows="2" value={form.descripcion} onChange={changeForm} /><button className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-300" type="submit" disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Publicar producto'}</button></div></form>}
			{loading ? <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-400">Cargando catálogo...</div> : products.length === 0 ? <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-10 text-center text-slate-400">No hay productos disponibles en este momento.</div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/30" key={product.id}><div className="relative aspect-[4/3] overflow-hidden bg-slate-950">{product.imagen_url ? <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.imagen_url} alt={product.nombre} /> : <div className="grid h-full place-items-center text-5xl text-slate-700">⌘</div>}<span className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">{product.categoria}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold text-white">{product.nombre}</h2><strong className="whitespace-nowrap text-lg text-cyan-300">${Number(product.precio).toLocaleString('es-CO')}</strong></div><p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{product.descripcion || 'Periférico seleccionado por Antilow.'}</p><div className="mt-4 flex flex-wrap gap-2">{(product.caracteristicas || []).map((feature) => <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300" key={feature}>{feature}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4"><span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-300' : 'text-red-300'}`}>{product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</span>{isAdmin ? <div><button className="mr-3 text-xs font-bold text-cyan-300" type="button" onClick={() => startEdit(product)}>Editar</button><button className="text-xs font-bold text-red-300 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={deletingId === product.id} onClick={() => deleteProduct(product)}>{deletingId === product.id ? 'Eliminando...' : 'Eliminar'}</button></div> : <button className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!product.stock} onClick={() => buyProduct(product)}>Solicitar compra</button>}</div></div></article>)}</div>}
		</section>
	)
}

export default Inventario
