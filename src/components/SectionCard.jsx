import React, { useState } from 'react';
import SubcaseCard from './SubcaseCard';
import './SectionCard.css';

/**
 * Section Card Component
 * 
 * Collapsible card showing:
 * - Section name
 * - Supervisor name
 * - Pending count
 * - List of subcases (when expanded)
 */
function SectionCard({ section, onForceClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="section-card">
      <div className="section-header" onClick={toggleExpand}>
        <div className="section-info">
          <h3 className="section-name">
            📋 {section.section_name}
          </h3>
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
