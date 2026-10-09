import { useEffect, useRef, useState } from 'react'
import swaggerBundleUrl from 'swagger-ui-dist/swagger-ui-bundle.js?url'
import swaggerCssUrl from 'swagger-ui-dist/swagger-ui.css?url'
import logoUrl from '../assets/Logo_SinFondo.png'

/** Destinos de la especificación y de las operaciones interactivas de Swagger. */
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const openApiUrl = new URL('/api/openapi.json', apiBaseUrl).toString()

/** Monta Swagger UI solo en /api-docs y carga el contrato OpenAPI del backend. */
function ApiDocumentation() {
	const mountRef = useRef(null)
	const [error, setError] = useState('')

	// Los recursos de Swagger se cargan bajo demanda y se retiran al salir de la ruta.
	useEffect(() => {
		let cancelled = false
		const mountNode = mountRef.current
		const style = document.createElement('link')
		style.rel = 'stylesheet'
		style.href = swaggerCssUrl
		document.head.append(style)

		const script = document.createElement('script')
		script.src = swaggerBundleUrl
		script.async = true
		script.onload = async () => {
			try {
				const response = await fetch(openApiUrl)
				if (!response.ok) throw new Error(`La especificación respondió HTTP ${response.status}.`)
				const spec = await response.json()
				if (cancelled || !mountNode) return

				spec.servers = [{ url: apiBaseUrl, description: 'API configurada para este entorno' }]
				window.SwaggerUIBundle({
					spec,
					domNode: mountNode,
					deepLinking: true,
					displayRequestDuration: true,
					filter: true,
					persistAuthorization: false,
					tryItOutEnabled: true,
					presets: [window.SwaggerUIBundle.presets.apis],
					layout: 'BaseLayout',
				})
			} catch (loadError) {
				if (!cancelled) setError(loadError.message || 'No se pudo cargar la documentación de la API.')
			}
		}
		script.onerror = () => {
			if (!cancelled) setError('No se pudo cargar Swagger UI. Revisa que los archivos del frontend estén disponibles.')
		}
		document.body.append(script)

		return () => {
			cancelled = true
			style.remove()
			script.remove()
			if (mountNode) mountNode.replaceChildren()
		}
	}, [])

	return (
		<main className="api-docs-shell min-h-screen text-slate-100">
			<header className="border-b border-white/10 bg-slate-950/90 px-5 py-5 backdrop-blur-xl sm:px-8">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
					<div className="flex items-center gap-3"><img className="h-12 w-12 object-contain" src={logoUrl} alt="Logotipo de Antilow" /><div><p className="text-sm font-black uppercase tracking-[0.22em] text-white">Antilow API</p><p className="mt-1 text-xs text-slate-400">Documentación interactiva · OpenAPI 3</p></div></div>
					<a className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-300 hover:text-white" href="/">Volver a Antilow</a>
				</div>
			</header>
			<section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
				{error ? <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-5 text-sm text-red-200" role="alert"><h1 className="font-bold">No se pudo abrir la documentación</h1><p className="mt-2">{error}</p><p className="mt-2 text-red-100/70">Verifica que Laravel esté activo y que VITE_API_URL apunte al backend.</p></div> : <div ref={mountRef} className="swagger-ui-host" aria-label="Documentación Swagger de Antilow API" />}
			</section>
		</main>
	)
}

export default ApiDocumentation