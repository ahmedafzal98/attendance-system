import { useState, useEffect } from 'react'
import api from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
  const [whoIsInOffice, setWhoIsInOffice] = useState([])
  const [todaySummary, setTodaySummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds if enabled
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData()
      }, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch both who is in office and today's summary
      const [inOfficeResponse, summaryResponse] = await Promise.all([
        api.get('/dashboard/who-is-in-office'),
        api.get('/dashboard/today-summary'),
      ])

      setWhoIsInOffice(inOfficeResponse.data.employees)
      setTodaySummary(summaryResponse.data)
      setError('')
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateWorkingHours = (checkInTime) => {
    if (!checkInTime) return '0h 0m'
    const checkIn = new Date(checkInTime)
    const now = new Date()
    const diffMs = now - checkIn
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (loading && !todaySummary) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Live Dashboard</h1>
          <p className="dashboard-subtitle">Real-time attendance overview</p>
        </div>
        <div className="dashboard-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button className="btn-refresh" onClick={fetchDashboardData}>
            🔄 Refresh
          </button>
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Today's Summary Cards */}
      {todaySummary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card-icon">👥</div>
            <div className="summary-card-content">
              <h3>{todaySummary.summary.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
          </div>

          <div className="summary-card success">
            <div className="summary-card-icon">✓</div>
            <div className="summary-card-content">
              <h3>{todaySummary.summary.checkedIn}</h3>
              <p>Checked In</p>
            </div>
          </div>

          <div className="summary-card info">
            <div className="summary-card-icon">🏢</div>
            <div className="summary-card-content">
              <h3>{todaySummary.summary.inOffice}</h3>
              <p>Currently In Office</p>
            </div>
          </div>

          <div className="summary-card warning">
            <div className="summary-card-icon">⏰</div>
            <div className="summary-card-content">
              <h3>{todaySummary.summary.late}</h3>
              <p>Late Today</p>
            </div>
          </div>

          <div className="summary-card danger">
            <div className="summary-card-icon">✗</div>
            <div className="summary-card-content">
              <h3>{todaySummary.summary.absent}</h3>
              <p>Absent</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-icon">🚪</div>
            <div className="summary-card-content">
              <h3>{todaySummary.summary.checkedOut}</h3>
              <p>Checked Out</p>
            </div>
          </div>
        </div>
      )}

      {/* Who is in Office Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Who is in the Office Right Now?</h2>
          <span className="badge badge-count">{whoIsInOffice.length}</span>
        </div>

        {whoIsInOffice.length === 0 ? (
          <div className="empty-state">
            <p>No one is currently in the office.</p>
          </div>
        ) : (
          <div className="in-office-grid">
            {whoIsInOffice.map((employee) => (
              <div key={employee.id} className="employee-card">
                <div className="employee-avatar">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="employee-info">
                  <h3>{employee.name}</h3>
                  <p className="employee-email">{employee.email}</p>
                  <div className="employee-details">
                    <div className="detail-row">
                      <span className="detail-label">Checked in:</span>
                      <span className="detail-value">
                        {formatTime(employee.checkInTime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Working:</span>
                      <span className="detail-value">
                        {calculateWorkingHours(employee.checkInTime)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${employee.status.toLowerCase()}`}>
                        {employee.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
