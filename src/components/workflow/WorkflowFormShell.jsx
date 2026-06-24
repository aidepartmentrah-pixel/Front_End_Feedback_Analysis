import React from 'react';
import { Modal, ModalDialog, ModalClose } from '@mui/joy';
import theme from '../../theme';

/**
 * WorkflowFormShell — shared modal wrapper for all Inbox workflow forms.
 *
 * Controls: size, direction, close-guard while submitting. The dialog itself
 * does not scroll — it lays out as a column so the region scaffold inside
 * (ModalLayoutShell) owns the actual scroll area and can keep a sticky footer.
 *
 * Props:
 *   open       — bool
 *   onClose    — () => void
 *   submitting — bool  (blocks close during in-flight request)
 *   size       — 'lg' | 'md' | 'sm'  (default 'lg' — see theme.modal.sizes)
 *   children   — ReactNode
 */
const WorkflowFormShell = ({ open, onClose, submitting, size = 'lg', children }) => {
  const dims = theme.modal.sizes[size] || theme.modal.sizes.lg;
  return (
    <Modal open={open} onClose={!submitting ? onClose : undefined} sx={{ zIndex: 9999 }}>
      <ModalDialog
        variant="outlined"
        sx={{
          width: dims.width,
          maxWidth: dims.maxWidth,
          height: dims.height,
          maxHeight: dims.maxHeight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          direction: 'rtl',
          textAlign: 'right',
          p: 0,
        }}
      >
        <ModalClose disabled={submitting} sx={{ zIndex: 1 }} />
        {children}
      </ModalDialog>
    </Modal>
  );
};

export default WorkflowFormShell;
