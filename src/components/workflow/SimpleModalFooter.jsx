import React from 'react';
import { Box, Button, Alert, Typography } from '@mui/joy';

/**
 * SimpleModalFooter — shared footer for the simple, single-action Inbox
 * modal variants (Notice, Seasonal Report, Patient Services Decision) —
 * Close on one side, one primary action on the other. CaseReviewModal's
 * multi-action panel uses ActionFooterRegion instead; this is for the
 * variants that only ever need one primary action.
 *
 * Props:
 *   onClose         — () => void
 *   closeLabel      — string (default 'إغلاق')
 *   closeDisabled   — bool
 *   primaryLabel    — string | null (omit to render Close only)
 *   onPrimary       — () => void
 *   primaryDisabled — bool
 *   primaryLoading  — bool
 *   primaryColor    — Joy color token (default 'primary')
 *   error           — string | null
 */
const SimpleModalFooter = ({
  onClose, closeLabel = 'إغلاق', closeDisabled,
  primaryLabel, onPrimary, primaryDisabled, primaryLoading, primaryColor = 'primary',
  error,
}) => (
  <Box>
    {error && (
      <Alert color="danger" variant="soft" sx={{ mb: 1 }}>
        <Typography level="body-sm">{error}</Typography>
      </Alert>
    )}
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button variant="plain" color="neutral" onClick={onClose} disabled={closeDisabled}>
        {closeLabel}
      </Button>
      {primaryLabel && (
        <Button
          variant="solid"
          color={primaryColor}
          onClick={onPrimary}
          disabled={primaryDisabled}
          loading={primaryLoading}
        >
          {primaryLabel}
        </Button>
      )}
    </Box>
  </Box>
);

export default SimpleModalFooter;
