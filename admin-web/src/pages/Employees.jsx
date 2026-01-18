import { useState, useEffect } from 'react'
import api from '../services/api'
import './Employees.css'

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')
  const [todayAttendance, setTodayAttendance] = useState({})
  const [processingAttendance, setProcessingAttendance] = useState({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [passwordFormData, setPasswordFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [editFormError, setEditFormError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/employees')
      setEmployees(response.data.employees)
      setError('')
      // Fetch today's attendance for all employees
      await fetchTodayAttendanceForAll(response.data.employees)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayAttendanceForAll = async (employeeList) => {
    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`
    
    const attendanceMap = {}
    
    try {
      await Promise.all(
        employeeList.map(async (employee) => {
          try {
            const response = await api.get(
              `/attendance/user/${employee.id}?startDate=${todayStr}&endDate=${todayStr}`
            )
            if (response.data && response.data.attendance && response.data.attendance.length > 0) {
              // Find the attendance record for today
              const todayAttendance = response.data.attendance.find(att => {
                const attDate = new Date(att.date)
                const todayDate = new Date(todayStr)
                return (
                  attDate.getFullYear() === todayDate.getFullYear() &&
                  attDate.getMonth() === todayDate.getMonth() &&
                  attDate.getDate() === todayDate.getDate()
                )
              })
              if (todayAttendance) {
                attendanceMap[employee.id] = todayAttendance
              }
            }
          } catch (err) {
            // Ignore errors for individual employee attendance
            console.log(`No attendance record for ${employee.name}:`, err.response?.data?.error || err.message)
          }
        })
      )
      setTodayAttendance(attendanceMap)
    } catch (err) {
      console.error('Error fetching attendance:', err)
    }
  }

  const handleManualCheckIn = async (employeeId, employeeName) => {
    if (!window.confirm(`Manually check in ${employeeName}? This will bypass IP validation.`)) {
      return
    }

    setProcessingAttendance({ ...processingAttendance, [`checkin_${employeeId}`]: true })
    try {
      const response = await api.post(`/attendance/admin/checkin/${employeeId}`)
      alert(`✓ ${employeeName} checked in successfully!`)
      // Refresh employees list and attendance data
      await fetchEmployees()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to check in employee')
    } finally {
      setProcessingAttendance({ ...processingAttendance, [`checkin_${employeeId}`]: false })
    }
  }

  const handleManualCheckOut = async (employeeId, employeeName) => {
    if (!window.confirm(`Manually check out ${employeeName}? This will bypass IP validation.`)) {
      return
    }

    setProcessingAttendance({ ...processingAttendance, [`checkout_${employeeId}`]: true })
    try {
      const response = await api.post(`/attendance/admin/checkout/${employeeId}`)
      alert(`✓ ${employeeName} checked out successfully!`)
      // Refresh employees list and attendance data
      await fetchEmployees()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to check out employee')
    } finally {
      setProcessingAttendance({ ...processingAttendance, [`checkout_${employeeId}`]: false })
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getAttendanceStatus = (employeeId) => {
    const attendance = todayAttendance[employeeId]
    if (!attendance) return { status: 'ABSENT', color: '#E74C3C', label: 'Not checked in' }
    const status = attendance.status
    const statusMap = {
      PRESENT: { color: '#27AE60', label: 'Present' },
      LATE: { color: '#F39C12', label: 'Late' },
      ABSENT: { color: '#E74C3C', label: 'Absent' },
      HALF_DAY: { color: '#3498DB', label: 'Half Day' },
    }
    return statusMap[status] || { color: '#95a5a6', label: status }
  }

  const canCheckIn = (employeeId) => {
    const attendance = todayAttendance[employeeId]
    return !attendance || !attendance.checkIn?.time
  }

  const canCheckOut = (employeeId) => {
    const attendance = todayAttendance[employeeId]
    return attendance && attendance.checkIn?.time && !attendance.checkOut?.time
  }

  const handleResetPasswordClick = (employee) => {
    setSelectedEmployee(employee)
    setPasswordFormData({ newPassword: '', confirmPassword: '' })
    setPasswordError('')
    setPasswordResetSuccess(null)
    setShowPasswordModal(true)
  }

  const handlePasswordInputChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value,
    })
    setPasswordError('')
    setPasswordResetSuccess(null)
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')

    // Validation
    if (!passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      setPasswordError('Both password fields are required')
      return
    }

    if (passwordFormData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      const response = await api.post(
        `/users/employees/${selectedEmployee.id}/reset-password`,
        { newPassword: passwordFormData.newPassword }
      )
      setPasswordResetSuccess(response.data)
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to reset password')
    }
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setSelectedEmployee(null)
    setPasswordFormData({ newPassword: '', confirmPassword: '' })
    setPasswordError('')
    setPasswordResetSuccess(null)
  }

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee)
    setEditFormData({
      name: employee.name,
      email: employee.email,
      password: '', // Don't pre-fill password
    })
    setEditFormError('')
    setShowEditModal(true)
  }

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    })
    setEditFormError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditFormError('')

    // Validation
    if (!editFormData.name || !editFormData.email) {
      setEditFormError('Name and email are required')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editFormData.email)) {
      setEditFormError('Invalid email format')
      return
    }

    // Password validation if provided
    if (editFormData.password && editFormData.password.length < 6) {
      setEditFormError('Password must be at least 6 characters long (leave empty to keep current password)')
      return
    }

    try {
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
      }
      
      // Only include password if provided
      if (editFormData.password) {
        updateData.password = editFormData.password
      }

      await api.put(`/users/employees/${selectedEmployee.id}`, updateData)
      setShowEditModal(false)
      setSelectedEmployee(null)
      setEditFormData({ name: '', email: '', password: '' })
      fetchEmployees()
    } catch (err) {
      setEditFormError(err.response?.data?.error || 'Failed to update employee')
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedEmployee(null)
    setEditFormData({ name: '', email: '', password: '' })
    setEditFormError('')
  }

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return

    try {
      await api.delete(`/users/employees/${employeeToDelete.id}`)
      setShowDeleteModal(false)
      setEmployeeToDelete(null)
      fetchEmployees()
      alert(`Employee ${employeeToDelete.name} deleted successfully!`)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete employee')
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setEmployeeToDelete(null)
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
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('All fields are required')
      return
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long')
      return
    }

    try {
      await api.post('/users/employees', formData)
      setShowModal(false)
      setFormData({ name: '', email: '', password: '' })
      fetchEmployees()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create employee')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({ name: '', email: '', password: '' })
    setFormError('')
  }

  if (loading) {
    return (
      <div className="employees-container">
        <div className="loading">Loading employees...</div>
      </div>
    )
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div>
        <h1>Employee Management</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
            Manage employee attendance manually when they have issues with the mobile app
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {employees.length === 0 ? (
        <div className="empty-state">
          <p>No employees found. Create your first employee account.</p>
        </div>
      ) : (
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Today's Status</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Manual Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const statusInfo = getAttendanceStatus(employee.id)
                const attendance = todayAttendance[employee.id]
                return (
                <tr key={employee.id}>
                    <td>
                      <strong>{employee.name}</strong>
                    </td>
                  <td>{employee.email}</td>
                  <td>
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: `${statusInfo.color}20`, 
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}40`
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      {attendance?.checkIn?.time ? (
                        <span style={{ color: '#27AE60', fontWeight: '600' }}>
                          ✓ {formatTime(attendance.checkIn.time)}
                        </span>
                      ) : (
                        <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>Not checked in</span>
                      )}
                    </td>
                    <td>
                      {attendance?.checkOut?.time ? (
                        <span style={{ color: '#E74C3C', fontWeight: '600' }}>
                          ✓ {formatTime(attendance.checkOut.time)}
                        </span>
                      ) : attendance?.checkIn?.time ? (
                        <span style={{ color: '#F39C12', fontStyle: 'italic' }}>Still at work</span>
                      ) : (
                        <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {canCheckIn(employee.id) ? (
                          <button
                            className="btn-action btn-checkin"
                            onClick={() => handleManualCheckIn(employee.id, employee.name)}
                            disabled={processingAttendance[`checkin_${employee.id}`]}
                            title="Manually check in employee (for slow internet/app issues)"
                          >
                            {processingAttendance[`checkin_${employee.id}`] ? (
                              <>⏳ Processing...</>
                            ) : (
                              <>✓ Check In</>
                            )}
                          </button>
                        ) : canCheckOut(employee.id) ? (
                          <button
                            className="btn-action btn-checkout"
                            onClick={() => handleManualCheckOut(employee.id, employee.name)}
                            disabled={processingAttendance[`checkout_${employee.id}`]}
                            title="Manually check out employee (for slow internet/app issues)"
                          >
                            {processingAttendance[`checkout_${employee.id}`] ? (
                              <>⏳ Processing...</>
                            ) : (
                              <>✓ Check Out</>
                            )}
                          </button>
                        ) : (
                          <span style={{ color: '#27AE60', fontSize: '0.875rem' }}>
                            ✓ Complete
                          </span>
                        )}
                        <button
                          className="btn-action btn-password"
                          onClick={() => handleResetPasswordClick(employee)}
                          title="Reset employee password"
                        >
                          🔑 Reset Password
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditClick(employee)}
                          title="Edit employee details"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteClick(employee)}
                          title="Delete employee"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Employee</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            {formError && <div className="error-message">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Employee Name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="employee@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedEmployee && (
        <div className="modal-overlay" onClick={handleClosePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password for {selectedEmployee.name}</h2>
              <button className="modal-close" onClick={handleClosePasswordModal}>
                ×
              </button>
            </div>

            {passwordResetSuccess ? (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ 
                  backgroundColor: '#27AE60', 
                  color: 'white', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1rem' 
                }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    ✓ Password reset successfully!
                  </p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                    New Password: <strong style={{ fontFamily: 'monospace' }}>{passwordResetSuccess.newPassword}</strong>
                  </p>
                </div>
                <div style={{ 
                  backgroundColor: '#E8F8F5', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1rem',
                  border: '1px solid #27AE60'
                }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#2C3E50' }}>
                    <strong>Employee Details:</strong>
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#34495E' }}>
                    Name: {passwordResetSuccess.name}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#34495E' }}>
                    Email: {passwordResetSuccess.email}
                  </p>
                </div>
                <div style={{ 
                  backgroundColor: '#FFF3CD', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1rem',
                  border: '1px solid #FFC107'
                }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
                    ⚠️ Please share this password with the employee. They should change it after logging in for security.
                  </p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-primary" onClick={handleClosePasswordModal}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} style={{ padding: '1.5rem' }}>
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

                {passwordError && <div className="error-message">{passwordError}</div>}

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                    placeholder="Enter new password (min. 6 characters)"
                    minLength={6}
                  />
                  <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Example: 123456
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleClosePasswordModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Employee - {selectedEmployee.name}</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            {editFormError && <div className="error-message">{editFormError}</div>}

            <form onSubmit={handleEditSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="edit-name">Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Employee Name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-email">Email</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                  placeholder="employee@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-password">Password (Optional)</label>
                <input
                  type="password"
                  id="edit-password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditInputChange}
                  placeholder="Leave empty to keep current password"
                />
                <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Leave empty to keep current password. Minimum 6 characters if provided.
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && employeeToDelete && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Delete Employee</h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>
                ×
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                backgroundColor: '#FFEBEE', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1rem',
                border: '1px solid #E74C3C'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#C0392B', fontWeight: '600' }}>
                  ⚠️ Warning: This action cannot be undone!
                </p>
              </div>

              <p style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Are you sure you want to delete employee <strong>{employeeToDelete.name}</strong>?
              </p>

              <div style={{ 
                backgroundColor: '#E3F2FD', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1rem',
                border: '1px solid #2196F3'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#1565C0' }}>
                  <strong>Email:</strong> {employeeToDelete.email}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#1565C0' }}>
                  <strong>Role:</strong> {employeeToDelete.role}
                </p>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                This will permanently delete the employee account and all associated data.
              </p>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseDeleteModal}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-delete-confirm"
                  onClick={handleDeleteConfirm}
                >
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees

