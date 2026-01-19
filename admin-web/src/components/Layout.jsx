import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0)

  useEffect(() => {
    fetchPendingCount()
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingCount = async () => {
    try {
      const response = await api.get('/leaves/pending')
      setPendingLeavesCount(response.data.count || 0)
    } catch (err) {
      // Silently fail - don't show error in sidebar
      setPendingLeavesCount(0)
    }
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>🌿 The Roots Digital</h1>
        </div>
        <div className="navbar-user">
          <span>Welcome, {user?.name || 'Admin'}</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="layout-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link
              to="/dashboard"
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              Dashboard
            </Link>
            <Link
              to="/employees"
              className={location.pathname === '/employees' ? 'active' : ''}
            >
              Employees
            </Link>
            <Link
              to="/attendance-history"
              className={location.pathname === '/attendance-history' ? 'active' : ''}
            >
              Attendance History
            </Link>
            <Link
              to="/ip-configuration"
              className={location.pathname === '/ip-configuration' ? 'active' : ''}
            >
              IP Configuration
            </Link>
            <Link
              to="/leave-management"
              className={location.pathname === '/leave-management' ? 'active' : ''}
            >
              Leave Management
              {pendingLeavesCount > 0 && (
                <span className="sidebar-badge">{pendingLeavesCount}</span>
              )}
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

