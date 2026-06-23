import React from 'react';
import { Modal, ModalDialog, ModalClose } from '@mui/joy';

/**
 * WorkflowFormShell — shared modal wrapper for all Inbox workflow forms.
 *
 * Controls: direction, max-width expansion, close-guard while submitting.
 * Does not render any content — children fill the body.
 *
 * Props:
 *   open       — bool
 *   onClose    — () => void
 *   submitting — bool  (blocks close during in-flight request)
 *   wide       — bool  (expands to 780px for forms with many fields)
 *   children   — ReactNode
 */
const WorkflowFormShell = ({ open, onClose, submitting, wide, children }) => (
  <Modal open={open} onClose={!submitting ? onClose : undefined} sx={{ zIndex: 9999 }}>
    <ModalDialog
      variant="outlined"
      sx={{
        maxWidth: wide ? 780 : 640,
        width: '95%',
        maxHeight: '92vh',
        overflow: 'auto',
        direction: 'rtl',
        textAlign: 'right',
        transition: 'max-width 0.2s ease',
      }}
    >
      <ModalClose disabled={submitting} />
      {children}
    </ModalDialog>
  </Modal>
);

export default WorkflowFormShell;
