import { useState } from 'react'
import { registrarse } from '../assets/Servicios/authService.js'

function Register({ onRegister, onLogin, onBack }) {
	const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleChange = ({ target }) => {
		setForm((current) => ({ ...current, [target.name]: target.value }))
		setError('')
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		if (form.password !== form.password_confirmation) {
			setError('Las contrasenas no coinciden')
			return
		}

		setLoading(true)
		setError('')
		try {
			const { name, email, password } = form
			const userData = { name, email, password }
			const session = await registrarse(userData)
			onRegister(session)
		} catch (requestError) {
			const validationErrors = requestError.response?.data?.errors
			const firstValidationError = validationErrors && Object.values(validationErrors)[0]?.[0]
			setError(
				firstValidationError ||
					requestError.response?.data?.message ||
					requestError.message ||
					'No se pudo crear la cuenta',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className="auth-shell flex min-h-screen items-center justify-center px-6 py-12">
			<section className="auth-card w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-black/40">
				<div className="mb-8">
					<button className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-white" type="button" onClick={onBack}>← Volver al dashboard</button>
					<p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Antilow</p>
					<h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
					<p className="mt-2 text-sm text-slate-400">Únete al centro de soporte y gestiona tus equipos.</p>
				</div>

				<form className="space-y-5" onSubmit={handleSubmit}>
					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Nombre completo</span>
						<input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-400/20" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Tu nombre" autoComplete="name" required />
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Correo electronico</span>
						<input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-400/20" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" autoComplete="email" required />
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Contrasena</span>
						<input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-400/20" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimo 8 caracteres" autoComplete="new-password" minLength="8" required />
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Confirmar contrasena</span>
						<input className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-400/20" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Repite tu contrasena" autoComplete="new-password" minLength="8" required />
					</label>

					{error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300" role="alert">{error}</p>}

					<button className="w-full rounded-lg bg-red-500 px-4 py-3 font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
						{loading ? 'Creando cuenta...' : 'Crear cuenta'}
					</button>

					<p className="text-center text-sm text-slate-400">
						¿Ya tienes una cuenta?{' '}
						<button className="font-semibold text-red-400 hover:text-red-300" type="button" onClick={onLogin}>Inicia sesion</button>
					</p>
				</form>
			</section>
		</main>
	)
}

export default Register
