import { useState, useEffect } from 'react'
import api from '../services/api'
import './AttendanceHistory.css'

const AttendanceHistory = () => {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', 'week', 'month', 'custom'
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceHistory()
    }
  }, [selectedEmployee, dateFilter, customStartDate, customEndDate])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/employees')
      setEmployees(response.data.employees)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (dateFilter) {
      case 'today':
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - 7)
        return {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        }
      case 'month':
        const monthStart = new Date(today)
        monthStart.setDate(1) // First day of current month
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        }
      case 'custom':
        return {
          startDate: customStartDate,
          endDate: customEndDate,
        }
      default:
        return {
          startDate: null,
          endDate: null,
        }
    }
  }

  const fetchAttendanceHistory = async () => {
    if (!selectedEmployee) return

    try {
      setHistoryLoading(true)
      const { startDate, endDate } = getDateRange()

      let url = `/attendance/user/${selectedEmployee.id}`
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await api.get(url)
      setAttendanceHistory(response.data.attendance || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch attendance history')
      setAttendanceHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return '#27AE60'
      case 'LATE': return '#F39C12'
      case 'ABSENT': return '#E74C3C'
      case 'HALF_DAY': return '#3498DB'
      default: return '#95a5a6'
    }
  }

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A'
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffMs = end - start
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower)
    )
  })

  // Get max date for date inputs (today)
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Get statistics
  const getStatistics = () => {
    const total = attendanceHistory.length
    const present = attendanceHistory.filter((a) => a.status === 'PRESENT').length
    const late = attendanceHistory.filter((a) => a.status === 'LATE').length
    const absent = attendanceHistory.filter((a) => a.status === 'ABSENT').length
    const halfDay = attendanceHistory.filter((a) => a.status === 'HALF_DAY').length

    const recordsWithHours = attendanceHistory.filter(
      (a) => a.checkIn?.time && a.checkOut?.time
    )
    const totalHours = recordsWithHours.reduce((sum, a) => {
      const start = new Date(a.checkIn.time)
      const end = new Date(a.checkOut.time)
      return sum + (end - start) / (1000 * 60 * 60)
    }, 0)
    const avgHours = recordsWithHours.length > 0 ? (totalHours / recordsWithHours.length).toFixed(1) : 0

    return { total, present, late, absent, halfDay, avgHours }
  }

  const stats = getStatistics()

  if (loading) {
    return (
      <div className="attendance-history-container">
        <div className="loading">Loading employees...</div>
      </div>
    )
  }

  return (
    <div className="attendance-history-container">
      <div className="attendance-history-header">
        <div>
          <h1>Attendance History</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
            View detailed attendance history for each employee with filtering options
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="attendance-history-content">
        {/* Employee Selection Sidebar */}
        <div className="employee-sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="employee-list">
            {filteredEmployees.length === 0 ? (
              <div className="empty-state-small">
                <p>No employees found matching "{searchTerm}"</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  className={`employee-item ${selectedEmployee?.id === employee.id ? 'active' : ''}`}
                  onClick={() => handleEmployeeSelect(employee)}
                >
                  <div className="employee-item-info">
                    <strong>{employee.name}</strong>
                    <span className="employee-item-email">{employee.email}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Attendance History Display */}
        <div className="history-content">
          {!selectedEmployee ? (
            <div className="empty-state-large">
              <div className="empty-state-icon">📊</div>
              <h3>Select an Employee</h3>
              <p>Select an employee from the list to view their attendance history</p>
            </div>
          ) : (
            <>
              {/* Employee Info Header */}
              <div className="history-header">
                <div>
                  <h2>{selectedEmployee.name}</h2>
                  <p className="employee-email">{selectedEmployee.email}</p>
                </div>
              </div>

              {/* Date Filter */}
              <div className="filter-container">
                <label>Filter by Date:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateFilter === 'custom' && (
                  <div className="custom-date-range">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      max={getMaxDate()}
                      className="date-input"
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      max={getMaxDate()}
                      min={customStartDate}
                      className="date-input"
                    />
                  </div>
                )}
              </div>

              {/* Statistics Cards */}
              {attendanceHistory.length > 0 && (
                <div className="statistics-cards">
                  <div className="stat-card">
                    <div className="stat-label">Total Records</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Present</div>
                    <div className="stat-value" style={{ color: '#27AE60' }}>{stats.present}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Late</div>
                    <div className="stat-value" style={{ color: '#F39C12' }}>{stats.late}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Absent</div>
                    <div className="stat-value" style={{ color: '#E74C3C' }}>{stats.absent}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Half Day</div>
                    <div className="stat-value" style={{ color: '#3498DB' }}>{stats.halfDay}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Avg Hours/Day</div>
                    <div className="stat-value">{stats.avgHours}h</div>
                  </div>
                </div>
              )}

              {/* Attendance History Table */}
              {historyLoading ? (
                <div className="loading">Loading attendance history...</div>
              ) : attendanceHistory.length === 0 ? (
                <div className="empty-state-large">
                  <div className="empty-state-icon">📅</div>
                  <h3>No Attendance Records</h3>
                  <p>No attendance records found for the selected date range</p>
                </div>
              ) : (
                <div className="history-table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Working Hours</th>
                        <th>IP Address</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((record) => (
                        <tr key={record._id || record.id}>
                          <td>
                            <strong>{formatDate(record.date)}</strong>
                          </td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: `${getStatusColor(record.status)}20`,
                                color: getStatusColor(record.status),
                                border: `1px solid ${getStatusColor(record.status)}40`,
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td>
                            {record.checkIn?.time ? (
                              <div>
                                <div>{formatTime(record.checkIn.time)}</div>
                                <small style={{ color: '#999', fontSize: '0.75rem' }}>
                                  {record.checkIn.ipAddress}
                                </small>
                              </div>
                            ) : (
                              <span style={{ color: '#999' }}>Not checked in</span>
                            )}
                          </td>
                          <td>
                            {record.checkOut?.time ? (
                              <div>
                                <div>{formatTime(record.checkOut.time)}</div>
                                <small style={{ color: '#999', fontSize: '0.75rem' }}>
                                  {record.checkOut.ipAddress}
                                </small>
                              </div>
                            ) : (
                              <span style={{ color: '#999' }}>Not checked out</span>
                            )}
                          </td>
                          <td>
                            {calculateWorkingHours(record.checkIn?.time, record.checkOut?.time)}
                          </td>
                          <td>
                            <small style={{ fontFamily: 'monospace' }}>
                              {record.checkIn?.ipAddress || record.checkOut?.ipAddress || 'N/A'}
                            </small>
                          </td>
                          <td>
                            {record.notes ? (
                              <span title={record.notes} className="notes-cell">
                                {record.notes}
                              </span>
                            ) : (
                              <span style={{ color: '#999' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceHistory

