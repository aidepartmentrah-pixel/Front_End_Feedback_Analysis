/**
 * STEP 4.10 — Workflow Inbox Page (Phase 4)
 * STEP 4.15 — Error & Denial UX Hardening
 * 
 * Purpose:
 * - Display workflow inbox items for current authenticated user
 * - Render action buttons based on backend-computed allowedActions
 * - No role logic, no permission checks in UI
 * - Data-driven UI from workflowApi
 * 
 * Architecture:
 * - Uses workflowApi.getWorkflowInbox() ONLY (no direct API calls)
 * - Relies on backend-computed allowedActions array
 * - No business logic duplication
 * - No workflow state machine logic
 * 
 * UX Hardening:
 * - User-friendly error panels with retry
 * - Network error detection
 * - Loading state button disabling
 * - Empty state messaging
 */

import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Table, Chip, Button, CircularProgress, Tabs, TabList, Tab, TabPanel } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/common/MainLayout';
import ErrorPanel from '../components/common/ErrorPanel';
import { getWorkflowInbox, getWorkflowInboxArchive } from '../api/workflowApi';
import CaseActionModal from '../components/workflow/CaseActionModal';
import ResponseViewerModal from '../components/workflow/ResponseViewerModal';
import SeasonalReportViewerModal from '../components/workflow/SeasonalReportViewerModal';

