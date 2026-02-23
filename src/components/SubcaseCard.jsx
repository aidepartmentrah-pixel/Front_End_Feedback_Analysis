import React, { useState } from 'react';
import SeverityBadge from './SeverityBadge';
import './SubcaseCard.css';

/**
 * Subcase Card Component
 * 
 * Displays individual subcase with:
 * - Severity badge
 * - Waiting time (prominent)
 * - Case description
 * - Patient name
 * - Force Close button
 */
function SubcaseCard({ subcase, onForceClose }) {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleForceCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = async () => {
    if (closeReason.trim().length < 10) {
      alert('Reason must be at least 10 characters');
      return;
    }

    setIsClosing(true);
    try {
      await onForceClose(subcase.subcase_id, closeReason);
      setShowCloseModal(false);
    } catch (err) {
      alert('Failed to close: ' + err.message);
    } finally {
      setIsClosing(false);
    }
  };

  const handleCancelClose = () => {
    setShowCloseModal(false);
    setCloseReason('');
  };

  return (
    <div className={`subcase-card ${subcase.is_red_flag ? 'subcase-red-flag' : ''} ${subcase.is_never_event ? 'subcase-never-event' : ''}`}>
      <div className="subcase-header">
        <SeverityBadge severity={subcase.severity} />
        {subcase.is_red_flag && (
          <span className="red-flag-badge">
            🚩 Red Flag
          </span>
        )}
        {subcase.is_never_event && (
          <span className="never-event-badge">
            ⚠️ Never Event
          </span>
        )}
        {subcase.status === 'RETURNED_TO_SECTION_FOR_REVISION' && (
          <span className="returned-badge">
            🔄 Returned for Revision
          </span>
        )}
        {subcase.status === 'RETURNED_TO_DEPARTMENT_FOR_REVISION' && (
          <span className="returned-badge">
            🔄 Returned for Revision
          </span>
        )}
        <span className="waiting-time">
          ⏱️ Waiting {subcase.waiting_days} day{subcase.waiting_days !== 1 ? 's' : ''}
        </span>
        <span className="case-id">
          Case #{subcase.incident_id || subcase.seasonal_report_id || '—'}
        </span>
        <span className="subcase-id">
          Subcase #{subcase.subcase_id}
        </span>
      </div>

      <div className="subcase-body">
        <div className="case-description">
          {subcase.case_description || 'No description available'}
        </div>
        
        <div className="subcase-meta">
          {subcase.patient_name && (
            <span className="patient-name">
              👤 Patient: {subcase.patient_name}
            </span>
          )}
          {subcase.category && (
            <span className="category">
              📁 {subcase.category}
            </span>
          )}
          <span className="created-date">
            📅 {new Date(subcase.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="subcase-actions">
        <button 
          className="btn-force-close"
          onClick={handleForceCloseClick}
        >
          Force Close
        </button>
      </div>

      {showCloseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Force Close Subcase #{subcase.subcase_id}</h3>
            <p>This action cannot be undone. Please provide a reason:</p>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="Enter reason (minimum 10 characters)..."
              rows={4}
              disabled={isClosing}
            />
            <div className="modal-actions">
              <button 
                onClick={handleConfirmClose}
                disabled={isClosing || closeReason.trim().length < 10}
                className="btn-confirm"
              >
                {isClosing ? 'Closing...' : 'Confirm Close'}
              </button>
              <button 
                onClick={handleCancelClose}
                disabled={isClosing}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubcaseCard;
