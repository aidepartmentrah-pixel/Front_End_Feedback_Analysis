import React from 'react';
import './SeverityBadge.css';

/**
 * Severity Badge Component
 * 
 * Displays color-coded severity indicator
 * - HIGH: Red
 * - MEDIUM: Orange/Yellow
 * - LOW: Blue/Green
 * - NEUTRAL: Gray (for seasonal reports)
 */
function SeverityBadge({ severity }) {
  const severityClass = `severity-badge severity-${(severity || 'NEUTRAL').toLowerCase()}`;
  const icon = {
    HIGH: '🚨',
    MEDIUM: '⚠️',
    LOW: 'ℹ️',
    NEUTRAL: '📋',
  }[severity] || '📋';

  return (
    <span className={severityClass}>
      {icon} {severity || 'NEUTRAL'}
    </span>
  );
}

export default SeverityBadge;
