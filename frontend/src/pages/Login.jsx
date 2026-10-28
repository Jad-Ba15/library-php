import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('admin@library.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already logged in -> go to the dashboard
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand big">📖 Library<span>Pro</span></div>
        <p className="muted">Sign in to manage the library</p>

        {error && <div className="alert error">{error}</div>}

        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
        </label>

        <button className="btn full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

        <p className="hint">
          Demo: <b>admin@library.com</b> or <b>librarian@library.com</b> · password <b>admin123</b>
        </p>
      </form>
    </div>
  )
}
