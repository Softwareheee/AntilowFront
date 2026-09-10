import { useEffect, useState } from 'react'
import api from './api/api.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './Componentes/Dashboard.jsx'
import { cerrarSesion } from './assets/Servicios/authService.js'

function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('token')))
  const [authView, setAuthView] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))

  useEffect(() => {
    if (!authenticated) return

    const loadCurrentUser = async () => {
      try {
        const { data } = await api.get('/user')
        setCurrentUser(data)
        localStorage.setItem('user', JSON.stringify(data))
      } catch {
        cerrarSesion()
        setAuthenticated(false)
        setAuthView('dashboard')
      }
    }

    loadCurrentUser()
  }, [authenticated])

  const handleLogout = () => {
    cerrarSesion()
    setAuthenticated(false)
    setCurrentUser({})
    setAuthView('dashboard')
  }

  if (!authenticated) {
    if (authView === 'dashboard') {
      return <Dashboard onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />
    }

    return authView === 'login' ? (
      <Login onLogin={(session) => { setCurrentUser(session.user); setAuthenticated(true) }} onRegister={() => setAuthView('register')} onBack={() => setAuthView('dashboard')} />
    ) : (
      <Register onRegister={(session) => { setCurrentUser(session.user); setAuthenticated(true) }} onLogin={() => setAuthView('login')} onBack={() => setAuthView('dashboard')} />
    )
  }

  return <Dashboard authenticated isAdmin={currentUser.role === 'admin'} onLogout={handleLogout} />
}

export default App
