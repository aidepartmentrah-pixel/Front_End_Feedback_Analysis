import React, { useState, useEffect } from 'react';
import { getGroupedInbox } from '../api/insightApi';
import { actOnSubcase } from '../api/workflowApi';
import SectionCard from '../components/SectionCard';
import './GroupedInboxPage.css';

/**
 * Grouped Inbox Page
 * 
 * Administration dashboard showing all sections with pending workload.
 * Allows force-closing individual subcases.
 */
function GroupedInboxPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroupedInbox();
  }, []);

  async function loadGroupedInbox() {
    try {
      setLoading(true);
      setError(null);
      const data = await getGroupedInbox();
      setSections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForceClose(subcaseId, reason) {
    try {
      // Call force close API using actOnSubcase with FORCE_CLOSE action
      await actOnSubcase(subcaseId, 'FORCE_CLOSE', { reason });
      
      // Optimistic UI update - remove subcase immediately
      setSections(prevSections => 
        prevSections
          .map(section => ({
            ...section,
            subcases: section.subcases.filter(s => s.subcase_id !== subcaseId),
            pending_count: section.pending_count - 1,
          }))
          .filter(section => section.pending_count > 0) // Hide now-empty sections
      );
    } catch (err) {
      alert('Force close failed: ' + err.message);
      // Reload data on error to ensure consistency
      loadGroupedInbox();
      throw err; // Re-throw so SubcaseCard knows it failed
    }
  }

  if (loading) {
    return (
      <div className="grouped-inbox-page">
        <div className="loading">Loading grouped inbox...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grouped-inbox-page">
        <div className="error">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={loadGroupedInbox}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grouped-inbox-page">
      <div className="page-header">
        <h1>📊 Administrative Workload Overview</h1>
        <p>Sections grouped by pending workload</p>
        <button onClick={loadGroupedInbox} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="empty-state">
          <p>✅ No pending subcases found</p>
        </div>
      ) : (
        <div className="sections-list">
          {sections.map(section => (
            <SectionCard
              key={section.section_id}
              section={section}
              onForceClose={handleForceClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupedInboxPage;
