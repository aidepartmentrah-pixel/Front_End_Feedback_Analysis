/**
 * STEP 4.13 — Follow-Up Page (Phase 4 Workflow)
 * STEP 4.15 — Error & Denial UX Hardening
 * CALENDAR RESTORATION — Restored calendar UI with API v2 integration
 * B1 — Related case/complaint context view
 * B2 — Calendar click → highlight related case row
 * B3 — Operational grouping (Overdue / Active / Upcoming / Completed)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  Divider,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Table,
  Sheet,
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
import { exportActionLogByDateRange } from '../api/actionLogApi';
import { downloadBlob } from '../api/reports';
import { formatDueDate, getToday } from '../utils/dateOnly';

// ============================
// B3 — Operational grouping helpers
// ============================
const getOperationalGroup = (item) => {
  if (item.completedAt) return 'completed';
  if (!item.dueDate) return 'active';
  // item.dueDate is already a date-only value pinned to local midnight (see utils/dateOnly)
  const due = item.dueDate.getTime();
  const todayTime = getToday().getTime();
  if (due < todayTime) return 'overdue';
  if (due === todayTime) return 'active';
  return 'upcoming';
};

const FollowUpPage = () => {
  const { user } = useAuth();
  const canExportActionLog = canAccessDrawerNotes(user);

  // ============================
  // STATE
  // ============================
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Action detail modal
  const [selectedAction, setSelectedAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Delay dialog
  const [delayDialogOpen, setDelayDialogOpen] = useState(false);
  const [delayTargetId, setDelayTargetId] = useState(null);
  const [delayDays, setDelayDays] = useState(7);

  // FAB
  const [fabExpanded, setFabExpanded] = useState(false);

  // Action Log Export
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // B2 — selected action item id from calendar click
  const [selectedActionId, setSelectedActionId] = useState(null);
  const contextRowRefs = useRef({});

  // ============================
  // ADAPTER (API v2 → Calendar)
  // ============================
  const adaptItemsForCalendar = (apiItems) => {
    return apiItems.map(item => {
      let calendarStatus = 'pending';
      if (item.completedAt) {
        calendarStatus = 'completed';
      } else if (item.dueDate && item.dueDate.getTime() < getToday().getTime()) {
        // Strictly before today - "due today" is not yet delayed
        calendarStatus = 'delayed';
      }

      // Human-readable operational status for display in popup/tooltip
      let displayStatus;
      if (item.completedAt) {
        displayStatus = 'Completed';
      } else if (!item.dueDate) {
        displayStatus = 'Active';
      } else {
        const due = item.dueDate.getTime();
        const t = getToday().getTime();
        if (due < t) displayStatus = 'Overdue';
        else if (due === t) displayStatus = 'Due Today';
        else displayStatus = 'Upcoming';
      }

      const dueDateStr = formatDueDate(item.dueDate);

      return {
        id: item.actionItemId,
        actionTitle: item.title || 'Untitled Action',
        description: item.description || null,
        dueDate: dueDateStr,
        status: calendarStatus,
        displayStatus,
        // Case context for popup — no weak placeholders
        orgUnitName: item.orgUnitName || null,
        department: item.orgUnitName || null,
        incidentNumber: item.incidentNumber || null,
        patientName: item.patientName || null,
        caseDescription: item.caseDescription || null,
        severityName: item.severityName || null,
        // Only show "Unassigned" when truly unassigned; suppress the numeric-ID fallback
        assignedTo: item.assignedToUserId ? null : 'Unassigned',
        _original: item,
      };
    });
  };

  // ============================
  // LOAD DATA
  // ============================
  useEffect(() => {
    loadFollowUp();
  }, []);

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
      const sorted = followUpItems.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });
      setItems(sorted);
    } catch (err) {
      if (!err.response && err.message === 'Network error') {
        setError('Network error — check your connection');
      } else {
        setError(err.message || 'Failed to load follow-up items');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // ACTION LOG EXPORT
  // ============================
  const handleExportActionLog = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      setExportSuccess(false);
      const blob = await exportActionLogByDateRange(reportDateFrom, reportDateTo);
      downloadBlob(blob, `action_log_${reportDateFrom}_to_${reportDateTo}.docx`);
      setExportSuccess(true);
    } catch (err) {
      setExportError('فشل توليد التقرير');
      console.error('Action log export failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  // ============================
  // CLIENT ACTION RULES
  // ============================
  const canStart = (item) => item.startedAt === null;
  const canComplete = (item) => item.startedAt !== null && item.completedAt === null;
  const canDelay = (item) => item.completedAt === null;

  // ============================
  // ACTION HANDLERS
  // ============================
  const handleActionClick = (calendarAction) => {
    const originalItem = items.find(item => item.actionItemId === calendarAction.id);
    if (originalItem) {
      setSelectedAction(originalItem);
      setModalOpen(true);
      // B2 — select and scroll to context row
      setSelectedActionId(calendarAction.id);
      setTimeout(() => {
        const ref = contextRowRefs.current[calendarAction.id];
        if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  };

  const handleStart = async (id) => {
    setActiveActionId(id);
    setActionError(null);
    try {
      await startActionItem(id);
      await loadFollowUp();
      setModalOpen(false);
    } catch (err) {
      let userMessage = 'Failed to start action';
      if (err.response?.status === 403) userMessage = 'You are not allowed to start this action';
      else if (err.response?.status === 409) userMessage = 'This action has already been started';
      else if (!err.response) userMessage = 'Network error — check your connection';
      else if (err.message) userMessage = err.message;
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
      await loadFollowUp();
      setModalOpen(false);
    } catch (err) {
      let userMessage = 'Failed to complete action';
      if (err.response?.status === 403) userMessage = 'You are not allowed to complete this action';
      else if (err.response?.status === 409) userMessage = 'This action is not in a valid state to be completed';
      else if (!err.response) userMessage = 'Network error — check your connection';
      else if (err.message) userMessage = err.message;
      setActionError(userMessage);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelay = async (id) => {
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
      await loadFollowUp();
      setModalOpen(false);
    } catch (err) {
      let userMessage = 'Failed to delay action';
      if (err.response?.status === 403) userMessage = 'You are not allowed to delay this action';
      else if (err.response?.status === 409) userMessage = 'This action cannot be delayed in its current state';
      else if (!err.response) userMessage = 'Network error — check your connection';
      else if (err.message) userMessage = err.message;
      setActionError(userMessage);
    } finally {
      setActiveActionId(null);
      setDelayTargetId(null);
    }
  };

  // ============================
  // RENDER HELPERS
  // ============================
  const renderActionButtons = (item) => {
    const isProcessing = activeActionId === item.actionItemId;
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {canStart(item) && (
          <Button size="sm" variant="solid" color="primary"
            onClick={() => handleStart(item.actionItemId)}
            disabled={isProcessing} loading={isProcessing}>Start</Button>
        )}
        {canComplete(item) && (
          <Button size="sm" variant="solid" color="success"
            onClick={() => handleComplete(item.actionItemId)}
            disabled={isProcessing} loading={isProcessing}>Complete</Button>
        )}
        {canDelay(item) && (
          <Button size="sm" variant="outlined" color="warning"
            onClick={() => handleDelay(item.actionItemId)}
            disabled={isProcessing} loading={isProcessing}>Delay</Button>
        )}
      </Box>
    );
  };

  const renderStatusChip = (item) => {
    if (item.completedAt) return <Chip size="sm" color="success">Completed</Chip>;
    if (item.startedAt) return <Chip size="sm" color="primary">In Progress</Chip>;
    return <Chip size="sm" color="neutral">Not Started</Chip>;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    if (!(date instanceof Date)) return String(date);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ============================
  // B3 — Operational groups
  // ============================
  const overdue = items.filter(i => getOperationalGroup(i) === 'overdue');
  const active = items.filter(i => getOperationalGroup(i) === 'active');
  const upcoming = items.filter(i => getOperationalGroup(i) === 'upcoming');
  const completed = items.filter(i => getOperationalGroup(i) === 'completed');

  const groupConfig = [
    {
      key: 'overdue', label: 'Overdue', items: overdue, color: 'danger',
      bgColor: 'rgba(211,47,47,0.07)', borderColor: 'rgba(211,47,47,0.3)',
      subtitle: 'Due date has passed and action is not yet completed.',
    },
    {
      key: 'active', label: 'Due Today', items: active, color: 'primary',
      bgColor: 'rgba(25,118,210,0.06)', borderColor: 'rgba(25,118,210,0.25)',
      subtitle: 'Due today, or items without a set deadline.',
    },
    {
      key: 'upcoming', label: 'Upcoming', items: upcoming, color: 'warning',
      bgColor: 'rgba(237,108,2,0.06)', borderColor: 'rgba(237,108,2,0.25)',
      subtitle: 'Scheduled for a future date, not yet due.',
    },
    {
      key: 'completed', label: 'Completed', items: completed, color: 'success',
      bgColor: 'rgba(46,125,50,0.06)', borderColor: 'rgba(46,125,50,0.25)',
      subtitle: 'Action has been finished successfully.',
    },
  ];

  const OperationalGroupCard = ({ group }) => (
    <Card
      sx={{
        flex: '1 1 200px',
        minWidth: 190,
        p: 2,
        background: group.bgColor,
        border: `1px solid ${group.borderColor}`,
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>{group.label}</Typography>
        <Chip size="sm" color={group.color} variant="solid">{group.items.length}</Chip>
      </Box>
      {group.subtitle && (
        <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 1, lineHeight: 1.4 }}>
          {group.subtitle}
        </Typography>
      )}
      {group.items.length === 0 ? (
        <Typography level="body-xs" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>No items.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {group.items.slice(0, 3).map(item => (
            <Typography
              key={item.actionItemId}
              level="body-xs"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                '&:hover': { color: 'text.primary', textDecoration: 'underline' },
              }}
              onClick={() => {
                setSelectedActionId(item.actionItemId);
                setTimeout(() => {
                  const ref = contextRowRefs.current[item.actionItemId];
                  if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
              }}
              title={item.title}
            >
              · {item.title || 'Untitled'}
            </Typography>
          ))}
          {group.items.length > 3 && (
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              +{group.items.length - 3} more
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );

  // ============================
  // B1 — Case context table
  // ============================
  const CaseContextTable = () => (
    <Card sx={{ mt: 3, p: 0, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', background: 'rgba(102,126,234,0.05)' }}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          Related Case / Complaint Context
        </Typography>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.3 }}>
          Click a calendar item to highlight its related case below
        </Typography>
      </Box>
      {items.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>No action items loaded</Typography>
        </Box>
      ) : (
        <Sheet sx={{ overflow: 'auto' }}>
          <Table
            size="sm"
            stickyHeader
            sx={{
              '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
              minWidth: 900,
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th style={{ width: 180 }}>Action Item</th>
                <th style={{ width: 110 }}>Due Date</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 120 }}>Incident #</th>
                <th style={{ width: 140 }}>Patient Name</th>
                <th style={{ width: 200 }}>Complaint / Case Summary</th>
                <th style={{ width: 160 }}>Target Unit</th>
                <th style={{ width: 110 }}>Severity</th>
                <th style={{ width: 110 }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const isSelected = item.actionItemId === selectedActionId;
                const group = getOperationalGroup(item);
                const rowBg = isSelected
                  ? 'rgba(102,126,234,0.14)'
                  : group === 'overdue'
                    ? 'rgba(211,47,47,0.04)'
                    : undefined;

                return (
                  <tr
                    key={item.actionItemId}
                    ref={el => { contextRowRefs.current[item.actionItemId] = el; }}
                    onClick={() => setSelectedActionId(item.actionItemId)}
                    style={{
                      background: rowBg,
                      cursor: 'pointer',
                      outline: isSelected ? '2px solid rgba(102,126,234,0.55)' : undefined,
                      outlineOffset: isSelected ? '-2px' : undefined,
                      transition: 'background 0.2s',
                    }}
                  >
                    <td>
                      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>{idx + 1}</Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" sx={{ fontWeight: isSelected ? 700 : 500, wordBreak: 'break-word' }}>
                        {item.title || '—'}
                      </Typography>
                      {isSelected && (
                        <Chip size="sm" color="primary" variant="soft" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                          Selected
                        </Chip>
                      )}
                    </td>
                    <td>
                      <Typography level="body-xs">
                        {item.dueDate ? formatDate(item.dueDate) : '—'}
                      </Typography>
                      {group === 'overdue' && (
                        <Chip size="sm" color="danger" variant="soft" sx={{ mt: 0.3, fontSize: '0.6rem' }}>Overdue</Chip>
                      )}
                    </td>
                    <td>{renderStatusChip(item)}</td>
                    <td>
                      <Typography level="body-xs">
                        {item.incidentNumber || (item.incidentRequestCaseId ? `Case #${item.incidentRequestCaseId}` : '—')}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs">{item.patientName || '—'}</Typography>
                    </td>
                    <td>
                      <Typography
                        level="body-xs"
                        sx={{
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                        }}
                        title={item.caseDescription || undefined}
                      >
                        {item.caseDescription || '—'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs">{item.orgUnitName || `Subcase #${item.subcaseId}`}</Typography>
                    </td>
                    <td>
                      <Typography level="body-xs">{item.severityName || '—'}</Typography>
                    </td>
                    <td>
                      <Typography level="body-xs">{item.categoryName || '—'}</Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Sheet>
      )}
    </Card>
  );

  // ============================
  // RENDER
  // ============================
  if (loading) {
    return (
      <MainLayout pageTitle="📅 Calendar">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout pageTitle="📅 Calendar">
        <ErrorPanel message={error} retryAction={loadFollowUp} retryLabel="Retry" />
      </MainLayout>
    );
  }

  const calendarActions = adaptItemsForCalendar(items);

  return (
    <MainLayout pageTitle="📅 Calendar">
      <Box sx={{ maxWidth: '1600px', margin: '0 auto', padding: 2, paddingBottom: '120px' }}>

        {/* ============================
            B3 — Operational Summary Cards
        ============================ */}
        {items.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
            {groupConfig.map(g => (
              <OperationalGroupCard key={g.key} group={g} />
            ))}
          </Box>
        )}

        {/* ============================
            Main Calendar View
        ============================ */}
        <Box>
          {actionError && (
            <Box sx={{ mb: 2 }}>
              <ErrorPanel message={actionError} />
            </Box>
          )}

          <ActionCalendar
            actions={calendarActions}
            onActionClick={handleActionClick}
            onDeleteAction={(id) => handleComplete(id)}
            onDelayAction={(id) => handleDelay(id)}
            selectedActionId={selectedActionId}
          />

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

        {/* ============================
            B1 — Case Context Table
        ============================ */}
        <CaseContextTable />

        {/* ============================
            FAB — Action Log Export
        ============================ */}
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
                <Typography level="body-md" sx={{ fontWeight: 700, color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                  تقرير سجل الإجراءات
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <FormControl>
                    <FormLabel sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', mb: 0.5 }}>من تاريخ</FormLabel>
                    <Input
                      type="date"
                      size="sm"
                      value={reportDateFrom}
                      onChange={(e) => setReportDateFrom(e.target.value)}
                      sx={{ background: 'white', '&:hover': { background: 'white' } }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', mb: 0.5 }}>إلى تاريخ</FormLabel>
                    <Input
                      type="date"
                      size="sm"
                      value={reportDateTo}
                      onChange={(e) => setReportDateTo(e.target.value)}
                      sx={{ background: 'white', '&:hover': { background: 'white' } }}
                    />
                  </FormControl>
                  {reportDateFrom && reportDateTo && reportDateFrom > reportDateTo && (
                    <Alert color="danger" size="sm" sx={{ background: 'rgba(200,50,50,0.25)', color: 'white', backdropFilter: 'blur(10px)' }}>
                      تاريخ البداية يجب أن يكون قبل تاريخ النهاية
                    </Alert>
                  )}
                  <Button
                    size="md"
                    variant="solid"
                    loading={exportLoading}
                    disabled={!reportDateFrom || !reportDateTo || reportDateFrom > reportDateTo || exportLoading}
                    onClick={handleExportActionLog}
                    sx={{ width: '100%', background: 'white', color: '#667eea', fontWeight: 700, '&:hover': { background: 'rgba(255,255,255,0.9)' } }}
                  >
                    توليد التقرير
                  </Button>
                  {exportError && (
                    <Alert color="danger" size="sm" sx={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}>
                      {exportError}
                    </Alert>
                  )}
                  {exportSuccess && (
                    <Alert color="success" size="sm" sx={{ background: 'rgba(46,213,115,0.2)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(46,213,115,0.3)' }}>
                      ✅ تم تنزيل التقرير بنجاح
                    </Alert>
                  )}
                </Box>
              </Card>
            </Box>

            <Box
              sx={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: fabExpanded ? '0 12px 40px rgba(102,126,234,0.5)' : '0 8px 24px rgba(102,126,234,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: fabExpanded ? 'scale(1.1)' : 'scale(1)',
                '&:hover': { transform: 'scale(1.15) rotate(5deg)', boxShadow: '0 12px 40px rgba(102,126,234,0.6)' },
                '&:active': { transform: 'scale(1.05)' },
              }}
            >
              <DescriptionIcon sx={{ fontSize: 32, color: 'white', transition: 'transform 0.3s ease', transform: fabExpanded ? 'rotate(10deg)' : 'rotate(0deg)' }} />
            </Box>

            {!fabExpanded && (
              <Box
                sx={{
                  position: 'absolute', bottom: 0, right: 0, width: 64, height: 64,
                  borderRadius: '50%', border: '2px solid rgba(102,126,234,0.6)',
                  animation: 'ripple 2s infinite', pointerEvents: 'none',
                  '@keyframes ripple': { '0%': { transform: 'scale(1)', opacity: 1 }, '100%': { transform: 'scale(1.5)', opacity: 0 } },
                }}
              />
            )}
          </Box>
        )}

        {/* ============================
            ACTION DETAIL MODAL
        ============================ */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <ModalDialog sx={{ minWidth: 500, maxWidth: 700 }}>
            <ModalClose />
            <Typography level="h5" sx={{ mb: 2 }}>Action Item Details</Typography>
            <Divider sx={{ mb: 2 }} />
            {selectedAction && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>Title</Typography>
                  <Typography level="body-md">{selectedAction.title || 'Untitled'}</Typography>
                </Box>
                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>Description</Typography>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    {selectedAction.description || 'No description'}
                  </Typography>
                </Box>
                {/* Case context in modal */}
                {(selectedAction.incidentNumber || selectedAction.patientName || selectedAction.caseDescription) && (
                  <>
                    <Divider />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                      {selectedAction.incidentNumber && (
                        <Box>
                          <Typography level="body-xs" sx={{ fontWeight: 600, mb: 0.3, color: 'text.tertiary' }}>Incident #</Typography>
                          <Typography level="body-sm">{selectedAction.incidentNumber}</Typography>
                        </Box>
                      )}
                      {selectedAction.patientName && (
                        <Box>
                          <Typography level="body-xs" sx={{ fontWeight: 600, mb: 0.3, color: 'text.tertiary' }}>Patient</Typography>
                          <Typography level="body-sm">{selectedAction.patientName}</Typography>
                        </Box>
                      )}
                      {selectedAction.orgUnitName && (
                        <Box>
                          <Typography level="body-xs" sx={{ fontWeight: 600, mb: 0.3, color: 'text.tertiary' }}>Unit</Typography>
                          <Typography level="body-sm">{selectedAction.orgUnitName}</Typography>
                        </Box>
                      )}
                      {selectedAction.severityName && (
                        <Box>
                          <Typography level="body-xs" sx={{ fontWeight: 600, mb: 0.3, color: 'text.tertiary' }}>Severity</Typography>
                          <Typography level="body-sm">{selectedAction.severityName}</Typography>
                        </Box>
                      )}
                    </Box>
                    {selectedAction.caseDescription && (
                      <Box>
                        <Typography level="body-xs" sx={{ fontWeight: 600, mb: 0.3, color: 'text.tertiary' }}>Complaint Summary</Typography>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>{selectedAction.caseDescription}</Typography>
                      </Box>
                    )}
                    <Divider />
                  </>
                )}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>Status</Typography>
                    {renderStatusChip(selectedAction)}
                  </Box>
                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>Due Date</Typography>
                    <Typography level="body-sm">{formatDate(selectedAction.dueDate)}</Typography>
                  </Box>
                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>Started At</Typography>
                    <Typography level="body-sm">{formatDate(selectedAction.startedAt)}</Typography>
                  </Box>
                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 600, mb: 0.5 }}>Completed At</Typography>
                    <Typography level="body-sm">{formatDate(selectedAction.completedAt)}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  {canStart(selectedAction) && (
                    <Button variant="solid" color="primary"
                      onClick={() => handleStart(selectedAction.actionItemId)}
                      disabled={activeActionId === selectedAction.actionItemId}
                      loading={activeActionId === selectedAction.actionItemId}>Start Action</Button>
                  )}
                  {canComplete(selectedAction) && (
                    <Button variant="solid" color="success"
                      onClick={() => handleComplete(selectedAction.actionItemId)}
                      disabled={activeActionId === selectedAction.actionItemId}
                      loading={activeActionId === selectedAction.actionItemId}>Complete</Button>
                  )}
                  {canDelay(selectedAction) && (
                    <Button variant="outlined" color="warning"
                      onClick={() => handleDelay(selectedAction.actionItemId)}
                      disabled={activeActionId === selectedAction.actionItemId}
                      loading={activeActionId === selectedAction.actionItemId}>Delay</Button>
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
                slotProps={{ input: { min: 1, max: 90 } }}
              />
              <FormHelperText>Enter a value between 1 and 90 days</FormHelperText>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="plain" color="neutral" onClick={() => setDelayDialogOpen(false)}>Cancel</Button>
              <Button variant="solid" color="warning" onClick={handleDelayConfirm}
                disabled={!delayDays || delayDays < 1 || delayDays > 90}>Confirm Delay</Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </MainLayout>
  );
};

export default FollowUpPage;
