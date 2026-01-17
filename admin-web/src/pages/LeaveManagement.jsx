import { useState, useEffect } from 'react'
import api from '../services/api'
import './LeaveManagement.css'

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('PENDING') // PENDING, APPROVED, REJECTED, ALL
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchLeaves()
  }, [filter])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      let response
      if (filter === 'PENDING') {
        response = await api.get('/leaves/pending')
        setLeaves(response.data.leaves || [])
      } else {
        const params = filter === 'ALL' ? {} : { status: filter }
        response = await api.get('/leaves', { params })
        setLeaves(response.data.leaves || [])
      }
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch leave requests')
      setLeaves([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedLeave) return

    setActionLoading(true)
    try {
      await api.put(`/leaves/${selectedLeave.id}/status`, {
        status: 'APPROVED',
        adminNotes: adminNotes || undefined,
      })
      setShowModal(false)
      setSelectedLeave(null)
      setAdminNotes('')
      fetchLeaves()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve leave request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedLeave) return

    setActionLoading(true)
    try {
      await api.put(`/leaves/${selectedLeave.id}/status`, {
        status: 'REJECTED',
        adminNotes: adminNotes || undefined,
      })
      setShowModal(false)
      setSelectedLeave(null)
      setAdminNotes('')
      fetchLeaves()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject leave request')
    } finally {
      setActionLoading(false)
    }
  }

  const openActionModal = (leave, action) => {
    setSelectedLeave({ ...leave, action })
    setAdminNotes(leave.adminNotes || '')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLeave(null)
    setAdminNotes('')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'badge-approved'
      case 'REJECTED':
        return 'badge-rejected'
      case 'PENDING':
        return 'badge-pending'
      default:
        return ''
    }
  }

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'SICK':
        return '#e74c3c'
      case 'VACATION':
        return '#3498db'
      case 'PERSONAL':
        return '#9b59b6'
      case 'EMERGENCY':
        return '#e67e22'
      default:
        return '#7f8c8d'
    }
  }

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length

  if (loading) {
    return (
      <div className="leave-management-container">
        <div className="loading">Loading leave requests...</div>
      </div>
    )
  }

  return (
    <div className="leave-management-container">
      <div className="leave-management-header">
        <h1>Leave Management</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Pending
            {filter === 'PENDING' && pendingCount > 0 && (
              <span className="badge-count">{pendingCount}</span>
            )}
          </button>
          <button
            className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setFilter('APPROVED')}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setFilter('REJECTED')}
          >
            Rejected
          </button>
          <button
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {leaves.length === 0 ? (
        <div className="empty-state">
          <p>No leave requests found.</p>
        </div>
      ) : (
        <div className="leaves-grid">
          {leaves.map((leave) => (
            <div key={leave.id} className="leave-card">
              <div className="leave-card-header">
                <div className="leave-employee-info">
                  <h3>{leave.user?.name || 'Unknown Employee'}</h3>
                  <span className="leave-email">{leave.user?.email || ''}</span>
                </div>
                <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                  {leave.status}
                </span>
              </div>

              <div className="leave-card-body">
                <div className="leave-type-badge" style={{ backgroundColor: `${getLeaveTypeColor(leave.leaveType)}20`, color: getLeaveTypeColor(leave.leaveType) }}>
                  {leave.leaveType}
                </div>

                <div className="leave-dates">
                  <div className="leave-date-item">
                    <span className="leave-date-label">Start Date:</span>
                    <span className="leave-date-value">{formatDate(leave.startDate)}</span>
                  </div>
                  <div className="leave-date-item">
                    <span className="leave-date-label">End Date:</span>
                    <span className="leave-date-value">{formatDate(leave.endDate)}</span>
                  </div>
                  <div className="leave-date-item">
                    <span className="leave-date-label">Total Days:</span>
                    <span className="leave-date-value">{leave.totalDays} day(s)</span>
                  </div>
                </div>

                <div className="leave-reason">
                  <span className="leave-reason-label">Reason:</span>
                  <p className="leave-reason-text">{leave.reason}</p>
                </div>

                {leave.adminNotes && (
                  <div className="leave-admin-notes">
                    <span className="leave-admin-notes-label">Admin Notes:</span>
                    <p className="leave-admin-notes-text">{leave.adminNotes}</p>
                  </div>
                )}

                {leave.reviewedBy && (
                  <div className="leave-reviewed-info">
                    <span className="leave-reviewed-text">
                      Reviewed by {leave.reviewedBy.name} on {formatDateTime(leave.reviewedAt)}
                    </span>
                  </div>
                )}

                <div className="leave-requested-date">
                  Requested on {formatDateTime(leave.createdAt)}
                </div>
              </div>

              {leave.status === 'PENDING' && (
                <div className="leave-card-actions">
                  <button
                    className="btn-approve"
                    onClick={() => openActionModal(leave, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => openActionModal(leave, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && selectedLeave && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedLeave.action === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="leave-summary">
                <p>
                  <strong>Employee:</strong> {selectedLeave.user?.name}
                </p>
                <p>
                  <strong>Leave Type:</strong> {selectedLeave.leaveType}
                </p>
                <p>
                  <strong>Dates:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                </p>
                <p>
                  <strong>Total Days:</strong> {selectedLeave.totalDays}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="adminNotes">
                  Admin Notes {selectedLeave.action === 'reject' && <span className="required">*</span>}
                </label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="4"
                  placeholder={
                    selectedLeave.action === 'approve'
                      ? 'Add optional notes for this approval...'
                      : 'Please provide a reason for rejection...'
                  }
                  required={selectedLeave.action === 'reject'}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeModal}
                disabled={actionLoading}
              >
                Cancel
              </button>
              {selectedLeave.action === 'approve' ? (
                <button
                  type="button"
                  className="btn-approve"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Approving...' : 'Approve Leave'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-reject"
                  onClick={handleReject}
                  disabled={actionLoading || !adminNotes.trim()}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Leave'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveManagement

