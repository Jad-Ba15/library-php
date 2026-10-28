// =========================================
// Sidebar + top bar. The page is shown in <Outlet />.
// =========================================
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

const links = [
  { to: '/',           label: 'Dashboard',  icon: '📊' },
  { to: '/books',      label: 'Books',      icon: '📚' },
  { to: '/members',    label: 'Members',    icon: '👥' },
  { to: '/loans',      label: 'Loans',      icon: '🔄' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">📖 Library<span>Pro</span></div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              onClick={() => setMenuOpen(false)}>
              <span className="nav-icon">{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <div className="user">
            <div>
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
            <button className="btn ghost small" onClick={logout}>Log out</button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