const WorkflowInboxPage = () => {
  const navigate = useNavigate();
  
  // ============================
  // STATE
  // ============================
  const [items, setItems] = useState([]);
  const [archiveItems, setArchiveItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [archiveError, setArchiveError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Inbox, 1 = Archive

  // Modal state for Case Action Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionCode, setModalActionCode] = useState(null);
  const [modalSubcaseId, setModalSubcaseId] = useState(null);

  // Modal state for Response Viewer Modal
  const [responseViewerOpen, setResponseViewerOpen] = useState(false);
  const [responseViewerSubcaseId, setResponseViewerSubcaseId] = useState(null);

  // Modal state for Seasonal Report Viewer Modal
  const [seasonalViewerOpen, setSeasonalViewerOpen] = useState(false);
  const [seasonalViewerReportId, setSeasonalViewerReportId] = useState(null);

  // ============================
  // LOAD INBOX ON MOUNT
  // ============================
  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const inboxItems = await getWorkflowInbox();
      setItems(inboxItems);
    } catch (err) {
      // Network error detection
      if (!err.response && err.message === 'Network error') {
        setError('Network error — check your connection and try again');
      } else {
        setError(err.message || 'Failed to load inbox items');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadArchive = async () => {
    setArchiveLoading(true);
    setArchiveError(null);
    
    try {
      const items = await getWorkflowInboxArchive();
      setArchiveItems(items);
    } catch (err) {
      if (!err.response && err.message === 'Network error') {
        setArchiveError('Network error — check your connection and try again');
      } else {
        setArchiveError(err.message || 'Failed to load archive items');
      }
    } finally {
      setArchiveLoading(false);
    }
  };

  // Load archive when tab changes to Archive
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && archiveItems.length === 0 && !archiveLoading) {
      loadArchive();
    }
  };

  // ============================
  // MODAL HANDLERS (STEP 4.12)
  // ============================
  /**
   * Workflow inbox actions trigger CaseActionModal.
   * Modal executes workflow transition and refreshes inbox on success.
   */

  /**
   * Map inbox allowedActions to backend action codes
   * @param {string} action - Action from allowedActions array
   * @returns {string|null} Backend action code or null if not supported
   */
  const mapInboxActionToCaseAction = (action) => {
    const mapping = {
      accept: 'APPROVE',
      reject: 'REJECT',
      submit_response: 'SUBMIT_RESPONSE',
      reopen: 'REOPEN',
      view: null, // View navigates to detail page
    };
    return mapping[action] || null;
  };

  /**
   * Open Case Action Modal with specified action
   */
  const openCaseActionModal = (subcaseId, actionCode) => {
    setModalSubcaseId(subcaseId);
    setModalActionCode(actionCode);
    setModalOpen(true);
  };

  /**
   * Close modal and reset state
   */
  const handleModalClose = () => {
    setModalOpen(false);
    setModalActionCode(null);
    setModalSubcaseId(null);
  };

  /**
   * Handle successful modal action - refresh inbox
   */
  const handleModalSuccess = () => {
    handleModalClose();
    loadInbox();
  };

  /**
   * Open Response Viewer Modal
   */
  const openResponseViewer = (subcaseId) => {
    setResponseViewerSubcaseId(subcaseId);
    setResponseViewerOpen(true);
  };

  /**
   * Handle action button clicks
   */
  const handleActionClick = (item, action) => {
    // Handle View action
    if (action === 'view') {
      if (item.caseType === 'SEASONAL_REPORT_RESPONSE' && item.seasonalReportId) {
        // Seasonal report — open viewer modal
        setSeasonalViewerReportId(item.seasonalReportId);
        setSeasonalViewerOpen(true);
      } else if (item.incidentId) {
        // Incident — navigate to edit page
        navigate(`/edit/${item.incidentId}`);
      }
      return;
    }

    // Handle View Response action - open response viewer modal
    if (action === 'view_response') {
      openResponseViewer(item.subcaseId);
      return;
    }
    
    // Handle modal actions (accept, reject, submit_response)
    const actionCode = mapInboxActionToCaseAction(action);
    if (actionCode) {
      openCaseActionModal(item.subcaseId, actionCode);
    }
  };

  // ============================
  // STATUS DISPLAY HELPERS
  // ============================
  /**
   * Get display label and color for a workflow status.
   * Returned-for-revision items get a distinct visual badge.
   */
  const getStatusDisplay = (status) => {
    const statusMap = {
      RETURNED_TO_SECTION_FOR_REVISION: { label: 'Returned for Revision', color: 'warning' },
      RETURNED_TO_DEPARTMENT_FOR_REVISION: { label: 'Returned for Revision', color: 'warning' },
      SUBMITTED_TO_SECTION: { label: 'Submitted to Section', color: 'primary' },
      SUBMITTED_TO_DEPARTMENT: { label: 'Submitted to Department', color: 'primary' },
      SECTION_ACCEPTED_PENDING_DEPT: { label: 'Section Accepted', color: 'success' },
      DEPT_ACCEPTED_PENDING_ADMIN: { label: 'Dept Accepted', color: 'success' },
      ADMIN_APPROVED: { label: 'Admin Approved', color: 'success' },
      SECTION_DENIED: { label: 'Denied', color: 'danger' },
      FORCE_CLOSED: { label: 'Force Closed', color: 'neutral' },
    };
    return statusMap[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', color: 'neutral' };
  };

  // ============================
  // RENDER ACTION BUTTONS
  // ============================
  // CONTRACT LOCK:
  // Button visibility is backend-driven via allowedActions.
  // Do NOT add role-based or status-based UI logic here.
  // Backend controls action matrix.
  /**
   * Render action buttons based on backend-computed allowedActions.
   * CRITICAL: Do NOT check status, role, or permissions here.
   * Backend already computed what actions are allowed.
   */
  const renderActionButtons = (item) => {
    const { allowedActions } = item;

    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {allowedActions.includes('view') && (
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => handleActionClick(item, 'view')}
            disabled={modalOpen}
          >
            View
          </Button>
        )}
        {allowedActions.includes('view_response') && (
          <Button
            size="sm"
            variant="outlined"
            color="primary"
            onClick={() => handleActionClick(item, 'view_response')}
            disabled={modalOpen}
          >
            View Response
          </Button>
        )}
        {allowedActions.includes('submit_response') && (
          <Button
            size="sm"
            variant="solid"
            color="primary"
            onClick={() => handleActionClick(item, 'submit_response')}
            disabled={modalOpen}
          >
            Submit Response
          </Button>
        )}
        {allowedActions.includes('accept') && (
          <Button
            size="sm"
            variant="solid"
            color="success"
            onClick={() => handleActionClick(item, 'accept')}
            disabled={modalOpen}
          >
            Accept
          </Button>
        )}
        {allowedActions.includes('reject') && (
          <Button
            size="sm"
            variant="solid"
            color="danger"
            onClick={() => handleActionClick(item, 'reject')}
            disabled={modalOpen}
          >
            Reject
          </Button>
        )}
        {allowedActions.includes('reopen') && (
          <Button
            size="sm"
            variant="solid"
            color="warning"
            onClick={() => handleActionClick(item, 'reopen')}
            disabled={modalOpen}
          >
            Resend to Section
          </Button>
        )}
      </Box>
    );
  };

  // ============================
  // RENDER INBOX TABLE ROW
  // ============================
  const renderInboxRow = (item) => (
    <tr key={item.subcaseId}>
      <td>
        <Typography level="body-sm" fontWeight="bold">
          #{item.subcaseId}
        </Typography>
      </td>
      <td>
        <Chip
          size="sm"
          variant="soft"
          color={item.caseType === 'INCIDENT' ? 'primary' : 'warning'}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {item.caseType === 'INCIDENT' ? 'Incident' : 'Seasonal'}
        </Chip>
      </td>
      <td>
        <Chip
          size="sm"
          variant="soft"
          color={getStatusDisplay(item.status).color}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {getStatusDisplay(item.status).label}
        </Chip>
      </td>
      <td>
        <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
          {item.targetOrgUnitName || `Unit ${item.targetOrgUnitId}`}
        </Typography>
      </td>
      <td>
        <Typography level="body-sm">
          {item.createdAt?.toLocaleDateString()}
        </Typography>
      </td>
      <td>{renderActionButtons(item)}</td>
    </tr>
  );

  // ============================
  // RENDER ARCHIVE TABLE ROW
  // ============================
  const renderArchiveRow = (item) => (
    <tr key={item.subcaseId}>
      <td>
        <Typography level="body-sm" fontWeight="bold">
          #{item.subcaseId}
        </Typography>
      </td>
      <td>
        <Chip
          size="sm"
          variant="soft"
          color={item.caseType === 'INCIDENT' ? 'primary' : 'warning'}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {item.caseType === 'INCIDENT' ? 'Incident' : 'Seasonal'}
        </Chip>
      </td>
      <td>
        <Chip
          size="sm"
          variant="soft"
          color={getStatusDisplay(item.status).color}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {getStatusDisplay(item.status).label}
        </Chip>
      </td>
      <td>
        <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
          {item.targetOrgUnitName || `Unit ${item.targetOrgUnitId}`}
        </Typography>
      </td>
      <td>
        <Typography level="body-sm">
          {item.updatedAt?.toLocaleDateString() || item.createdAt?.toLocaleDateString()}
        </Typography>
      </td>
      <td>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => handleActionClick(item, 'view')}
          >
            View Case
          </Button>
          <Button
            size="sm"
            variant="soft"
            color="primary"
            onClick={() => openResponseViewer(item.subcaseId)}
          >
            View Response
          </Button>
        </Box>
      </td>
    </tr>
  );

  // ============================
  // RENDER EMPTY STATE CONTENT
  // ============================
  const renderEmptyInbox = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: 2,
      }}
    >
      <Typography level="h4" sx={{ color: 'neutral.500' }}>
        📭 No Items Assigned To Your Responsibility Level
      </Typography>
      <Typography level="body-md" sx={{ color: 'neutral.400', textAlign: 'center', maxWidth: 500 }}>
        There are currently no workflow cases waiting for action at your role level.
      </Typography>
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={loadInbox}
        sx={{ mt: 1 }}
      >
        Refresh
      </Button>
    </Box>
  );

  const renderEmptyArchive = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: 2,
      }}
    >
      <Typography level="h4" sx={{ color: 'neutral.500' }}>
        📋 No Archived Items
      </Typography>
      <Typography level="body-md" sx={{ color: 'neutral.400', textAlign: 'center', maxWidth: 500 }}>
        Cases you have processed will appear here once they move to the next stage.
      </Typography>
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={loadArchive}
        sx={{ mt: 1 }}
      >
        Refresh
      </Button>
    </Box>
  );

  // ============================
  // RENDER LOADING STATE FOR TAB CONTENT
  // ============================
  const renderLoadingState = (message = 'Loading...') => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: 2,
      }}
    >
      <CircularProgress size="lg" />
      <Typography level="body-lg">{message}</Typography>
    </Box>
  );

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <MainLayout pageTitle="Workflow Inbox">
      <Box sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Inbox tabs">
          <TabList>
            <Tab>📥 Inbox ({items.length})</Tab>
            <Tab>📋 Archive ({archiveItems.length})</Tab>
          </TabList>

          {/* INBOX TAB */}
          <TabPanel value={0} sx={{ p: 0, pt: 2 }}>
            {loading ? (
              renderLoadingState('Loading inbox...')
            ) : error ? (
              <ErrorPanel
                message={error}
                retryAction={loadInbox}
                retryLabel="Retry Load"
              />
            ) : items.length === 0 ? (
              renderEmptyInbox()
            ) : (
              <Card variant="outlined">
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="h4">Active Items ({items.length})</Typography>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    onClick={loadInbox}
                    disabled={modalOpen}
                  >
                    Refresh
                  </Button>
                </Box>

                <Table
                  variant="outlined"
                  sx={{
                    '& thead th': {
                      fontWeight: 600,
                      backgroundColor: 'neutral.50',
                    },
                    tableLayout: 'fixed',
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>ID</th>
                      <th style={{ width: '12%' }}>Case Type</th>
                      <th style={{ width: '18%' }}>Status</th>
                      <th style={{ width: '17%' }}>Target Unit</th>
                      <th style={{ width: '12%' }}>Created</th>
                      <th style={{ width: '33%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => renderInboxRow(item))}
                  </tbody>
                </Table>
              </Card>
            )}
          </TabPanel>

          {/* ARCHIVE TAB */}
          <TabPanel value={1} sx={{ p: 0, pt: 2 }}>
            {archiveLoading ? (
              renderLoadingState('Loading archive...')
            ) : archiveError ? (
              <ErrorPanel
                message={archiveError}
                retryAction={loadArchive}
                retryLabel="Retry Load"
              />
            ) : archiveItems.length === 0 ? (
              renderEmptyArchive()
            ) : (
              <Card variant="outlined">
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="h4">Archived Items ({archiveItems.length})</Typography>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    onClick={loadArchive}
                    disabled={modalOpen}
                  >
                    Refresh
                  </Button>
                </Box>

                <Table
                  variant="outlined"
                  sx={{
                    '& thead th': {
                      fontWeight: 600,
                      backgroundColor: 'neutral.50',
                    },
                    tableLayout: 'fixed',
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>ID</th>
                      <th style={{ width: '12%' }}>Case Type</th>
                      <th style={{ width: '18%' }}>Status</th>
                      <th style={{ width: '17%' }}>Target Unit</th>
                      <th style={{ width: '12%' }}>Processed</th>
                      <th style={{ width: '33%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archiveItems.map((item) => renderArchiveRow(item))}
                  </tbody>
                </Table>
              </Card>
            )}
          </TabPanel>
        </Tabs>
      </Box>

      {/* Case Action Modal */}
      <CaseActionModal
        open={modalOpen}
        onClose={handleModalClose}
        subcaseId={modalSubcaseId}
        actionCode={modalActionCode}
        onSuccess={handleModalSuccess}
      />

      {/* Response Viewer Modal (read-only) */}
      <ResponseViewerModal
        open={responseViewerOpen}
        onClose={() => setResponseViewerOpen(false)}
        subcaseId={responseViewerSubcaseId}
      />

      {/* Seasonal Report Viewer Modal (read-only) */}
      <SeasonalReportViewerModal
        open={seasonalViewerOpen}
        onClose={() => setSeasonalViewerOpen(false)}
        seasonalReportId={seasonalViewerReportId}
      />
    </MainLayout>
  );
};

export default WorkflowInboxPage;
