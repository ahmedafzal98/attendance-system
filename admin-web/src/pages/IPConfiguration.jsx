import { useState, useEffect } from 'react'
import api from '../services/api'
import { AlertModal, ConfirmModal } from '../components/Modal'
import './IPConfiguration.css'

const IPConfiguration = () => {
  const [ipConfigs, setIpConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    subnet: '',
    description: '',
    isActive: true,
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingConfig, setDeletingConfig] = useState(null)
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null })

  useEffect(() => {
    fetchIPConfigs()
  }, [])

  const fetchIPConfigs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/ip-config')
      setIpConfigs(response.data.ipConfigs)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch IP configurations')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validation
    if (!formData.name || !formData.ipAddress) {
      setFormError('Name and IP Address are required')
      return
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(formData.ipAddress)) {
      setFormError('Invalid IP address format')
      return
    }

    setSubmitting(true)
    try {
      if (editingConfig) {
        await api.put(`/ip-config/${editingConfig.id}`, formData)
        setAlertModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'IP configuration updated successfully!',
        })
      } else {
        await api.post('/ip-config', formData)
        setAlertModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'IP configuration created successfully!',
        })
      }
      setShowModal(false)
      resetForm()
      await fetchIPConfigs()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save IP configuration')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (config) => {
    setEditingConfig(config)
    setFormData({
      name: config.name,
      ipAddress: config.ipAddress,
      subnet: config.subnet || '',
      description: config.description || '',
      isActive: config.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = (config) => {
    setDeletingConfig(config)
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete IP Configuration',
      message: `Are you sure you want to delete "${config.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false })
        try {
          await api.delete(`/ip-config/${config.id}`)
          setAlertModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'IP configuration deleted successfully!',
          })
          await fetchIPConfigs()
        } catch (err) {
          setAlertModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: err.response?.data?.error || 'Failed to delete IP configuration',
          })
        } finally {
          setDeletingConfig(null)
        }
      },
    })
  }

  const handleToggleActive = async (config) => {
    try {
      await api.put(`/ip-config/${config.id}`, {
        isActive: !config.isActive,
      })
      fetchIPConfigs()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update IP configuration')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      ipAddress: '',
      subnet: '',
      description: '',
      isActive: true,
    })
    setEditingConfig(null)
    setFormError('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="ip-config-container">
        <div className="loading">Loading IP configurations...</div>
      </div>
    )
  }

  return (
    <div className="ip-config-container">
      <div className="ip-config-header">
        <div>
          <h1>Office IP Configuration</h1>
          <p className="subtitle">
            Configure office IP addresses to enable check-in/check-out functionality.
            Employees can only check in when connected to these IP addresses.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add IP Configuration
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {ipConfigs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌐</div>
          <h3>No IP Configurations</h3>
          <p>
            You need to configure at least one office IP address for employees to check in.
            Click "Add IP Configuration" to get started.
          </p>
        </div>
      ) : (
        <div className="ip-config-grid">
          {ipConfigs.map((config) => (
            <div key={config.id} className="ip-config-card">
              <div className="ip-config-card-header">
                <h3>{config.name}</h3>
                <div className="ip-config-status">
                  <span
                    className={`status-badge ${config.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(config)}
                    style={{ cursor: 'pointer' }}
                  >
                    {config.isActive ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
              </div>

              <div className="ip-config-details">
                <div className="detail-item">
                  <span className="detail-label">IP Address:</span>
                  <span className="detail-value">{config.ipAddress}</span>
                </div>
                {config.subnet && (
                  <div className="detail-item">
                    <span className="detail-label">Subnet:</span>
                    <span className="detail-value">{config.subnet}</span>
                  </div>
                )}
                {config.description && (
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{config.description}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date(config.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="ip-config-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(config)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(config.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingConfig ? 'Edit IP Configuration' : 'Add IP Configuration'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            {formError && <div className="error-message">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Main Office, Branch Office"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ipAddress">IP Address *</label>
                <input
                  type="text"
                  id="ipAddress"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="192.168.1.1"
                />
                <small>Enter the office network IP address</small>
              </div>

              <div className="form-group">
                <label htmlFor="subnet">Subnet (Optional)</label>
                <input
                  type="text"
                  id="subnet"
                  name="subnet"
                  value={formData.subnet}
                  onChange={handleInputChange}
                  placeholder="255.255.255.0 or /24"
                />
                <small>Subnet mask or CIDR notation (e.g., 255.255.255.0 or /24)</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes about this IP configuration"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active (Enable this IP configuration)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingConfig ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal for Success/Error Messages */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Confirm Modal for Actions */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm || (() => {})}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  )
}

export default IPConfiguration

