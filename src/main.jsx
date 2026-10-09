import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logoUrl from './assets/Logo_SinFondo.png'

// Mantiene visible el logotipo propio también en la pestaña del navegador.
const favicon = document.querySelector('link[rel="icon"]')
if (favicon) favicon.href = logoUrl

const root = createRoot(document.getElementById('root'))
const isDocumentationPage = window.location.pathname.replace(/\/+$/, '') === '/api-docs'

// Carga Swagger de forma diferida para no sumar su bundle a la navegación habitual.
if (isDocumentationPage) {
	import('./pages/ApiDocumentation.jsx').then(({ default: ApiDocumentation }) => {
		root.render(<ApiDocumentation />)
	})
} else {
	root.render(<App />)
}
