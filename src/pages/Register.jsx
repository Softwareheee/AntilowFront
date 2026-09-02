import { useState } from 'react'
import { registrarse } from '../assets/Servicios/authService.js'

function Register({ onRegister, onLogin }) {
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
		<main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
			<section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
				<div className="mb-8">
					<p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Antilow</p>
					<h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
					<p className="mt-2 text-sm text-slate-400">Registrate para acceder a tu panel.</p>
				</div>

				<form className="space-y-5" onSubmit={handleSubmit}>
					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Nombre completo</span>
						<input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Tu nombre" autoComplete="name" required />
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Correo electronico</span>
						<input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" autoComplete="email" required />
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Contrasena</span>
						<input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimo 8 caracteres" autoComplete="new-password" minLength="8" required />
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Confirmar contrasena</span>
						<input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Repite tu contrasena" autoComplete="new-password" minLength="8" required />
					</label>

					{error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300" role="alert">{error}</p>}

					<button className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
						{loading ? 'Creando cuenta...' : 'Crear cuenta'}
					</button>

					<p className="text-center text-sm text-slate-400">
						¿Ya tienes una cuenta?{' '}
						<button className="font-semibold text-cyan-400 hover:text-cyan-300" type="button" onClick={onLogin}>Inicia sesion</button>
					</p>
				</form>
			</section>
		</main>
	)
}

export default Register
