import React from 'react'
import './Modal.css'

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-small modal-${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              {cancelText}
            </button>
            <button className={`btn-primary btn-${type}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const AlertModal = ({ isOpen, onClose, type = 'success', title, message, buttonText = 'OK' }) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓'
      case 'error': return '✕'
      case 'warning': return '⚠'
      case 'info': return 'ℹ'
      default: return '✓'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-small modal-alert modal-${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-header modal-header-${type}`}>
          <div className="modal-icon">{getIcon()}</div>
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
          <div className="modal-actions">
            <button className={`btn-primary btn-${type}`} onClick={onClose}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal

