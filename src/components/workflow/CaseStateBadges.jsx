import React from 'react';
import { Chip } from '@mui/joy';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import FlagIcon from '@mui/icons-material/Flag';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getRowTheme } from '../../utils/inboxTheme';

// Small local copy of the icon-key map used by WorkflowInboxPage — duplicated
// rather than imported/shared, since that file is the Inbox page (out of
// scope for the Case Review modal UI-smoothing project; see S0.3).
const BADGE_ICON_MAP = {
  Lock: <LockIcon sx={{ fontSize: 12 }} />,
  History: <HistoryIcon sx={{ fontSize: 12 }} />,
  Flag: <FlagIcon sx={{ fontSize: 12 }} />,
  WarningAmber: <WarningAmberIcon sx={{ fontSize: 12 }} />,
  Favorite: <FavoriteIcon sx={{ fontSize: 12 }} />,
};

/**
 * CaseStateBadges — Universal Case Theme badges (type + workflow/clinical
 * indicators) for the Case Review modal's ContextRegion. Reuses the same
 * getRowTheme() computation already used by the Inbox row rendering, via
 * src/utils/inboxTheme.js, so the modal and the Inbox row agree on what
 * "Force Closed" / "Late" / "Red Flag" etc. mean — display only, no logic.
 */
const CaseStateBadges = ({ item }) => {
  if (!item) return null;
  const rowTheme = getRowTheme(item);

  return (
    <>
      <Chip size="sm" variant="soft" color={rowTheme.typeChipColor} sx={{ whiteSpace: 'nowrap' }}>
        {rowTheme.typeLabel}
      </Chip>
      {rowTheme.visibleBadges.map((badge) => (
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
      {rowTheme.overflowCount > 0 && (
        <Chip
          size="sm"
          variant="outlined"
          color="neutral"
          title={rowTheme.overflowTooltip}
          sx={{ whiteSpace: 'nowrap', cursor: 'default', fontWeight: 600 }}
        >
          +{rowTheme.overflowCount}
        </Chip>
      )}
    </>
  );
};

export default CaseStateBadges;
