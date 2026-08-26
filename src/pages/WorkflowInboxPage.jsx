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
import { Box, Card, Typography, Table, Chip, Button, CircularProgress, Tabs, TabList, Tab, TabPanel, Input } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import FlagIcon from '@mui/icons-material/Flag';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CampaignIcon from '@mui/icons-material/Campaign';
import BarChartIcon from '@mui/icons-material/BarChart';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/common/MainLayout';
import ErrorPanel from '../components/common/ErrorPanel';
import {
  getWorkflowInbox,
  getWorkflowInboxArchive,
  getUnacknowledgedSupervisorActionItems,
  getUnacknowledgedActionItemChangeNotices,
} from '../api/workflowApi';
import CaseReviewModal from '../components/workflow/CaseReviewModal';
import SeasonalReportViewerModal from '../components/workflow/SeasonalReportViewerModal';
import PatientServicesDecisionModal from '../components/workflow/PatientServicesDecisionModal';
import NoticeModal from '../components/workflow/NoticeModal';
import ActionItemNoticeModal from '../components/workflow/ActionItemNoticeModal';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';
import { getRowTheme } from '../utils/inboxTheme';
import { classifyInboxArea, splitInboxAreas } from '../utils/inboxClassifier';
import { getDeadlineCountdown, isCountdownEligible } from '../utils/deadlineCountdown';

// Maps iconKey strings (returned by inboxTheme) → MUI icon components
const TYPE_ICON_MAP = {
  Campaign:     <CampaignIcon    sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />,
  BarChart:     <BarChartIcon    sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />,
  CheckCircle:  <CheckCircleIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />,
  Assignment:   <AssignmentIcon  sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />,
};

const BADGE_ICON_MAP = {
  Lock:         <LockIcon         sx={{ fontSize: 12 }} />,
  History:      <HistoryIcon      sx={{ fontSize: 12 }} />,
  Flag:         <FlagIcon         sx={{ fontSize: 12 }} />,
  WarningAmber: <WarningAmberIcon sx={{ fontSize: 12 }} />,
  Favorite:     <FavoriteIcon     sx={{ fontSize: 12 }} />,
};

const WorkflowInboxPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();


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

  // Case type filter state: 'all', 'incident', 'notice', 'seasonal'
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');

  // Column sort state — defaults to Publication Date, newest first.
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'sourceUnit' | 'targetUnit'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Unified review modal — covers all workflow actions for incident cases
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalItem, setReviewModalItem] = useState(null);

  // Seasonal report viewer
  const [seasonalViewerOpen, setSeasonalViewerOpen] = useState(false);
  const [seasonalViewerItem, setSeasonalViewerItem] = useState(null);

  // Patient Services decision viewer (read-only: archive view of completed decisions)
  const [decisionViewerOpen, setDecisionViewerOpen] = useState(false);
  const [decisionViewerItem, setDecisionViewerItem] = useState(null);

  // Notice modal (informational notice items)
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeModalItem, setNoticeModalItem] = useState(null);

  // Action item notice modal (AIC-S7 — assignment / change notifications)
  const [actionItemNoticeModalOpen, setActionItemNoticeModalOpen] = useState(false);
  const [actionItemNoticeModalItem, setActionItemNoticeModalItem] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');


  // ============================
  // LOAD INBOX ON MOUNT
  // ============================
  useEffect(() => {
    loadInbox();
  }, []);

  // AIC-S7 — turn a raw assignment/change notice into an inbox-row-shaped item.
  // Merged client-side (same pattern as the Calendar's supervisor-action-item
  // merge) since these come from tables outside the subcase-driven inbox query.
  const toAssignedNoticeRow = (n) => ({
    ...n,
    subcaseId: n.subcaseId,
    status: 'ACTION_ITEM_ASSIGNED_NOTICE',
    targetOrgUnitName: n.targetOrgUnitName,
    targetOrgUnitId: n.targetOrgUnitId,
    displayDate: n.createdAt,
    allowedActions: [],
  });
  const toChangedNoticeRow = (n) => ({
    ...n,
    subcaseId: n.subcaseId,
    status: 'ACTION_ITEM_CHANGED_NOTICE',
    targetOrgUnitName: null,
    targetOrgUnitId: null,
    displayDate: n.changedAt,
    allowedActions: [],
  });

  const loadInbox = async () => {
    setLoading(true);
    setError(null);

    try {
      const [inboxItems, assignedNotices, changedNotices] = await Promise.all([
        getWorkflowInbox(),
        getUnacknowledgedSupervisorActionItems(),
        getUnacknowledgedActionItemChangeNotices(),
      ]);
      setItems([
        ...assignedNotices.map(toAssignedNoticeRow),
        ...changedNotices.map(toChangedNoticeRow),
        ...inboxItems,
      ]);
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
  // MODAL HANDLERS
  // ============================

  const openReviewModal = (item) => {
    setReviewModalItem(item);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    setReviewModalOpen(false);
    setReviewModalItem(null);
    loadInbox();
  };

  const handleSeasonalView = (item) => {
    setSeasonalViewerItem(item);
    setSeasonalViewerOpen(true);
  };


  // ============================
  // CASE TYPE & ID HELPERS
  // ============================
  const isNoticeItem = (item) => item.messageType === 'NOTICE';

  // Patient Services decision has arrived — section/dept/admin must acknowledge it.
  // Opens PatientServicesDecisionModal in readOnly mode with acknowledge action.
  const isDecisionArrivedItem = (item) =>
    item.messageType === 'DECISION_TAKEN' &&
    item.allowedActions?.includes('acknowledge_decision');

  // AIC-S7 — Action Item assignment/change notifications. Pure notification
  // side-channel, no complaint workflow — routed to ActionItemNoticeModal.
  const isActionItemNoticeItem = (item) =>
    item.messageType === 'ACTION_ITEM_ASSIGNED' || item.messageType === 'ACTION_ITEM_CHANGED';

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
    if (isActionItemNoticeItem(item)) {
      return item.messageType === 'ACTION_ITEM_ASSIGNED' ? 'مهمة جديدة' : 'تعديل على بند';
    }
    if (isIncidentItem(item) && item.incidentId) {
      return `Case #${item.incidentId}`;
    }
    if (item.seasonalReportId) {
      return `Report #${item.seasonalReportId}`;
    }
    return `#${item.subcaseId}`;
  };

  /**
   * Filter items by search query (searches by incident number, case ID, subcase ID)
   */
  const filterBySearch = (itemsList) => {
    if (!searchQuery.trim()) return itemsList;
    const query = searchQuery.trim().toLowerCase();
    return itemsList.filter(item => {
      // Search by INC-XXXXXX incident number
      if (item.incidentNumber && item.incidentNumber.toLowerCase().includes(query)) return true;
      // Search by numeric case ID or formatted "Case #X"
      if (item.incidentId && String(item.incidentId).includes(query)) return true;
      if (item.seasonalReportId && String(item.seasonalReportId).includes(query)) return true;
      if (item.subcaseId && String(item.subcaseId).includes(query)) return true;
      // Also search the formatted display ID (e.g. "case #5")
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
      // AIC-S7 notices aren't incident/seasonal cases — always show them.
      if (isActionItemNoticeItem(item)) return true;
      if (caseTypeFilter === 'incident') return isIncidentItem(item) && !isNoticeItem(item);
      if (caseTypeFilter === 'notice') return isNoticeItem(item);
      if (caseTypeFilter === 'seasonal') return !isIncidentItem(item);
      return true;
    });
  };

  // ============================
  // FILTER CHIP BAR
  // ============================
  const CASE_TYPE_FILTER_OPTIONS = [
    { value: 'all', label: 'All', icon: RadioButtonUncheckedIcon, iconColor: null },
    { value: 'incident', label: 'Complaints', icon: ErrorOutlineIcon, iconColor: '#0B6BCB' },
    { value: 'notice', label: 'Notices', icon: CampaignIcon, iconColor: '#0E7490' },
    { value: 'seasonal', label: 'Seasonal', icon: BarChartIcon, iconColor: '#B45309' },
  ];

  const renderChipRow = (options, value, onSelect, label) => (
    <Box>
      {label && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <FilterAltIcon sx={{ fontSize: 16, color: theme.colors.textTertiary }} />
          <Typography level="body-sm" sx={{ color: theme.colors.textTertiary, fontWeight: 600 }}>
            {label}
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const selected = value === opt.value;
          const Icon = opt.icon;
          return (
            <Chip
              key={opt.value}
              size="lg"
              variant={selected ? 'solid' : 'outlined'}
              startDecorator={
                Icon && <Icon sx={{ fontSize: 18, color: selected ? theme.colors.textOnPrimary : (opt.iconColor || theme.colors.textTertiary) }} />
              }
              onClick={() => onSelect(opt.value)}
              sx={{
                borderRadius: '999px',
                px: 2,
                py: 0.75,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                // Joy Chip's variant styling is driven by CSS custom properties, not
                // plain background/color — a plain sx backgroundColor override loses
                // to Joy's own --variant-solidBg. Set the variables Joy itself reads.
                '--variant-solidBg': selected ? theme.colors.primary : undefined,
                '--variant-solidColor': selected ? theme.colors.textOnPrimary : undefined,
                '--variant-solidHoverBg': selected ? theme.colors.primaryHover : undefined,
                '--variant-outlinedBorder': !selected ? theme.colors.border : undefined,
                '--variant-outlinedColor': !selected ? theme.colors.textPrimary : undefined,
                '--variant-outlinedBg': !selected ? theme.colors.surface : undefined,
                '--variant-outlinedHoverBg': !selected ? theme.colors.surfaceHover : undefined,
              }}
            >
              {opt.label}
            </Chip>
          );
        })}
      </Box>
    </Box>
  );

  const renderCaseTypeChips = () => renderChipRow(CASE_TYPE_FILTER_OPTIONS, caseTypeFilter, setCaseTypeFilter, 'Filter by Type');

  /**
   * Combined filter: search + case type
   */
  const applyFilters = (itemsList) => {
    return filterByCaseType(filterBySearch(itemsList));
  };

  // ============================
  // COLUMN SORT (Source Unit / Target Unit / Publication Date)
  // ============================
  const sortItems = (itemsList) => {
    const dir = sortOrder === 'asc' ? 1 : -1;
    return [...itemsList].sort((a, b) => {
      if (sortBy === 'sourceUnit') {
        return dir * String(a.issuingOrgUnitName || '').localeCompare(String(b.issuingOrgUnitName || ''));
      }
      if (sortBy === 'targetUnit') {
        return dir * String(a.targetOrgUnitName || '').localeCompare(String(b.targetOrgUnitName || ''));
      }
      // 'date'
      const aDate = a.displayDate || a.createdAt;
      const bDate = b.displayDate || b.createdAt;
      return dir * ((aDate?.getTime?.() ?? 0) - (bDate?.getTime?.() ?? 0));
    });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'date' ? 'desc' : 'asc');
    }
  };

  const renderSortableHeader = (label, column, widthPct) => (
    <th
      style={{ width: `${widthPct}%`, cursor: 'pointer', userSelect: 'none' }}
      onClick={() => handleSort(column)}
    >
      {label}{sortBy === column ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

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
      WAITING_PATIENT_SERVICES_DECISION: { label: 'Customer Service Decision Required', color: 'warning' },
      PATIENT_SERVICES_DECISION_COMPLETED: { label: 'Customer Service Decision Completed', color: 'success' },
      // HCAT Automatic Force Close Policy (Session 6) - force-closed-by-policy statuses
      FORCE_CLOSED_AT_SECTION: { label: 'Force-Closed (Section) — مغلق قسريا', color: 'danger' },
      FORCE_CLOSED_AT_DEPARTMENT: { label: 'Force-Closed (Department) — مغلق قسريا', color: 'danger' },
      FORCE_CLOSED_AT_ADMINISTRATION: { label: 'Force-Closed (Administration) — مغلق قسريا', color: 'danger' },
      // AIC-S7 — Action Item Notifications
      ACTION_ITEM_ASSIGNED_NOTICE: { label: 'New Assignment', color: 'primary' },
      ACTION_ITEM_CHANGED_NOTICE: { label: 'Item Changed', color: 'warning' },
    };
    return statusMap[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', color: 'neutral' };
  };

  /**
   * HCAT Automatic Force Close Policy (Session 6)
   * Map a workflow status to the responsibility level it currently sits at,
   * so late-reply / extra-time indicators reflect the right level's fields.
   */
  const getCurrentLevel = (status) => {
    if (status?.startsWith('FORCE_CLOSED_AT_')) {
      return status.replace('FORCE_CLOSED_AT_', '').toLowerCase();
    }
    if (['SUBMITTED_TO_SECTION', 'RETURNED_TO_SECTION_FOR_REVISION', 'SECTION_DENIED'].includes(status)) {
      return 'section';
    }
    if (['SECTION_ACCEPTED_PENDING_DEPT', 'RETURNED_TO_DEPT_FOR_REVISION', 'RETURNED_TO_DEPARTMENT_FOR_REVISION'].includes(status)) {
      return 'department';
    }
    if (['DEPT_ACCEPTED_PENDING_ADMIN', 'WAITING_PATIENT_SERVICES_DECISION', 'PATIENT_SERVICES_DECISION_COMPLETED'].includes(status)) {
      return 'administration';
    }
    return null;
  };

  /**
   * HCAT Automatic Force Close Policy (Session 6)
   * Small late-reply / extra-time chips for the level the case currently sits at.
   */
  const getLevelIndicatorChips = (item) => {
    const level = getCurrentLevel(item.status);
    if (!level) return [];
    const chips = [];
    if (item[`${level}LateReply`]) {
      chips.push({ key: 'late-reply', label: 'رد متأخر', color: 'warning' });
    }
    if (item[`${level}ExtraTimeGrantedAt`]) {
      chips.push({ key: 'extra-time', label: 'مهلة إضافية', color: 'warning' });
    }
    return chips;
  };

  // ============================
  // RENDER ACTION BUTTONS
  // ============================
  const renderActionButtons = (item) => {
    const { allowedActions } = item;

    // AIC-S7 — Action Item assignment/change notifications — no complaint workflow
    if (isActionItemNoticeItem(item)) {
      return (
        <Button
          size="sm"
          variant="solid"
          color="primary"
          onClick={() => { setActionItemNoticeModalItem(item); setActionItemNoticeModalOpen(true); }}
        >
          عرض الإشعار
        </Button>
      );
    }

    // Notice items — no complaint workflow
    if (isNoticeItem(item)) {
      return (
        <Button
          size="sm"
          variant="solid"
          color="primary"
          onClick={() => { setNoticeModalItem(item); setNoticeModalOpen(true); }}
        >
          عرض التنويه
        </Button>
      );
    }

    // Patient Services decision arrived — section/dept/admin acknowledges it
    if (isDecisionArrivedItem(item)) {
      return (
        <Button
          size="sm"
          variant="solid"
          color="success"
          onClick={() => { setDecisionViewerItem(item); setDecisionViewerOpen(true); }}
        >
          عرض القرار
        </Button>
      );
    }

    // Universal primary action — opens modal for all workflow cases
    // (force-closed cases are now handled inside CaseReviewModal)
    const handlePrimaryAction = () => {
      if (item.seasonalReportId) {
        handleSeasonalView(item);
      } else {
        openReviewModal(item);
      }
    };

    return (
      <Button
        size="sm"
        variant="solid"
        color="primary"
        onClick={handlePrimaryAction}
        disabled={reviewModalOpen}
      >
        مراجعة الحالة
      </Button>
    );
  };

  // ============================
  // RENDER INBOX TABLE ROW
  // ============================
  const renderInboxRow = (item, extraStyle) => {
    const theme = getRowTheme(item);
    // HCAT Automatic Force Close Policy — days-remaining countdown.
    // Only for complaints actively pending at Section/Department/Administration.
    const countdown = isCountdownEligible(item)
      ? getDeadlineCountdown(item.sectionDeadlineAt || item.departmentDeadlineAt || item.administrationDeadlineAt)
      : null;
    // AIC-S7 notice rows can share a real subcaseId with a normal complaint
    // row already in this same inbox load — key on the notice's own ID instead.
    const rowKey = item.actionItemId != null && item.messageType === 'ACTION_ITEM_ASSIGNED'
      ? `sai-${item.actionItemId}`
      : item.noticeId != null
        ? `notice-${item.noticeId}`
        : item.subcaseId;
    return (
      <tr key={rowKey} style={{ ...theme.rowStyle, ...extraStyle }}>
        {/* ID */}
        <td>
          {item.incidentNumber && (
            <Typography level="body-xs" sx={{ color: 'neutral.500', fontFamily: 'monospace', mb: 0.25 }}>
              {item.incidentNumber}
            </Typography>
          )}
          <Typography level="body-sm" fontWeight="bold">
            {getDisplayId(item)}
          </Typography>
        </td>

        {/* Message Type */}
        <td>
          <Chip
            size="sm"
            variant="soft"
            color={theme.typeChipColor}
            startDecorator={theme.typeIconKey ? TYPE_ICON_MAP[theme.typeIconKey] : undefined}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {theme.typeLabel}
          </Chip>
        </td>

        {/* Status + Stage 3 badges */}
        <td>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              size="sm"
              variant="soft"
              color={getStatusDisplay(item.status).color}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {getStatusDisplay(item.status).label}
            </Chip>
            {/* HCAT Automatic Force Close Policy — days-remaining countdown */}
            {countdown && (
              <Chip size="sm" variant="soft" color={countdown.color} sx={{ whiteSpace: 'nowrap' }}>
                {countdown.label}
              </Chip>
            )}
            {/* HCAT Session 6 — late-reply / extra-time chips */}
            {getLevelIndicatorChips(item).map((chip) => (
              <Chip key={chip.key} size="sm" variant="soft" color={chip.color} sx={{ whiteSpace: 'nowrap' }}>
                {chip.label}
              </Chip>
            ))}
            {/* Stage 3 — themed badges (max 2 + overflow) */}
            {theme.visibleBadges.map((badge) => (
              <Chip
                key={badge.key}
                size="sm"
                variant="soft"
                color={badge.color}
                startDecorator={BADGE_ICON_MAP[badge.iconKey]}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {badge.label}
              </Chip>
            ))}
            {theme.overflowCount > 0 && (
              <Chip
                size="sm"
                variant="outlined"
                color="neutral"
                title={theme.overflowTooltip}
                sx={{ whiteSpace: 'nowrap', cursor: 'default', fontWeight: 600 }}
              >
                +{theme.overflowCount}
              </Chip>
            )}
          </Box>
        </td>

        {/* Source Unit — where the incident happened / who reported it (IssuingOrgUnitID) */}
        <td>
          <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
            {item.issuingOrgUnitName || '—'}
          </Typography>
        </td>

        {/* Target Unit — who the complaint is addressed to / should resolve it (TargetOrgUnitID) */}
        <td>
          <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
            {item.targetOrgUnitName || `Unit ${item.targetOrgUnitId}`}
          </Typography>
        </td>

        {/* Display Date (incidentDate → createdAt fallback) */}
        <td>
          <Typography level="body-sm">
            {(item.displayDate || item.createdAt)?.toLocaleDateString()}
          </Typography>
        </td>

        <td>{renderActionButtons(item)}</td>
      </tr>
    );
  };

  // ============================
  // RENDER ARCHIVE TABLE ROW
  // ============================
  const renderArchiveRow = (item) => {
    const theme = getRowTheme(item);
    return (
      <tr key={item.subcaseId} style={theme.rowStyle}>
        {/* ID */}
        <td>
          {item.incidentNumber && (
            <Typography level="body-xs" sx={{ color: 'neutral.500', fontFamily: 'monospace', mb: 0.25 }}>
              {item.incidentNumber}
            </Typography>
          )}
          <Typography level="body-sm" fontWeight="bold">
            {getDisplayId(item)}
          </Typography>
        </td>

        {/* Message Type */}
        <td>
          <Chip
            size="sm"
            variant="soft"
            color={theme.typeChipColor}
            startDecorator={theme.typeIconKey ? TYPE_ICON_MAP[theme.typeIconKey] : undefined}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {theme.typeLabel}
          </Chip>
        </td>

        {/* Status + badges */}
        <td>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              size="sm"
              variant="soft"
              color={getStatusDisplay(item.status).color}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {getStatusDisplay(item.status).label}
            </Chip>
            {/* HCAT Session 6 — late-reply / extra-time chips */}
            {getLevelIndicatorChips(item).map((chip) => (
              <Chip key={chip.key} size="sm" variant="soft" color={chip.color} sx={{ whiteSpace: 'nowrap' }}>
                {chip.label}
              </Chip>
            ))}
            {/* Stage 3 — themed badges (max 2 + overflow) */}
            {theme.visibleBadges.map((badge) => (
              <Chip
                key={badge.key}
                size="sm"
                variant="soft"
                color={badge.color}
                startDecorator={BADGE_ICON_MAP[badge.iconKey]}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {badge.label}
              </Chip>
            ))}
            {theme.overflowCount > 0 && (
              <Chip
                size="sm"
                variant="outlined"
                color="neutral"
                title={theme.overflowTooltip}
                sx={{ whiteSpace: 'nowrap', cursor: 'default', fontWeight: 600 }}
              >
                +{theme.overflowCount}
              </Chip>
            )}
          </Box>
        </td>

        {/* Source Unit — where the incident happened / who reported it (IssuingOrgUnitID) */}
        <td>
          <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
            {item.issuingOrgUnitName || '—'}
          </Typography>
        </td>

        {/* Target Unit — who the complaint is addressed to / should resolve it (TargetOrgUnitID) */}
        <td>
          <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
            {item.targetOrgUnitName || `Unit ${item.targetOrgUnitId}`}
          </Typography>
        </td>

        {/* Display Date */}
        <td>
          <Typography level="body-sm">
            {(item.displayDate || item.updatedAt || item.createdAt)?.toLocaleDateString()}
          </Typography>
        </td>

        {/* Actions (unchanged) */}
        <td>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {item.seasonalReportId ? (
              <Button size="sm" variant="outlined" color="neutral" onClick={() => handleSeasonalView(item)}>
                عرض
              </Button>
            ) : item.messageType === 'DECISION_TAKEN' ? (
              item.allowedActions?.includes('edit_patient_services_decision') ? (
                <Button size="sm" variant="soft" color="primary" onClick={() => openReviewModal(item)}>
                  مراجعة الرأي وتعديله
                </Button>
              ) : (
                <Button size="sm" variant="outlined" color="neutral" onClick={() => { setDecisionViewerItem(item); setDecisionViewerOpen(true); }}>
                  عرض القرار
                </Button>
              )
            ) : (
              <Button size="sm" variant="soft" color="primary" onClick={() => openReviewModal(item)}>
                عرض الحالة والرد
              </Button>
            )}
          </Box>
        </td>
      </tr>
    );
  };

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
    <MainLayout pageTitle="Workflow Notifications">
      <Box sx={{ p: 3, width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Inbox tabs" sx={{ width: '100%', minWidth: 0 }}>
          <TabList>
            <Tab>📥 Notifications ({items.length})</Tab>
            <Tab>📋 Archive ({archiveItems.length})</Tab>
          </TabList>

          {/* INBOX TAB — three responsibility zones */}
          <TabPanel value={0} sx={{ p: 0, pt: 2, width: '100%', minWidth: 0 }}>
            {loading ? (
              renderLoadingState('Loading inbox...')
            ) : error ? (
              <ErrorPanel message={error} retryAction={loadInbox} retryLabel="Retry Load" />
            ) : items.length === 0 ? (
              renderEmptyInbox()
            ) : (() => {
              // Zone 1 uses full filter (search + type). Zone 2 uses search only so
              // escalated cases always appear regardless of the type filter.
              const { normalItems: normalItemsRaw }  = splitInboxAreas(applyFilters(items));
              const { problemItems: problemItemsRaw } = splitInboxAreas(applyFilters(items));
              const normalItems = sortItems(normalItemsRaw);
              const problemItems = sortItems(problemItemsRaw);

              const tableHead = (
                <thead>
                  <tr>
                    <th style={{ width: '8%' }}>ID</th>
                    <th style={{ width: '10%' }}>Type</th>
                    <th style={{ width: '20%' }}>Status / Indicators</th>
                    {renderSortableHeader('Source Unit', 'sourceUnit', 9)}
                    {renderSortableHeader('Target Unit', 'targetUnit', 9)}
                    {renderSortableHeader('Publication Date', 'date', 10)}
                    <th style={{ width: '32%' }}>Actions</th>
                  </tr>
                </thead>
              );

              // Zone 2 footer: quick Give More Time link (single-item only)
              const singleEscalated = problemItems.length === 1 ? problemItems[0] : null;
              const singleHasGiveMoreTime = singleEscalated?.allowedActions?.some(
                (a) => a.includes('give') && a.includes('more_time')
              );

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', minWidth: 0 }}>

                  {/* ── GLOBAL INBOX CONTROLS — above all zones ── */}
                  <Box
                    sx={{
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: 2,
                    }}
                  >
                    {renderCaseTypeChips()}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Input
                        size="sm"
                        placeholder="Search by INC or Case #"
                        startDecorator={<SearchIcon />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: 180 }}
                      />
                      <Button size="sm" variant="outlined" color="neutral" onClick={loadInbox} disabled={reviewModalOpen}>
                        Refresh
                      </Button>
                    </Box>
                  </Box>

                  {/* ── ZONE 1: My Active Work ── */}
                  <Card
                    variant="outlined"
                    sx={{ borderRadius: 'lg', overflow: 'hidden', borderColor: 'primary.200', p: 0, width: '100%', minWidth: 0 }}
                  >
                    {/* Zone 1 header — no filters here, moved above */}
                    <Box
                      sx={{
                        px: 3, py: 2.5,
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        backgroundColor: '#f0f7ff',
                        borderBottom: '1px solid', borderColor: 'primary.100',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ p: 0.75, borderRadius: 'sm', backgroundColor: 'primary.50', display: 'flex' }}>
                          <AssignmentIcon sx={{ color: 'primary.500', fontSize: 22 }} />
                        </Box>
                        <Box>
                          <Typography level="h4">My Active Work</Typography>
                          <Typography level="body-sm" sx={{ color: 'neutral.500', mt: 0.25 }}>
                            Cases that require your action now
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Chip size="sm" variant="solid" color="primary">{normalItems.length}</Chip>
                        <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                          {normalItems.length === 1 ? 'Item' : 'Items'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Zone 1 table — wrapped for contained horizontal scroll */}
                    {normalItems.length > 0 ? (
                      <Box sx={{ overflowX: 'auto', width: '100%' }}>
                        <Table
                          variant="plain"
                          sx={{
                            '& thead th': { fontWeight: 600, backgroundColor: 'neutral.50', borderBottom: '1px solid', borderColor: 'neutral.100' },
                            tableLayout: 'fixed',
                            width: '100%',
                            minWidth: 680,
                          }}
                        >
                          {tableHead}
                          <tbody>{normalItems.map((item) => renderInboxRow(item))}</tbody>
                        </Table>
                      </Box>
                    ) : (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography level="body-sm" sx={{ color: 'neutral.400' }}>
                          No active items at your responsibility level.
                        </Typography>
                      </Box>
                    )}
                  </Card>

                  {/* ── ZONE 2: Escalated / Force Closed ── (only when items exist) */}
                  {problemItems.length > 0 && (
                    <Card
                      variant="outlined"
                      sx={{ borderRadius: 'lg', overflow: 'hidden', borderColor: 'danger.300', p: 0, width: '100%', minWidth: 0 }}
                    >
                      {/* Zone 2 header */}
                      <Box
                        sx={{
                          px: 3, py: 2.5,
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                          backgroundColor: '#fff5f5',
                          borderBottom: '1px solid', borderColor: 'danger.100',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{ p: 0.75, borderRadius: 'sm', backgroundColor: 'danger.100', display: 'flex' }}>
                            <ReportProblemIcon sx={{ color: 'danger.600', fontSize: 22 }} />
                          </Box>
                          <Box>
                            <Typography level="h4" sx={{ color: 'danger.700' }}>Escalated / Force Closed Cases</Typography>
                            <Typography level="body-sm" sx={{ color: 'danger.500', mt: 0.25 }}>
                              Cases that missed deadline or need supervisor attention
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Chip size="sm" variant="solid" color="danger">{problemItems.length}</Chip>
                          <Typography level="body-xs" sx={{ color: 'danger.400' }}>
                            {problemItems.length === 1 ? 'Item' : 'Items'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Zone 2 table — wrapped for contained horizontal scroll */}
                      <Box sx={{ overflowX: 'auto', width: '100%' }}>
                        <Table
                          variant="plain"
                          sx={{
                            '& thead th': { fontWeight: 600, backgroundColor: 'neutral.50', borderBottom: '1px solid', borderColor: 'neutral.100' },
                            tableLayout: 'fixed',
                            width: '100%',
                            minWidth: 680,
                          }}
                        >
                          {tableHead}
                          <tbody>
                            {problemItems.map((item) => {
                              const isInactive = classifyInboxArea(item) === 'PROBLEM_INACTIVE';
                              return (
                                <React.Fragment key={item.subcaseId}>
                                  {renderInboxRow(item, isInactive ? { opacity: 0.55, filter: 'grayscale(0.35)' } : undefined)}
                                  {isInactive && (
                                    <tr>
                                      <td colSpan={7} style={{ padding: '2px 12px 8px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                        <Typography level="body-xs" sx={{ color: 'neutral.500', fontStyle: 'italic' }}>
                                          انتقلت إلى المستوى الأعلى
                                        </Typography>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Box>

                      {/* Zone 2 footer: Give More Time quick action (single escalated case only) */}
                      {singleHasGiveMoreTime && (
                        <Box
                          sx={{
                            px: 2.5, py: 1.5,
                            backgroundColor: '#fff5f5',
                            borderTop: '1px solid', borderColor: 'danger.100',
                            display: 'flex', gap: 3, alignItems: 'center',
                          }}
                        >
                          <Button
                            variant="plain"
                            color="danger"
                            size="sm"
                            startDecorator={<HistoryIcon sx={{ fontSize: 16 }} />}
                            onClick={() => openReviewModal(singleEscalated)}
                          >
                            Give More Time
                          </Button>
                        </Box>
                      )}
                    </Card>
                  )}

                </Box>
              );
            })()}
          </TabPanel>

          {/* ARCHIVE TAB */}
          <TabPanel value={1} sx={{ p: 0, pt: 2, width: '100%', minWidth: 0 }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', minWidth: 0 }}>

                {/* ── GLOBAL ARCHIVE CONTROLS — mirrors the Notifications tab layout ── */}
                <Box
                  sx={{
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 2,
                  }}
                >
                  {renderCaseTypeChips()}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Input
                      size="sm"
                      placeholder="Search by INC-000168 or Case #"
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
                      disabled={reviewModalOpen}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Box>

                <Card
                  variant="outlined"
                  sx={{ borderRadius: 'lg', overflow: 'hidden', borderColor: 'neutral.300', p: 0, width: '100%', minWidth: 0 }}
                >
                  {/* Archive header band — same structure as the Zone 1/Zone 2 header bands */}
                  <Box
                    sx={{
                      px: 3, py: 2.5,
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      backgroundColor: 'neutral.50',
                      borderBottom: '1px solid', borderColor: 'neutral.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ p: 0.75, borderRadius: 'sm', backgroundColor: 'neutral.100', display: 'flex' }}>
                        <HistoryIcon sx={{ color: 'neutral.500', fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography level="h4">Archived Items</Typography>
                        <Typography level="body-sm" sx={{ color: 'neutral.500', mt: 0.25 }}>
                          Cases you have processed
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Chip size="sm" variant="solid" color="neutral">{applyFilters(archiveItems).length}</Chip>
                      <Typography level="body-xs" sx={{ color: 'neutral.400' }}>
                        {applyFilters(archiveItems).length === 1 ? 'Item' : 'Items'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <Table
                      variant="outlined"
                      sx={{
                        '& thead th': {
                          fontWeight: 600,
                          backgroundColor: 'neutral.50',
                        },
                        tableLayout: 'fixed',
                        width: '100%',
                        minWidth: 680,
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={{ width: '8%' }}>ID</th>
                          <th style={{ width: '10%' }}>Type</th>
                          <th style={{ width: '20%' }}>Status / Indicators</th>
                          {renderSortableHeader('Source Unit', 'sourceUnit', 9)}
                          {renderSortableHeader('Target Unit', 'targetUnit', 9)}
                          {renderSortableHeader('Publication Date', 'date', 10)}
                          <th style={{ width: '32%' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortItems(applyFilters(archiveItems)).map((item) => renderArchiveRow(item))}
                      </tbody>
                    </Table>
                  </Box>
                </Card>
              </Box>
            )}
          </TabPanel>
        </Tabs>
      </Box>

      {/* Unified Case Review Modal (section / dept / admin / supervisor) */}
      <CaseReviewModal
        open={reviewModalOpen}
        onClose={() => { setReviewModalOpen(false); setReviewModalItem(null); }}
        item={reviewModalItem}
        onSuccess={handleReviewSuccess}
      />

      {/* Seasonal Report Viewer */}
      <SeasonalReportViewerModal
        open={seasonalViewerOpen}
        onClose={() => setSeasonalViewerOpen(false)}
        seasonalReportId={seasonalViewerItem?.seasonalReportId}
        item={seasonalViewerItem}
        onSuccess={() => { setSeasonalViewerOpen(false); loadInbox(); }}
      />

      {/* Patient Services Decision Viewer — readOnly; active inbox items also acknowledge here */}
      <PatientServicesDecisionModal
        open={decisionViewerOpen}
        item={decisionViewerItem}
        readOnly={true}
        onClose={() => { setDecisionViewerOpen(false); setDecisionViewerItem(null); }}
        onSuccess={() => { setDecisionViewerOpen(false); setDecisionViewerItem(null); loadInbox(); }}
      />

      {/* Notice Modal (informational notice items) */}
      <NoticeModal
        open={noticeModalOpen}
        item={noticeModalItem}
        onClose={() => { setNoticeModalOpen(false); setNoticeModalItem(null); }}
        onSuccess={() => { setNoticeModalOpen(false); setNoticeModalItem(null); loadInbox(); }}
      />

      {/* Action Item Notice Modal (AIC-S7 — assignment / change notifications) */}
      <ActionItemNoticeModal
        open={actionItemNoticeModalOpen}
        item={actionItemNoticeModalItem}
        onClose={() => { setActionItemNoticeModalOpen(false); setActionItemNoticeModalItem(null); }}
        onSuccess={() => { setActionItemNoticeModalOpen(false); setActionItemNoticeModalItem(null); loadInbox(); }}
      />

    </MainLayout>
  );
};

export default WorkflowInboxPage;
