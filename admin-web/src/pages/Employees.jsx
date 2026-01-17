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

  useEffect(() => {
    fetchEmployees()
  }, [])

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
        <h1>Employee Management</h1>
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
                <th>Role</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>
                    <span className="badge badge-employee">{employee.role}</span>
                  </td>
                  <td>{new Date(employee.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
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
    </div>
  )
}

export default Employees

