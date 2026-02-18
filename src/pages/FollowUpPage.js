/**
 * STEP 4.13 — Follow-Up Page (Phase 4 Workflow)
 * STEP 4.15 — Error & Denial UX Hardening
 * CALENDAR RESTORATION — Restored calendar UI with API v2 integration
 * 
 * Purpose:
 * - Displays assigned workflow action items for current authenticated user
 * - Uses workflowApi follow-up endpoints (API v2)
 * - Calendar-based visual interface with monthly view
 * - UI action rules are timestamp-based only (no allowedActions from backend)
 * 
 * Architecture:
 * - Uses workflowApi.getFollowUpItems() ONLY (no direct API calls)
 * - Button visibility derived from timestamp fields (startedAt, completedAt)
 * - No role logic, no permission checks in UI
 * - No workflow business logic duplication
 * - Calendar component displays actions by due date
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
  Button,
  CircularProgress,
  Chip,
  Select,
  Option,
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  Divider,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/joy';
import DescriptionIcon from '@mui/icons-material/Description';
import ErrorPanel from '../components/common/ErrorPanel';
import MainLayout from '../components/common/MainLayout';
import ActionCalendar from '../components/followUp/ActionCalendar';
import { useAuth } from '../context/AuthContext';
import { canAccessDrawerNotes } from '../utils/roleGuards';
import {
  getFollowUpItems,
  startActionItem,
  completeActionItem,
  delayActionItem,
} from '../api/workflowApi';
import { exportActionLog } from '../api/actionLogApi';
import { downloadBlob } from '../api/reports';
import { getAvailableQuarters } from '../api/seasonalReports';

const FollowUpPage = () => {
  // ============================
  // AUTH
  // ============================
  const { user } = useAuth();

  // Phase F — Action Log visible only to SOFTWARE_ADMIN + WORKER
  const canExportActionLog = canAccessDrawerNotes(user);

  // ============================
  // STATE
  // ============================
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null); // Track which action is being processed
  const [actionError, setActionError] = useState(null);

  // Action detail modal state
  const [selectedAction, setSelectedAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Delay dialog state
  const [delayDialogOpen, setDelayDialogOpen] = useState(false);
  const [delayTargetId, setDelayTargetId] = useState(null);
  const [delayDays, setDelayDays] = useState(7);

  // FAB (Floating Action Button) state
  const [fabExpanded, setFabExpanded] = useState(false);

  // Action Log Export State
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // ============================
  // ADAPTER FUNCTIONS (API v2 → Calendar Format)
  // ============================
  /**
   * Convert API v2 action items to calendar-compatible format
   * API v2: { actionItemId, title, description, dueDate (Date), startedAt, completedAt, status }
   * Calendar: { id, actionTitle, description, dueDate (YYYY-MM-DD string), status, department, assignedTo }
   */
  const adaptItemsForCalendar = (apiItems) => {
    return apiItems.map(item => {
      // Determine status for calendar
      let calendarStatus = 'pending';
      if (item.completedAt) {
        calendarStatus = 'completed';
      } else if (item.dueDate && new Date(item.dueDate) < new Date()) {
        calendarStatus = 'delayed';
      }

      // Format due date as YYYY-MM-DD string
      const dueDateStr = item.dueDate instanceof Date 
        ? item.dueDate.toISOString().split('T')[0]
        : item.dueDate 
          ? new Date(item.dueDate).toISOString().split('T')[0]
          : null;

      return {
        id: item.actionItemId,
        actionTitle: item.title || 'Untitled Action',
        description: item.description || '',
        dueDate: dueDateStr,
        status: calendarStatus,
        department: `Subcase #${item.subcaseId}`,
        assignedTo: item.assignedToUserId ? `User ${item.assignedToUserId}` : 'Unassigned',
        // Keep original item for reference
        _original: item
      };
    });
  };

  // ============================
  // LOAD DATA ON MOUNT
  // ============================
  useEffect(() => {
    loadFollowUp();
    loadAvailableSeasons();
  }, []);

  // ============================
  // AUTO-CLEAR SUCCESS MESSAGE
  // ============================
  useEffect(() => {
    if (!exportSuccess) return;
    const timer = setTimeout(() => setExportSuccess(false), 2500);
    return () => clearTimeout(timer);
  }, [exportSuccess]);

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
        setError('Network error — check your connection');
      } else {
        setError(err.message || 'Failed to load follow-up items');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSeasons = async () => {
    try {
      const seasons = await getAvailableQuarters(1, 0);
      setAvailableSeasons(seasons);
      // Auto-select first season if available
      if (seasons.length > 0) {
        setSelectedSeasonId(seasons[0].SeasonID || seasons[0].season_id);
      }
    } catch (err) {
      console.error('Failed to load available seasons:', err);
      // Non-critical error - don't block page load
    }
  };

  // ============================
  // ACTION LOG EXPORT HANDLER
  // ============================
  const handleExportActionLog = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      setExportSuccess(false);

      const blob = await exportActionLog(selectedSeasonId);

      downloadBlob(blob, `action_log_season_${selectedSeasonId}.docx`);
      
      setExportSuccess(true);
    } catch (err) {
      setExportError('فشل توليد التقرير');
      console.error('Action log export failed:', err);
    } finally {
      setExportLoading(false);
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
  const handleActionClick = (calendarAction) => {
    // Find original item
    const originalItem = items.find(item => item.actionItemId === calendarAction.id);
    if (originalItem) {
      setSelectedAction(originalItem);
      setModalOpen(true);
    }
  };

  const handleStart = async (id) => {
    setActiveActionId(id);
    setActionError(null);

    try {
      await startActionItem(id);
      await loadFollowUp(); // Refresh list
      setModalOpen(false);
    } catch (err) {
      // Map error types
      let userMessage = 'Failed to start action';
      if (err.response?.status === 403) {
        userMessage = 'You are not allowed to start this action';
      } else if (err.response?.status === 409) {
        userMessage = 'This action has already been started';
      } else if (!err.response) {
        userMessage = 'Network error — check your connection';
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
      setModalOpen(false);
    } catch (err) {
      // Map error types
      let userMessage = 'Failed to complete action';
      if (err.response?.status === 403) {
        userMessage = 'You are not allowed to complete this action';
      } else if (err.response?.status === 409) {
        userMessage = 'This action is not in a valid state to be completed';
      } else if (!err.response) {
        userMessage = 'Network error — check your connection';
      } else if (err.message) {
        userMessage = err.message;
      }
      setActionError(userMessage);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelay = async (id) => {
    // Open delay dialog instead of firing immediately
    setDelayTargetId(id);
    setDelayDays(7);
    setDelayDialogOpen(true);
  };

  const handleDelayConfirm = async () => {
    if (!delayTargetId) return;

    setActiveActionId(delayTargetId);
    setActionError(null);
    setDelayDialogOpen(false);

    try {
      await delayActionItem(delayTargetId, delayDays);
      await loadFollowUp(); // Refresh list
      setModalOpen(false);
    } catch (err) {
      // Map error types
      let userMessage = 'Failed to delay action';
      if (err.response?.status === 403) {
        userMessage = 'You are not allowed to delay this action';
      } else if (err.response?.status === 409) {
        userMessage = 'This action cannot be delayed in its current state';
      } else if (!err.response) {
        userMessage = 'Network error — check your connection';
      } else if (err.message) {
        userMessage = err.message;
      }
      setActionError(userMessage);
    } finally {
      setActiveActionId(null);
      setDelayTargetId(null);
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
  // RENDER STATUS CHIPS
  // ============================
  const renderStatusChip = (item) => {
    if (item.completedAt) {
      return <Chip size="sm" color="success">Completed</Chip>;
    }
    if (item.startedAt) {
      return <Chip size="sm" color="primary">In Progress</Chip>;
    }
    return <Chip size="sm" color="neutral">Not Started</Chip>;
  };

  // ============================
  // FORMAT DATES
  // ============================
  const formatDate = (date) => {
    if (!date) return "—";
    if (!(date instanceof Date)) return String(date);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================
  // RENDER
  // ============================
  if (loading) {
    return (
      <MainLayout pageTitle="📅 Follow-Up Actions">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout pageTitle="📅 Follow-Up Actions">
        <ErrorPanel
          message={error}
          retryAction={loadFollowUp}
          retryLabel="Retry"
        />
      </MainLayout>
    );
  }

  // Adapt items for calendar
  const calendarActions = adaptItemsForCalendar(items);

  return (
    <MainLayout pageTitle="📅 Follow-Up Actions">
      <Box sx={{ maxWidth: '1600px', margin: '0 auto', padding: 2, paddingBottom: '550px' }}>
        {/* Main Calendar View - Full Width */}
        <Box>
          {actionError && (
            <Box sx={{ mb: 2 }}>
              <ErrorPanel message={actionError} />
            </Box>
          )}

          {/* Always show calendar, even if empty */}
          <ActionCalendar
            actions={calendarActions}
            onActionClick={handleActionClick}
            onDeleteAction={(id) => handleComplete(id)}
            onDelayAction={(id) => handleDelay(id)}
          />

          {/* Show empty state message below calendar if no items */}
          {items.length === 0 && (
            <Card sx={{ p: 3, textAlign: 'center', mt: 2, background: 'rgba(102, 126, 234, 0.05)' }}>
              <Typography level="body-md" sx={{ color: 'text.secondary', mb: 0.5 }}>
                📭 No follow-up actions assigned
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                New action items will appear on the calendar when workflow transitions occur.
              </Typography>
            </Card>
          )}
        </Box>

        {/* Floating Action Button (FAB) - Action Log Export - Only for SOFTWARE_ADMIN + WORKER */}
        {canExportActionLog && (
          <Box
            onMouseEnter={() => setFabExpanded(true)}
            onMouseLeave={() => setFabExpanded(false)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 1.5,
            }}
          >
            {/* Expanded Controls - Appear on Hover */}
            <Box
              sx={{
                opacity: fabExpanded ? 1 : 0,
                transform: fabExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: fabExpanded ? 'auto' : 'none',
                transformOrigin: 'bottom right',
              }}
            >
              <Card
                sx={{
                  p: 2.5,
                  minWidth: 320,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                  border: 'none',
                }}
              >
                <Typography 
                  level="body-md" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'white', 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                  تقرير سجل الإجراءات
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Select
                    size="sm"
                    placeholder="اختر الموسم"
                    value={selectedSeasonId}
                    onChange={(e, value) => setSelectedSeasonId(value)}
                    sx={{ 
                      width: '100%',
                      background: 'white',
                      '&:hover': {
                        background: 'white'
                      }
                    }}
                  >
                    {availableSeasons.map((season) => (
                      <Option
                        key={season.SeasonID || season.season_id}
                        value={season.SeasonID || season.season_id}
                      >
                        {season.SeasonName || season.name}
                      </Option>
                    ))}
                  </Select>

                  <Button
                    size="md"
                    variant="solid"
                    loading={exportLoading}
                    disabled={!selectedSeasonId || exportLoading}
                    onClick={handleExportActionLog}
                    sx={{ 
                      width: '100%',
                      background: 'white',
                      color: '#667eea',
                      fontWeight: 700,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    توليد التقرير
                  </Button>

                  {exportError && (
                    <Alert 
                      color="danger" 
                      size="sm"
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {exportError}
                    </Alert>
                  )}

                  {exportSuccess && (
                    <Alert 
                      color="success" 
                      size="sm"
                      sx={{
                        background: 'rgba(46, 213, 115, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(46, 213, 115, 0.3)',
                      }}
                    >
                      ✅ تم تنزيل التقرير بنجاح
                    </Alert>
                  )}
                </Box>
              </Card>
            </Box>

            {/* FAB Main Button - Always Visible */}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: fabExpanded 
                  ? '0 12px 40px rgba(102, 126, 234, 0.5)' 
                  : '0 8px 24px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: fabExpanded ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(0deg)',
                '&:hover': {
                  transform: 'scale(1.15) rotate(5deg)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.6)',
                },
                '&:active': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <DescriptionIcon 
                sx={{ 
                  fontSize: 32, 
                  color: 'white',
                  transition: 'transform 0.3s ease',
                  transform: fabExpanded ? 'rotate(10deg)' : 'rotate(0deg)',
                }} 
              />
            </Box>

            {/* Ripple effect indicator */}
            {!fabExpanded && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '2px solid rgba(102, 126, 234, 0.6)',
                  animation: 'ripple 2s infinite',
                  pointerEvents: 'none',
                  '@keyframes ripple': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '100%': {
                      transform: 'scale(1.5)',
                      opacity: 0,
                    },
                  },
                }}
              />
            )}
          </Box>
        )}

        {/* Action Detail Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <ModalDialog sx={{ minWidth: 500, maxWidth: 700 }}>
            <ModalClose />
            <Typography level="h5" sx={{ mb: 2 }}>
              Action Item Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {selectedAction && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Title
                  </Typography>
                  <Typography level="body-md">{selectedAction.title || 'Untitled'}</Typography>
                </Box>

                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Description
                  </Typography>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    {selectedAction.description || 'No description'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Status
                    </Typography>
                    {renderStatusChip(selectedAction)}
                  </Box>

                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Due Date
                    </Typography>
                    <Typography level="body-sm">{formatDate(selectedAction.dueDate)}</Typography>
                  </Box>

                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Started At
                    </Typography>
                    <Typography level="body-sm">{formatDate(selectedAction.startedAt)}</Typography>
                  </Box>

                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Completed At
                    </Typography>
                    <Typography level="body-sm">{formatDate(selectedAction.completedAt)}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  {canStart(selectedAction) && (
                    <Button
                      variant="solid"
                      color="primary"
                      onClick={() => handleStart(selectedAction.actionItemId)}
                      disabled={activeActionId === selectedAction.actionItemId}
                      loading={activeActionId === selectedAction.actionItemId}
                    >
                      Start Action
                    </Button>
                  )}
                  {canComplete(selectedAction) && (
                    <Button
                      variant="solid"
                      color="success"
                      onClick={() => handleComplete(selectedAction.actionItemId)}
                      disabled={activeActionId === selectedAction.actionItemId}
                      loading={activeActionId === selectedAction.actionItemId}
                    >
                      Complete
                    </Button>
                  )}
                  {canDelay(selectedAction) && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => handleDelay(selectedAction.actionItemId)}
                      disabled={activeActionId === selectedAction.actionItemId}
                      loading={activeActionId === selectedAction.actionItemId}
                    >
                      Delay
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </ModalDialog>
        </Modal>

        {/* ============================
            DELAY DIALOG
        ============================ */}
        <Modal open={delayDialogOpen} onClose={() => setDelayDialogOpen(false)}>
          <ModalDialog variant="outlined" role="alertdialog" sx={{ maxWidth: 400 }}>
            <ModalClose />
            <Typography level="h4">Delay Action Item</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography level="body-md" sx={{ mb: 2 }}>
              Choose the number of days to extend the due date.
            </Typography>
            <FormControl>
              <FormLabel>Delay Days</FormLabel>
              <Input
                type="number"
                value={delayDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setDelayDays(Math.max(1, Math.min(90, val)));
                }}
                slotProps={{
                  input: { min: 1, max: 90 }
                }}
              />
              <FormHelperText>Enter a value between 1 and 90 days</FormHelperText>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="plain"
                color="neutral"
                onClick={() => setDelayDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="warning"
                onClick={handleDelayConfirm}
                disabled={!delayDays || delayDays < 1 || delayDays > 90}
              >
                Confirm Delay
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </MainLayout>
  );
};

export default FollowUpPage;
