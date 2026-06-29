import React from 'react';
import { Box } from '@mui/joy';
import theme from '../../theme';

/**
 * ModalLayoutShell — region scaffold for the Case Review modal family.
 *
 * Fixed context header, a scrolling body (single column, or primary/support
 * columns when supportContent is provided), and a fixed sticky footer.
 * Only the body scrolls — context and footer never move. The two columns
 * share one scrollbar (not one each) — independent per-column scrolling was
 * tried and reverted, it read as broken double-scrollbar UI chrome.
 *
 * Props:
 *   context        — ReactNode  (fixed header slot)
 *   mainContent    — ReactNode  (primary column)
 *   supportContent — ReactNode | null  (support column; pass null to collapse to single column)
 *   footer         — ReactNode  (fixed footer slot)
 */
const ModalLayoutShell = ({ context, mainContent, supportContent, footer }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
    <Box sx={{ flex: '0 0 auto', px: theme.spacing.lg, pt: theme.spacing.md }}>
      {context}
    </Box>

    <Box
      sx={{
        flex: '1 1 auto',
        minHeight: 0,
        overflow: 'auto',
        px: theme.spacing.lg,
        pb: theme.spacing.md,
        display: 'flex',
        flexDirection: { xs: 'column', lg: supportContent ? 'row' : 'column' },
        gap: theme.spacing.lg,
      }}
    >
      <Box sx={{ flex: supportContent ? `0 1 ${theme.modal.primaryColumnBasis}` : '1 1 100%', minWidth: 0 }}>
        {mainContent}
      </Box>
      {supportContent && (
        <Box sx={{ flex: `0 1 ${theme.modal.supportColumnBasis}`, minWidth: 0 }}>
          {supportContent}
        </Box>
      )}
    </Box>

    {footer && (
      <Box
        sx={{
          flex: '0 0 auto',
          borderTop: `1px solid ${theme.colors.borderLight}`,
          px: theme.spacing.lg,
          py: theme.spacing.md,
          background: theme.colors.surface,
        }}
      >
        {footer}
      </Box>
    )}
  </Box>
);

export default ModalLayoutShell;
