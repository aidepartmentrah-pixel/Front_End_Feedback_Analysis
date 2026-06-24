import React from 'react';
import { Box, Typography, IconButton } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import theme from '../../theme';

/**
 * SuggestedActionPanel — compact list of Action Item suggestions derived
 * from currently-selected RCA causes (Stage S4). Suggestions are optional:
 * nothing is inserted until the user explicitly clicks accept (Rule 1).
 * Accepting hands the text to the existing Action Item editor as a normal,
 * fully editable item (Rule 2) — this panel never edits or saves anything.
 *
 * Props:
 *   suggestions — { pairId, actionText }[]
 *   onAccept    — (actionText: string) => void
 */
const SuggestedActionPanel = ({ suggestions, onAccept }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Typography sx={{ ...theme.typography.cardTitle, mb: 0.75, fontSize: '0.9rem' }}>
        إجراءات مقترحة
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {suggestions.map(({ pairId, actionText }) => (
          <Box
            key={pairId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: 1,
              borderRadius: theme.radius.md,
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Typography level="body-sm" sx={{ textAlign: 'right', flex: 1 }} dir="rtl">
              {actionText}
            </Typography>
            <IconButton
              size="sm"
              variant="soft"
              color="primary"
              onClick={() => onAccept(actionText)}
              title="إضافة كبند إجراء"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SuggestedActionPanel;
