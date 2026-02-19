import React, { useState } from 'react';
import SubcaseCard from './SubcaseCard';
import './SectionCard.css';

/**
 * Section Card Component
 * 
 * Collapsible card showing:
 * - Section name with org type badge
 * - Supervisor name
 * - Pending count
 * - List of subcases (when expanded)
 * 
 * Supports both controlled (via isExpanded/onToggleExpand props) 
 * and uncontrolled (internal state) expansion.
 */
function SectionCard({ section, onForceClose, isExpanded: controlledExpanded, onToggleExpand }) {
  // Internal state for uncontrolled mode
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Use controlled or uncontrolled expansion
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const toggleExpand = () => {
    if (isControlled && onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  // Get org type display info
  const getOrgTypeInfo = (orgType) => {
    const type = (orgType || 'SECTION').toUpperCase();
    switch (type) {
      case 'SECTION':
        return { label: 'Section', className: 'org-type-section', cardClass: 'org-section', icon: '📌' };
      case 'DEPARTMENT':
        return { label: 'Department', className: 'org-type-department', cardClass: 'org-department', icon: '🏢' };
      case 'ADMINISTRATION':
        return { label: 'Administration', className: 'org-type-administration', cardClass: 'org-administration', icon: '🏛️' };
      default:
        return { label: type, className: 'org-type-section', cardClass: 'org-section', icon: '📋' };
    }
  };

  const orgTypeInfo = getOrgTypeInfo(section.org_type);

  return (
    <div className={`section-card ${orgTypeInfo.cardClass}`}>
      <div className="section-header" onClick={toggleExpand}>
        <div className="section-info">
          <div className="section-title-row">
            <span className={`org-type-badge ${orgTypeInfo.className}`}>
              {orgTypeInfo.icon} {orgTypeInfo.label}
            </span>
            <h3 className="section-name">
              {section.section_name}
            </h3>
          </div>
          <div className="section-meta">
            <span className="supervisor">
              👤 Supervisor: {section.supervisor_name}
            </span>
            <span className="pending-count">
              ⏱️ {section.pending_count} pending subcase{section.pending_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="expand-indicator">
          {isExpanded ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>

      {isExpanded && (
        <div className="section-body">
          <div className="subcases-list">
            {section.subcases.map(subcase => (
              <SubcaseCard
                key={subcase.subcase_id}
                subcase={subcase}
                onForceClose={onForceClose}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SectionCard;
