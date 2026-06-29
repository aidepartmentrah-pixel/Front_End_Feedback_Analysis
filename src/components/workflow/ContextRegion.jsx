import React from 'react';
import { Typography, Box, Chip, Divider } from '@mui/joy';
import CaseStateBadges from './CaseStateBadges';
import { getRowTheme } from '../../utils/inboxTheme';
import { getDeadlineCountdown, isCountdownEligible } from '../../utils/deadlineCountdown';
import theme from '../../theme';

const COUNTDOWN_COLOR_MAP = {
  neutral: theme.colors.textTertiary,
  warning: theme.colors.warning,
  danger: theme.colors.error,
};

/** One centered label/value cell in the header info bar. */
function HeaderCell({ label, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 90 }}>
      <Typography level="body-xs" sx={{ color: theme.colors.textTertiary, mb: 0.4 }}>{label}</Typography>
      {children}
    </Box>
  );
}

/**
 * ContextRegion — fixed modal header: title, a centered info bar (status +
 * deadline, target unit, case type, case number), and the Universal Case
 * Theme badges.
 *
 * Props:
 *   title       — string
 *   orgUnitName — string | null
 *   statusChip  — ReactNode | null
 *   item        — normalized inbox/archive item, used for badges + the
 *                 info-bar cells (type/countdown/case number) — same item
 *                 already passed in, nothing new for callers to provide.
 */
const ContextRegion = ({ title, orgUnitName, statusChip, item }) => {
  const rowTheme = item ? getRowTheme(item) : null;
  const eligible = item ? isCountdownEligible(item) : false;
  const dueDate = eligible
    ? (item.sectionDeadlineAt || item.departmentDeadlineAt || item.administrationDeadlineAt)
    : null;
  const countdown = eligible ? getDeadlineCountdown(dueDate) : null;
  const caseNumber = item?.incidentNumber || (item?.subcaseId ? `#${item.subcaseId}` : null);

  const hasInfoBar = statusChip || orgUnitName || rowTheme?.typeLabel || caseNumber;

  return (
    <Box>
      <Typography level="h4" sx={{ mb: 1 }}>{title}</Typography>

      {hasInfoBar && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            gap: 2,
            py: 0.75,
            mb: 1,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceHover,
          }}
        >
          {statusChip && (
            <HeaderCell label="حالة المعالجة">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                {statusChip}
                {countdown && (
                  <Typography level="body-xs" sx={{ color: COUNTDOWN_COLOR_MAP[countdown.color] || theme.colors.textTertiary }}>
                    {countdown.label}
                  </Typography>
                )}
                {/* Force-Closed/Late/clinical indicators live here too — type
                    chip is suppressed since it already has its own cell below. */}
                <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <CaseStateBadges item={item} showType={false} />
                </Box>
              </Box>
            </HeaderCell>
          )}
          {orgUnitName && (
            <HeaderCell label="الجهة المستهدفة">
              <Chip size="sm" color="neutral" variant="outlined">{orgUnitName}</Chip>
            </HeaderCell>
          )}
          {rowTheme?.typeLabel && (
            <HeaderCell label="نوع الحالة">
              <Chip size="sm" variant="soft" color={rowTheme.typeChipColor}>{rowTheme.typeLabel}</Chip>
            </HeaderCell>
          )}
          {caseNumber && (
            <HeaderCell label="رقم الحالة">
              <Typography level="body-sm" sx={{ fontWeight: 600 }}>{caseNumber}</Typography>
            </HeaderCell>
          )}
        </Box>
      )}
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  );
};

export default ContextRegion;
