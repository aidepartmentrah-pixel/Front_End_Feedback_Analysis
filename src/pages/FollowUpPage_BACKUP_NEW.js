/**
 * STEP 4.13 â€” Follow-Up Page (Phase 4 Workflow)
 * STEP 4.15 â€” Error & Denial UX Hardening
 * 
 * Purpose:
 * - Displays assigned workflow action items for current authenticated user
 * - Uses workflowApi follow-up endpoints
 * - UI action rules are timestamp-based only (no allowedActions from backend)
 * 
 * Architecture:
 * - Uses workflowApi.getFollowUpItems() ONLY (no direct API calls)
 * - Button visibility derived from timestamp fields (startedAt, completedAt)
 * - No role logic, no permission checks in UI
 * - No workflow business logic duplication
 * 
 * Action Rules (Client-Side, Timestamp-Based):
 * - Can Start: startedAt == null
 * - Can Complete: startedAt != null && completedAt == null
 * - Can Delay: completedAt == null
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  Button,
  CircularProgress,
  Chip,
} from '@mui/joy';
import ErrorPanel from '../components/common/ErrorPanel';
import MainLayout from '../components/common/MainLayout';
import {
  getFollowUpItems,
  startActionItem,
  completeActionItem,
  delayActionItem,
} from '../api/workflowApi';

const FollowUpPage = () => {
  // ============================
  // STATE
  // ============================
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null); // Track which action is being processed
  const [actionError, setActionError] = useState(null);

  // ============================
  // LOAD DATA ON MOUNT
  // ============================
  useEffect(() => {
    loadFollowUp();
  }, []);

  const loadFollowUp = async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const followUpItems = await getFollowUpItems();
      // Sort by due date ascending, null dates last
      const sorted = followUpItems.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });
      setItems(sorted);
    } catch (err) {
      // Detect network errors
      if (!err.response && err.message === 'Network error') {
        setError('Network error â€” check your connection');
      } else {
        setError(err.message || 'Failed to load follow-up items');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // CLIENT ACTION RULES (TIMESTAMP-BASED ONLY)
  // ============================
  const canStart = (item) => item.startedAt === null;
  const canComplete = (item) => item.startedAt !== null && item.completedAt === null;
  const canDelay = (item) => item.completedAt === null;

  // ============================
  // ACTION HANDLERS
  // ============================
  const handleStart = async (id) => {
    setActiveActionId(id);
    setActionError(null);

    try {
      await startActionItem(id);
      await loadFollowUp(); // Refresh list
    } catch (err) {
      // Map error types
      let userMessage = 'Failed to start action';
      if (err.response?.status === 403) {
        userMessage = 'You are not allowed to start this action';
      } else if (err.response?.status === 409) {
        userMessage = 'This action has already been started';
      } else if (!err.response) {
        userMessage = 'Network error â€” check your connection';
      } else if (err.message) {
        userMessage = err.message;
      }
      setActionError(userMessage);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleComplete = async (id) => {
    setActiveActionId(id);
    setActionError(null);

    try {
      await completeActionItem(id);
      await loadFollowUp(); // Refresh list
    } catch (err) {
      // Map error types
      let userMessage = 'Failed to complete action';
      if (err.response?.status === 403) {
        userMessage = 'You are not allowed to complete this action';
      } else if (err.response?.status === 409) {
        userMessage = 'This action is not in a valid state to be completed';
      } else if (!err.response) {
        userMessage = 'Network error â€” check your connection';
      } else if (err.message) {
        userMessage = err.message;
      }
      setActionError(userMessage);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelay = async (id) => {
    setActiveActionId(id);
    setActionError(null);

    try {
      await delayActionItem(id);
      await loadFollowUp(); // Refresh list
    } catch (err) {
      // Map error types
      let userMessage = 'Failed to delay action';
      if (err.response?.status === 403) {
        userMessage = 'You are not allowed to delay this action';
      } else if (err.response?.status === 409) {
        userMessage = 'This action cannot be delayed in its current state';
      } else if (!err.response) {
        userMessage = 'Network error â€” check your connection';
      } else if (err.message) {
        userMessage = err.message;
      }
      setActionError(userMessage);
    } finally {
      setActiveActionId(null);
    }
  };

  // ============================
  // RENDER ACTION BUTTONS
  // ============================
  const renderActionButtons = (item) => {
    const isProcessing = activeActionId === item.actionItemId;

    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {canStart(item) && (
          <Button
            size="sm"
            variant="solid"
            color="primary"
            onClick={() => handleStart(item.actionItemId)}
            disabled={isProcessing}
            loading={isProcessing}
          >
            Start
          </Button>
        )}
        {canComplete(item) && (
          <Button
            size="sm"
            variant="solid"
            color="success"
            onClick={() => handleComplete(item.actionItemId)}
            disabled={isProcessing}
            loading={isProcessing}
          >
            Complete
          </Button>
        )}
        {canDelay(item) && (
          <Button
            size="sm"
            variant="outlined"
            color="warning"
            onClick={() => handleDelay(item.actionItemId)}
            disabled={isProcessing}
            loading={isProcessing}
          >
            Delay
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
      <MainLayout pageTitle="Follow-Up Actions">
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
          <Typography level="body-lg">Loading follow-up items...</Typography>
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER ERROR STATE
  // ============================
  if (error) {
    return (
      <MainLayout pageTitle="Follow-Up Actions">
        <Box sx={{ p: 3 }}>
          <ErrorPanel message={error} retryAction={loadFollowUp} />
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER EMPTY STATE
  // ============================
  if (items.length === 0) {
    return (
      <MainLayout pageTitle="Follow-Up Actions">
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
            âœ… No follow-up action items assigned
          </Typography>
          <Typography level="body-md" sx={{ color: 'neutral.400' }}>
            You have no pending action items requiring your attention.
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  // ============================
  // RENDER FOLLOW-UP TABLE
  // ============================
  return (
    <MainLayout pageTitle="Follow-Up Actions">
      <Box sx={{ p: 3 }}>
        {/* Action Error Display */}
        {actionError && (
          <ErrorPanel message={actionError} sx={{ mb: 2 }} />
        )}

        <Card variant="outlined">
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography level="h4">Action Items ({items.length})</Typography>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={loadFollowUp}
              disabled={activeActionId !== null}
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
                <th style={{ width: '8%' }}>ID</th>
                <th style={{ width: '20%' }}>Title</th>
                <th style={{ width: '20%' }}>Description</th>
                <th style={{ width: '10%' }}>Subcase</th>
                <th style={{ width: '10%' }}>Due Date</th>
                <th style={{ width: '8%' }}>Status</th>
                <th style={{ width: '24%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.actionItemId}>
                  <td>
                    <Typography level="body-sm" fontWeight="bold">
                      #{item.actionItemId}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{item.title}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontSize: '0.85rem' }}>
                      {item.description || '-'}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      #{item.subcaseId}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      {item.dueDate ? item.dueDate.toLocaleDateString() : '-'}
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        item.completedAt
                          ? 'success'
                          : item.startedAt
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {item.status}
                    </Chip>
                  </td>
                  <td>{renderActionButtons(item)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Timestamp Details (Optional Debug Info) */}
        <Box sx={{ mt: 2, display: 'none' }}>
          <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
            Timestamps: Created â†’ Started â†’ Completed â†’ Verified
          </Typography>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default FollowUpPage;
