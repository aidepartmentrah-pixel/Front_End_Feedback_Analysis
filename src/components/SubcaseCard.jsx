import React from 'react';
import { Box, Button, Chip, Typography } from '@mui/joy';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlagIcon from '@mui/icons-material/Flag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SeverityBadge from './SeverityBadge';
import { useAuth } from '../context/AuthContext';
import './SubcaseCard.css';

// Force-closed-at-level statuses (new automatic force-close model)
const FC_PIPELINE_LABEL = {
  FORCE_CLOSED_AT_SECTION:        'مغلقة قسريًا — القسم',
  FORCE_CLOSED_AT_DEPARTMENT:     'مغلقة قسريًا — الدائرة',
  FORCE_CLOSED_AT_ADMINISTRATION: 'مغلقة قسريًا — الإدارة',
};

// Universal Case Theme badge priority order:
// Force Closed → Late → Never Event → Red Flag → Morbidity
const MAX_VISIBLE_BADGES = 2;

function SubcaseCard({ subcase, onFillData, onGiveMoreTime, onEnterDecision }) {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const canIntervene = roles.includes('COMPLAINT_SUPERVISOR') || roles.includes('WORKER');

  const fcPipelineLabel = FC_PIPELINE_LABEL[subcase.status] || null;

  const isReturnedForRevision =
    subcase.status === 'RETURNED_TO_SECTION_FOR_REVISION' ||
    subcase.status === 'RETURNED_TO_DEPARTMENT_FOR_REVISION';

  // Build badge list in priority order — filter to only active ones
  const allBadges = [
    { key: 'fc',        show: !!fcPipelineLabel,        Icon: LockIcon,         label: 'Force Closed', color: 'danger'  },
    { key: 'late',      show: !!subcase.is_late,        Icon: HistoryIcon,      label: 'Late',         color: 'warning' },
    { key: 'never',     show: !!subcase.is_never_event, Icon: WarningAmberIcon, label: 'Never Event',  color: 'danger'  },
    { key: 'redflag',   show: !!subcase.is_red_flag,    Icon: FlagIcon,         label: 'Red Flag',     color: 'danger'  },
    { key: 'morbidity', show: !!subcase.is_morbidity,   Icon: FavoriteIcon,     label: 'Morbidity',    color: 'warning' },
  ].filter(b => b.show);

  const visibleBadges  = allBadges.slice(0, MAX_VISIBLE_BADGES);
  const overflowCount  = allBadges.length - visibleBadges.length;
  const overflowTooltip = allBadges.slice(MAX_VISIBLE_BADGES).map(b => b.label).join(' · ');

  // Theme: 3px red strip for force-closed pipeline cases; transparent otherwise (keeps layout stable)
  const cardBorderStyle = fcPipelineLabel
    ? { borderLeft: '3px solid #c0392b' }
    : { borderLeft: '3px solid transparent' };

  // Time-distinction fields. `deadline_at`/`extra_time_granted_at` (generic) come from
  // the Workload Overview groups; `administration_deadline_at`/`administration_extra_time_granted_at`
  // come from the Force-Closed-at-Administration panel — same card, two data sources.
  const rawDeadlineAt = subcase.deadline_at ?? subcase.administration_deadline_at;
  const rawExtraTimeGrantedAt = subcase.extra_time_granted_at ?? subcase.administration_extra_time_granted_at;
  const deadlineAt = rawDeadlineAt ? new Date(rawDeadlineAt) : null;
  const extraTimeGrantedAt = rawExtraTimeGrantedAt ? new Date(rawExtraTimeGrantedAt) : null;
  const extraDaysGiven = (deadlineAt && extraTimeGrantedAt)
    ? Math.round((deadlineAt.getTime() - extraTimeGrantedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="subcase-card" style={cardBorderStyle}>
      <div className="subcase-header">
        <SeverityBadge severity={subcase.severity} />

        {/* Workflow + clinical badges — max 2 visible, rest as +N */}
        {visibleBadges.map(badge => {
          const BadgeIcon = badge.Icon;
          return (
            <Chip
              key={badge.key}
              size="sm"
              color={badge.color}
              variant="soft"
              startDecorator={<BadgeIcon style={{ fontSize: '0.85rem' }} />}
            >
              {badge.label}
            </Chip>
          );
        })}
        {overflowCount > 0 && (
          <Chip size="sm" color="neutral" variant="outlined" title={overflowTooltip}>
            +{overflowCount}
          </Chip>
        )}

        {/* Returned for revision — workflow state chip */}
        {isReturnedForRevision && (
          <Chip size="sm" color="neutral" variant="soft">
            Returned for Revision
          </Chip>
        )}

        <span className="waiting-time">
          <AccessTimeIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '3px' }} />
          {subcase.waiting_days} day{subcase.waiting_days !== 1 ? 's' : ''}
        </span>

        {subcase.incident_number && (
          <span className="case-id">{subcase.incident_number}</span>
        )}
        <span className="subcase-id">
          Case #{subcase.incident_id || subcase.incident_request_case_id || subcase.seasonal_report_id || '—'}
        </span>
      </div>

      <div className="subcase-body">
        <div className="case-description">
          {subcase.case_description || 'No description available'}
        </div>
        {subcase.force_close_reason && (
          <Box sx={{ mt: 1, p: 1, backgroundColor: 'warning.50', borderRadius: 'sm', borderLeft: '3px solid', borderColor: 'warning.400' }}>
            <Typography level="body-xs" sx={{ fontWeight: 700, color: 'warning.700' }}>
              Force Close Reason:
            </Typography>
            <Typography level="body-xs" sx={{ color: 'warning.800' }}>
              {subcase.force_close_reason}
            </Typography>
          </Box>
        )}
        <div className="subcase-meta">
          {subcase.patient_name && (
            <span className="patient-name">Patient: {subcase.patient_name}</span>
          )}
          {subcase.category && <span className="category">{subcase.category}</span>}
          <span className="created-date">
            Publication Date: {subcase.created_at ? new Date(subcase.created_at).toLocaleDateString() : '—'}
          </span>
          {subcase.org_unit_name && (
            <span className="category">{subcase.org_unit_name}</span>
          )}
          {/* Originating section — only meaningful once the case has moved past it */}
          {subcase.issuing_org_unit_name && subcase.issuing_org_unit_name !== subcase.org_unit_name && (
            <span className="category">Originating Section: {subcase.issuing_org_unit_name}</span>
          )}
        </div>
        {/* Time-distinction fields — deadline, and extension detail if extra time was granted */}
        {deadlineAt && (
          <div className="subcase-meta">
            <span className="category">
              {extraTimeGrantedAt ? 'New Deadline (after extra time): ' : 'Deadline: '}
              {deadlineAt.toLocaleDateString()}
            </span>
            {extraTimeGrantedAt && extraDaysGiven != null && (
              <span className="category">+{extraDaysGiven} extra day{extraDaysGiven !== 1 ? 's' : ''} given</span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons — role-gated */}
      {canIntervene && (onFillData || onGiveMoreTime || onEnterDecision) && (
        <Box className="subcase-actions" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {onFillData && (
            <Button size="sm" color="primary" variant="soft" onClick={() => onFillData(subcase.subcase_id)}>
              Fill Data Instead of User
            </Button>
          )}
          {fcPipelineLabel && onGiveMoreTime && (
            <Button size="sm" color="warning" variant="soft" onClick={() => onGiveMoreTime(subcase)}>
              Give More Time
            </Button>
          )}
          {onEnterDecision && (
            <Button size="sm" color="primary" variant="soft" onClick={() => onEnterDecision(subcase.subcase_id)}>
              Enter Decision
            </Button>
          )}
        </Box>
      )}
    </div>
  );
}

export default SubcaseCard;
