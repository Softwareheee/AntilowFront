import { useState } from 'react'
import { iniciarSesion } from '../assets/Servicios/authService.js'

function Login({ onLogin, onRegister, onBack }) {
	const [credentials, setCredentials] = useState({ email: '', password: '' })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleChange = ({ target }) => {
		setCredentials((current) => ({ ...current, [target.name]: target.value }))
		setError('')
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setLoading(true)
		setError('')

		try {
			const session = await iniciarSesion(credentials)
			onLogin(session)
		} catch (requestError) {
			setError(
				requestError.response?.data?.message ||
					requestError.message ||
					'No se pudo iniciar sesion',
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
					<p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
						Antilow
					</p>
					<h1 className="text-3xl font-bold text-white">Iniciar sesion</h1>
					<p className="mt-2 text-sm text-slate-400">Accede a tu centro de soporte y operaciones.</p>
				</div>

				<form className="space-y-5" onSubmit={handleSubmit}>
					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Correo electronico</span>
						<input
							className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
							name="email"
							type="email"
							value={credentials.email}
							onChange={handleChange}
							placeholder="tu@correo.com"
							autoComplete="email"
							required
						/>
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-200">Contrasena</span>
						<input
							className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
							name="password"
							type="password"
							value={credentials.password}
							onChange={handleChange}
							placeholder="••••••••"
							autoComplete="current-password"
							required
						/>
					</label>

					{error && (
						<p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300" role="alert">
							{error}
						</p>
					)}

					<button
						className="w-full rounded-lg bg-red-500 px-4 py-3 font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
						type="submit"
						disabled={loading}
					>
						{loading ? 'Validando...' : 'Entrar'}
					</button>

					<p className="text-center text-sm text-slate-400">
						¿Aun no tienes una cuenta?{' '}
						<button className="font-semibold text-red-400 hover:text-red-300" type="button" onClick={onRegister}>
							Registrate
						</button>
					</p>
				</form>
			</section>
		</main>
	)
}

export default Login
