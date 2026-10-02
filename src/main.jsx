import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logoUrl from './assets/Logo_SinFondo.png'

const favicon = document.querySelector('link[rel="icon"]')
if (favicon) favicon.href = logoUrl

createRoot(document.getElementById('root')).render(<App />)
