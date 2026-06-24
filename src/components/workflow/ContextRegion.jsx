import React from 'react';
import { Typography, Box, Chip, Divider } from '@mui/joy';
import CaseStateBadges from './CaseStateBadges';

/**
 * ContextRegion — fixed modal header: title, org-unit chip, status chip,
 * and the Universal Case Theme badges (type/Force-Closed/Late/clinical).
 *
 * Props:
 *   title       — string
 *   orgUnitName — string | null
 *   statusChip  — ReactNode | null
 *   item        — normalized inbox/archive item, passed to CaseStateBadges
 */
const ContextRegion = ({ title, orgUnitName, statusChip, item }) => (
  <Box>
    <Typography level="h4" sx={{ mb: 0.5 }}>{title}</Typography>
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      <CaseStateBadges item={item} />
      {orgUnitName && (
        <Chip size="sm" color="neutral" variant="outlined">{orgUnitName}</Chip>
      )}
      {statusChip}
    </Box>
    <Divider sx={{ mt: 1.5 }} />
  </Box>
);

export default ContextRegion;
