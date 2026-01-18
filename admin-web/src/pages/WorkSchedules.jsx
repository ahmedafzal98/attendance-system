import { useState, useEffect } from 'react'
import api from '../services/api'
import './WorkSchedules.css'

const WorkSchedules = () => {
  const [employees, setEmployees] = useState([])
  const [schedules, setSchedules] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [formData, setFormData] = useState({
    checkInTime: '09:00',
    checkOutTime: '18:00',
    gracePeriod: 30,
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [employeesRes, schedulesRes] = await Promise.all([
        api.get('/users/employees'),
        api.get('/work-schedules'),
      ])
      setEmployees(employeesRes.data.employees)
      
      // Create a map of schedules by userId
      const scheduleMap = {}
      schedulesRes.data.schedules.forEach(schedule => {
        scheduleMap[schedule.user.id] = schedule
      })
      setSchedules(scheduleMap)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSchedule = (employee) => {
    const existingSchedule = schedules[employee.id]
    setSelectedEmployee(employee)
    if (existingSchedule) {
      setFormData({
        checkInTime: existingSchedule.checkInTime,
        checkOutTime: existingSchedule.checkOutTime,
        gracePeriod: existingSchedule.gracePeriod,
      })
    } else {
      setFormData({
        checkInTime: '09:00',
        checkOutTime: '18:00',
        gracePeriod: 30,
      })
    }
    setFormError('')
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validation
    if (!formData.checkInTime || !formData.checkOutTime) {
      setFormError('Check-in time and check-out time are required')
      return
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(formData.checkInTime) || !timeRegex.test(formData.checkOutTime)) {
      setFormError('Invalid time format. Use HH:MM format (e.g., 09:00, 18:00)')
      return
    }

    // Validate grace period
    const gracePeriod = parseInt(formData.gracePeriod)
    if (isNaN(gracePeriod) || gracePeriod < 0 || gracePeriod > 120) {
      setFormError('Grace period must be between 0 and 120 minutes')
      return
    }

    try {
      await api.post(`/work-schedules/${selectedEmployee.id}`, formData)
      setShowModal(false)
      setSelectedEmployee(null)
      fetchData()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save work schedule')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEmployee(null)
    setFormData({
      checkInTime: '09:00',
      checkOutTime: '18:00',
      gracePeriod: 30,
    })
    setFormError('')
  }

  const getScheduleDisplay = (employeeId) => {
    const schedule = schedules[employeeId]
    if (!schedule) {
      return { checkIn: '09:00 (Default)', checkOut: '18:00 (Default)', grace: '30 min (Default)' }
    }
    return {
      checkIn: schedule.checkInTime,
      checkOut: schedule.checkOutTime,
      grace: `${schedule.gracePeriod} min`,
    }
  }

  if (loading) {
    return (
      <div className="work-schedules-container">
        <div className="loading">Loading work schedules...</div>
      </div>
    )
  }

  return (
    <div className="work-schedules-container">
      <div className="work-schedules-header">
        <div>
          <h1>Work Schedule Management</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
            Set custom work hours and grace period for each employee. Late is considered after (Check-in Time + Grace Period).
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {employees.length === 0 ? (
        <div className="empty-state">
          <p>No employees found. Create employees first.</p>
        </div>
      ) : (
        <div className="schedules-table-container">
          <table className="schedules-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Grace Period</th>
                <th>Late After</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const scheduleDisplay = getScheduleDisplay(employee.id)
                // Extract time from display (handle "09:00 (Default)" format)
                const checkInTimeStr = scheduleDisplay.checkIn.split(' ')[0]
                const [checkInHour, checkInMin] = checkInTimeStr.split(':').map(Number)
                const graceMinutes = parseInt(scheduleDisplay.grace.replace(' min', '').replace(' (Default)', ''))
                
                // Calculate late after time
                const lateAfter = new Date()
                lateAfter.setHours(checkInHour, checkInMin + graceMinutes, 0, 0)
                const lateAfterTime = lateAfter.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: false 
                })
                
                return (
                  <tr key={employee.id}>
                    <td><strong>{employee.name}</strong></td>
                    <td>{employee.email}</td>
                    <td>
                      <span className="time-badge">{scheduleDisplay.checkIn}</span>
                    </td>
                    <td>
                      <span className="time-badge">{scheduleDisplay.checkOut}</span>
                    </td>
                    <td>
                      <span className="grace-badge">{scheduleDisplay.grace}</span>
                    </td>
                    <td>
                      <span className="late-badge">{lateAfterTime}</span>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditSchedule(employee)}
                        title="Edit work schedule"
                      >
                        ✏️ Edit Schedule
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedEmployee && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Work Schedule - {selectedEmployee.name}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            {formError && <div className="error-message">{formError}</div>}

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ 
                backgroundColor: '#E3F2FD', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1rem',
                border: '1px solid #2196F3'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#1565C0' }}>
                  <strong>Employee:</strong> {selectedEmployee.name} ({selectedEmployee.email})
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="checkInTime">Check-In Time</label>
                <input
                  type="time"
                  id="checkInTime"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  required
                />
                <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Expected check-in time (e.g., 09:00 for 9 AM)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="checkOutTime">Check-Out Time</label>
                <input
                  type="time"
                  id="checkOutTime"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  required
                />
                <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Expected check-out time (e.g., 18:00 for 6 PM)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="gracePeriod">Grace Period (minutes)</label>
                <input
                  type="number"
                  id="gracePeriod"
                  name="gracePeriod"
                  value={formData.gracePeriod}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="120"
                  placeholder="30"
                />
                <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Late is considered after (Check-in Time + Grace Period). Example: If check-in is 09:00 and grace is 30 min, late is after 09:30.
                </small>
              </div>

              <div style={{ 
                backgroundColor: '#FFF3CD', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1rem',
                border: '1px solid #FFC107'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
                  <strong>Example:</strong> If check-in is <strong>09:00</strong> and grace period is <strong>30 minutes</strong>, 
                  employees will be marked as "LATE" if they check in after <strong>09:30</strong>.
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkSchedules

