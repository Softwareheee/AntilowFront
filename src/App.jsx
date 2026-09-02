import { useEffect, useState } from 'react'
import api from './api/api'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { cerrarSesion } from './assets/Servicios/authService.js'

function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('token')))
  const [authView, setAuthView] = useState('login')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authenticated) return

    const loadData = async () => {
      try {
        const response = await api.get('/clientes')
        const payload = response?.data
        setData(Array.isArray(payload) ? payload : payload?.data || payload || [])
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Network Error')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [authenticated])

  if (!authenticated) {
    return authView === 'login' ? (
      <Login onLogin={() => setAuthenticated(true)} onRegister={() => setAuthView('register')} />
    ) : (
      <Register onRegister={() => setAuthenticated(true)} onLogin={() => setAuthView('login')} />
    )
  }

  const handleLogout = () => {
    cerrarSesion()
    setAuthenticated(false)
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Antilow</p>
            <h1 className="mt-1 text-3xl font-bold">Clientes</h1>
          </div>
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>

      {loading && <p className="text-slate-500">Cargando datos...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <ul className="space-y-3">
          {data.length > 0 ? (
            data.map((item) => (
              <li className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm" key={item.id ?? item.email ?? item.name}>
                {item.name || item.email || JSON.stringify(item)}
              </li>
            ))
          ) : (
            <li>No hay datos disponibles.</li>
          )}
        </ul>
      )}
      </div>
    </main>
  )
}

export default App
