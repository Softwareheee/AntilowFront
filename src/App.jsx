import { useState } from 'react'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './Componentes/Dashboard.jsx'
import { cerrarSesion } from './assets/Servicios/authService.js'

function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('token')))
  const [authView, setAuthView] = useState('dashboard')

  const handleLogout = () => {
    cerrarSesion()
    setAuthenticated(false)
    setAuthView('dashboard')
  }

  if (!authenticated) {
    if (authView === 'dashboard') {
      return <Dashboard onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />
    }

    return authView === 'login' ? (
      <Login onLogin={() => setAuthenticated(true)} onRegister={() => setAuthView('register')} onBack={() => setAuthView('dashboard')} />
    ) : (
      <Register onRegister={() => setAuthenticated(true)} onLogin={() => setAuthView('login')} onBack={() => setAuthView('dashboard')} />
    )
  }

  return <Dashboard authenticated onLogout={handleLogout} />
}

export default App
