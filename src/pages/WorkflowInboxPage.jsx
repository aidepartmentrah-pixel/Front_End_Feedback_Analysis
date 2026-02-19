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
import { Box, Card, Typography, Table, Chip, Button, CircularProgress, Tabs, TabList, Tab, TabPanel, Input, ButtonGroup } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/common/MainLayout';
import ErrorPanel from '../components/common/ErrorPanel';
import { getWorkflowInbox, getWorkflowInboxArchive } from '../api/workflowApi';
import CaseActionModal from '../components/workflow/CaseActionModal';
import ResponseViewerModal from '../components/workflow/ResponseViewerModal';
import SeasonalReportViewerModal from '../components/workflow/SeasonalReportViewerModal';
import IncidentViewerModal from '../components/workflow/IncidentViewerModal';
import { useAuth } from '../context/AuthContext';

const WorkflowInboxPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is UNIVERSAL_SECTION role (for action filtering)
  const isUniversalSection = user?.roles?.includes('UNIVERSAL_SECTION');
  
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

  // Case type filter state: 'all', 'incident', 'seasonal'
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');

  // Modal state for Case Action Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionCode, setModalActionCode] = useState(null);
  const [modalSubcaseId, setModalSubcaseId] = useState(null);
  const [modalSubcaseIds, setModalSubcaseIds] = useState([]); // For bulk operations

  // Modal state for Response Viewer Modal
  const [responseViewerOpen, setResponseViewerOpen] = useState(false);
  const [responseViewerSubcaseId, setResponseViewerSubcaseId] = useState(null);

  // Modal state for Seasonal Report Viewer Modal
  const [seasonalViewerOpen, setSeasonalViewerOpen] = useState(false);
  const [seasonalViewerReportId, setSeasonalViewerReportId] = useState(null);

  // Modal state for Incident Viewer Modal (read-only view for section admins)
  const [incidentViewerOpen, setIncidentViewerOpen] = useState(false);
  const [incidentViewerRecordId, setIncidentViewerRecordId] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

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
      direct_approve: 'DIRECT_APPROVE',  // UNIVERSAL_SECTION direct approval
      view: null, // View navigates to detail page
    };
    return mapping[action] || null;
  };

  /**
   * Open Case Action Modal with specified action
   * @param {number|null} subcaseId - Single subcase ID (for regular operations)
   * @param {string} actionCode - Action code for the workflow transition
   * @param {number[]|null} subcaseIds - Array of subcase IDs (for bulk operations)
   */
  const openCaseActionModal = (subcaseId, actionCode, subcaseIds = null) => {
    setModalSubcaseId(subcaseId);
    setModalSubcaseIds(subcaseIds || []);
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
    setModalSubcaseIds([]);
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
        // Incident — open viewer modal (read-only for section admins)
        setIncidentViewerRecordId(item.incidentId);
        setIncidentViewerOpen(true);
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
  // CASE TYPE & ID HELPERS
  // ============================
  /**
   * Determine if an item is an incident (vs seasonal report).
   * Uses field presence as primary indicator since caseType may not be set correctly.
   */
  const isIncidentItem = (item) => {
    // If it has a seasonalReportId, it's seasonal
    if (item.seasonalReportId) return false;
    // If it has an incidentId, it's an incident
    if (item.incidentId) return true;
    // Fall back to caseType check
    return item.caseType === 'INCIDENT';
  };

  /**
   * Get the display ID for an item (incident case ID or seasonal report ID)
   */
  const getDisplayId = (item) => {
    if (isIncidentItem(item) && item.incidentId) {
      return `Case #${item.incidentId}`;
    }
    if (item.seasonalReportId) {
      return `Report #${item.seasonalReportId}`;
    }
    return `#${item.subcaseId}`;
  };

  /**
   * Filter items by search query (searches by ID numbers)
   */
  const filterBySearch = (itemsList) => {
    if (!searchQuery.trim()) return itemsList;
    const query = searchQuery.trim().toLowerCase();
    return itemsList.filter(item => {
      // Search by incident ID, seasonal report ID, or subcase ID
      if (item.incidentId && String(item.incidentId).includes(query)) return true;
      if (item.seasonalReportId && String(item.seasonalReportId).includes(query)) return true;
      if (item.subcaseId && String(item.subcaseId).includes(query)) return true;
      // Also search the formatted display ID
      const displayId = getDisplayId(item).toLowerCase();
      if (displayId.includes(query)) return true;
      return false;
    });
  };

  /**
   * Filter items by case type (incident vs seasonal)
   */
  const filterByCaseType = (itemsList) => {
    if (caseTypeFilter === 'all') return itemsList;
    return itemsList.filter(item => {
      if (caseTypeFilter === 'incident') return isIncidentItem(item);
      if (caseTypeFilter === 'seasonal') return !isIncidentItem(item);
      return true;
    });
  };

  /**
   * Combined filter: search + case type
   */
  const applyFilters = (itemsList) => {
    return filterByCaseType(filterBySearch(itemsList));
  };

  // ============================
  // GROUPING LOGIC FOR UNIVERSAL_SECTION
  // ============================
  /**
   * Group items by incidentId for bulk operations (UNIVERSAL_SECTION only)
   * Returns array of { incidentId, items: [...subcases] }
   */
  const groupItemsByIncident = (itemsList) => {
    const grouped = {};
    itemsList.forEach(item => {
      const key = item.incidentId || `subcase_${item.subcaseId}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return Object.entries(grouped).map(([incidentId, items]) => ({
      incidentId: items[0].incidentId, // null for seasonal reports
      isIncident: isIncidentItem(items[0]),
      items,
      subcaseIds: items.map(i => i.subcaseId),
    }));
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
  // EXCEPTION: UNIVERSAL_SECTION role only sees 'view' and 'direct_approve' actions.
  // Backend controls action matrix.
  /**
   * Render action buttons based on backend-computed allowedActions.
   * EXCEPTION: For UNIVERSAL_SECTION users, only 'view' and 'direct_approve' are shown.
   * Backend already computed what actions are allowed.
   */
  const renderActionButtons = (item) => {
    let { allowedActions } = item;

    // UNIVERSAL_SECTION special case: only allow view and direct_approve
    if (isUniversalSection) {
      allowedActions = allowedActions.filter(action => 
        ['view', 'direct_approve'].includes(action)
      );
    }

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
        {allowedActions.includes('direct_approve') && (
          <Button
            size="sm"
            variant="solid"
            color="success"
            onClick={() => handleActionClick(item, 'direct_approve')}
            disabled={modalOpen}
            sx={{ fontWeight: 'bold' }}
          >
            ⚡ Direct Approve
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
  // RENDER GROUPED INBOX ROW (UNIVERSAL_SECTION ONLY)
  // ============================
  const renderGroupedInboxRow = (group) => {
    const { incidentId, isIncident, items, subcaseIds } = group;
    const firstItem = items[0];
    const subcaseCount = items.length;
    
    // Get unique target org units
    const targetUnits = [...new Set(items.map(i => i.targetOrgUnitName || `Unit ${i.targetOrgUnitId}`))];
    
    return (
      <tr key={`group_${incidentId || subcaseIds[0]}`} style={{ backgroundColor: subcaseCount > 1 ? 'rgba(102, 126, 234, 0.05)' : 'inherit' }}>
        <td>
          <Typography level="body-sm" fontWeight="bold">
            {isIncident ? `Case #${incidentId}` : `Report #${firstItem.seasonalReportId || subcaseIds[0]}`}
          </Typography>
          {subcaseCount > 1 && (
            <Chip size="sm" variant="solid" color="primary" sx={{ ml: 1 }}>
              {subcaseCount} subcases
            </Chip>
          )}
        </td>
        <td>
          <Chip
            size="sm"
            variant="soft"
            color={isIncident ? 'primary' : 'warning'}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {isIncident ? 'Incident' : 'Seasonal'}
          </Chip>
        </td>
        <td>
          <Chip
            size="sm"
            variant="soft"
            color={getStatusDisplay(firstItem.status).color}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {getStatusDisplay(firstItem.status).label}
          </Chip>
        </td>
        <td>
          <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
            {targetUnits.length > 2 
              ? `${targetUnits.slice(0, 2).join(', ')}... (+${targetUnits.length - 2})` 
              : targetUnits.join(', ')}
          </Typography>
        </td>
        <td>
          <Typography level="body-sm">
            {firstItem.createdAt?.toLocaleDateString()}
          </Typography>
        </td>
        <td>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {/* View button - opens first item */}
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => handleActionClick(firstItem, 'view')}
              disabled={modalOpen}
            >
              View
            </Button>
            
            {/* Bulk Direct Approve button */}
            {subcaseCount > 1 ? (
              <Button
                size="sm"
                variant="solid"
                color="success"
                onClick={() => openCaseActionModal(null, 'DIRECT_APPROVE', subcaseIds)}
                disabled={modalOpen}
                sx={{ fontWeight: 'bold' }}
              >
                ⚡ Approve All ({subcaseCount})
              </Button>
            ) : (
              <Button
                size="sm"
                variant="solid"
                color="success"
                onClick={() => openCaseActionModal(subcaseIds[0], 'DIRECT_APPROVE')}
                disabled={modalOpen}
                sx={{ fontWeight: 'bold' }}
              >
                ⚡ Direct Approve
              </Button>
            )}
          </Box>
        </td>
      </tr>
    );
  };

  // ============================
  // RENDER INBOX TABLE ROW
  // ============================
  const renderInboxRow = (item) => (
    <tr key={item.subcaseId}>
      <td>
        <Typography level="body-sm" fontWeight="bold">
          {getDisplayId(item)}
        </Typography>
      </td>
      <td>
        <Chip
          size="sm"
          variant="soft"
          color={isIncidentItem(item) ? 'primary' : 'warning'}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {isIncidentItem(item) ? 'Incident' : 'Seasonal'}
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
          {getDisplayId(item)}
        </Typography>
      </td>
      <td>
        <Chip
          size="sm"
          variant="soft"
          color={isIncidentItem(item) ? 'primary' : 'warning'}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {isIncidentItem(item) ? 'Incident' : 'Seasonal'}
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
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography level="h4">Active Items ({applyFilters(items).length})</Typography>
                    {/* Case Type Filter Buttons */}
                    <ButtonGroup size="sm" variant="outlined" color="neutral">
                      <Button
                        variant={caseTypeFilter === 'all' ? 'solid' : 'outlined'}
                        color={caseTypeFilter === 'all' ? 'primary' : 'neutral'}
                        onClick={() => setCaseTypeFilter('all')}
                      >
                        All
                      </Button>
                      <Button
                        variant={caseTypeFilter === 'incident' ? 'solid' : 'outlined'}
                        color={caseTypeFilter === 'incident' ? 'primary' : 'neutral'}
                        onClick={() => setCaseTypeFilter('incident')}
                      >
                        🔴 Incidents
                      </Button>
                      <Button
                        variant={caseTypeFilter === 'seasonal' ? 'solid' : 'outlined'}
                        color={caseTypeFilter === 'seasonal' ? 'warning' : 'neutral'}
                        onClick={() => setCaseTypeFilter('seasonal')}
                      >
                        📅 Seasonal
                      </Button>
                    </ButtonGroup>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Input
                      size="sm"
                      placeholder="Search by ID (e.g., 503)"
                      startDecorator={<SearchIcon />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ width: 200 }}
                    />
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
                    {isUniversalSection
                      ? groupItemsByIncident(applyFilters(items)).map((group) => renderGroupedInboxRow(group))
                      : applyFilters(items).map((item) => renderInboxRow(item))
                    }
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
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography level="h4">Archived Items ({applyFilters(archiveItems).length})</Typography>
                    {/* Case Type Filter Buttons */}
                    <ButtonGroup size="sm" variant="outlined" color="neutral">
                      <Button
                        variant={caseTypeFilter === 'all' ? 'solid' : 'outlined'}
                        color={caseTypeFilter === 'all' ? 'primary' : 'neutral'}
                        onClick={() => setCaseTypeFilter('all')}
                      >
                        All
                      </Button>
                      <Button
                        variant={caseTypeFilter === 'incident' ? 'solid' : 'outlined'}
                        color={caseTypeFilter === 'incident' ? 'primary' : 'neutral'}
                        onClick={() => setCaseTypeFilter('incident')}
                      >
                        🔴 Incidents
                      </Button>
                      <Button
                        variant={caseTypeFilter === 'seasonal' ? 'solid' : 'outlined'}
                        color={caseTypeFilter === 'seasonal' ? 'warning' : 'neutral'}
                        onClick={() => setCaseTypeFilter('seasonal')}
                      >
                        📅 Seasonal
                      </Button>
                    </ButtonGroup>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Input
                      size="sm"
                      placeholder="Search by ID (e.g., 503)"
                      startDecorator={<SearchIcon />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ width: 200 }}
                    />
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
                    {applyFilters(archiveItems).map((item) => renderArchiveRow(item))}
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
        subcaseIds={modalSubcaseIds}
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

      {/* Incident Viewer Modal (read-only for section admins) */}
      <IncidentViewerModal
        open={incidentViewerOpen}
        onClose={() => setIncidentViewerOpen(false)}
        incidentId={incidentViewerRecordId}
      />
    </MainLayout>
  );
};

export default WorkflowInboxPage;
