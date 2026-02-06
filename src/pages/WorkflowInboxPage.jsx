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
import { Box, Card, Typography, Table, Chip, Button, CircularProgress } from '@mui/joy';
import MainLayout from '../components/common/MainLayout';
import ErrorPanel from '../components/common/ErrorPanel';
import { getWorkflowInbox } from '../api/workflowApi';
import CaseActionModal from '../components/workflow/CaseActionModal';

const WorkflowInboxPage = () => {
  // ============================
  // STATE
  // ============================
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for Case Action Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionCode, setModalActionCode] = useState(null);
  const [modalSubcaseId, setModalSubcaseId] = useState(null);

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
      view: null, // View doesn't trigger modal
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
   * Handle action button clicks
   */
  const handleActionClick = (item, action) => {
    const actionCode = mapInboxActionToCaseAction(action);
    if (!actionCode) {
      // View or unsupported action - ignore for now
      return;
    }
    openCaseActionModal(item.subcaseId, actionCode);
  };

  // ============================
  // RENDER ACTION BUTTONS
  // ============================
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
      </Box>
    );
  };

  // ============================
  // RENDER LOADING STATE
  // ============================
  if (loading) {
    return (
      <MainLayout pageTitle="Workflow Inbox">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 2,
          }}
        >
          <CircularProgress size="lg" />
          <Typography level="body-lg">Loading inbox...</Typography>
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER ERROR STATE
  // ============================
  if (error) {
    return (
      <MainLayout pageTitle="Workflow Inbox">
        <Box sx={{ p: 3 }}>
          <ErrorPanel
            message={error}
            retryAction={loadInbox}
            retryLabel="Retry Load"
          />
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER EMPTY STATE
  // ============================
  if (items.length === 0) {
    return (
      <MainLayout pageTitle="Workflow Inbox">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 2,
          }}
        >
          <Typography level="h3" sx={{ color: 'neutral.500' }}>
            📭 No workflow items available
          </Typography>
          <Typography level="body-md" sx={{ color: 'neutral.400' }}>
            You have no pending cases requiring your attention at this time.
          </Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.300', mt: 1 }}>
            New items will appear here when workflow actions are needed.
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER INBOX TABLE
  // ============================
  return (
    <MainLayout pageTitle="Workflow Inbox">
      <Box sx={{ p: 3 }}>
        <Card variant="outlined">
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography level="h4">Inbox Items ({items.length})</Typography>
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
            }}
          >
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Subcase ID</th>
                <th style={{ width: '15%' }}>Case Type</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '12%' }}>Target Unit</th>
                <th style={{ width: '15%' }}>Created</th>
                <th style={{ width: '33%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
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
                    >
                      {item.caseType}
                    </Chip>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontSize: '0.85rem' }}>
                      {item.status.replace(/_/g, ' ')}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      Unit {item.targetOrgUnitId}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      {item.createdAt.toLocaleDateString()}
                    </Typography>
                  </td>
                  <td>{renderActionButtons(item)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Box>

      {/* Case Action Modal */}
      <CaseActionModal
        open={modalOpen}
        onClose={handleModalClose}
        subcaseId={modalSubcaseId}
        actionCode={modalActionCode}
        onSuccess={handleModalSuccess}
      />
    </MainLayout>
  );
};

export default WorkflowInboxPage;
