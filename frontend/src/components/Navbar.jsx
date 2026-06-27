import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleBadgeColor = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    agent: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    customer: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  const navLinks = [
    { to: '/', label: 'Tickets' },
    { to: '/analytics', label: 'Dashboard' },
  ]

  return (
    <nav className="border-b border-surface-border bg-surface-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-600/30">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-white">PulseDesk</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === to
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-surface-input/50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className={`badge border ${roleBadgeColor[user.role] || roleBadgeColor.customer}`}>
                  {user.role}
                </span>
                <span className="text-sm text-gray-400 hidden sm:block">{user.name}</span>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-200 transition-colors px-2 py-1"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
