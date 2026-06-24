import React from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/joy';
import WorkflowActionButtons from './WorkflowActionButtons';

/**
 * ActionFooterRegion — sticky footer. Standard panel: action selector +
 * confirm/cancel. Patient Services Opinion mode: close/save.
 */
const ActionFooterRegion = ({
  isPatientServicesReview,
  onClose,
  opinionSaving, onSaveOpinion, opinionDisabled,
  allowedActions, activeAction, onSelectAction, submitting,
  submitError,
  confirmColor, onCancelAction, onConfirmAction,
}) => {
  if (isPatientServicesReview) {
    return (
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="plain" color="neutral" onClick={onClose} disabled={opinionSaving}>
          إغلاق
        </Button>
        <Button
          variant="solid"
          color="primary"
          onClick={onSaveOpinion}
          disabled={opinionDisabled}
          startDecorator={opinionSaving ? <CircularProgress size="sm" /> : null}
        >
          {opinionSaving ? 'جاري الحفظ...' : 'حفظ الرأي'}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography level="title-sm" sx={{ mb: 1 }}>الإجراء المطلوب:</Typography>
      <WorkflowActionButtons
        allowedActions={allowedActions}
        activeAction={activeAction}
        onSelect={onSelectAction}
        disabled={submitting}
      />
      {submitError && (
        <Alert color="danger" variant="soft" sx={{ mt: 1, mb: activeAction ? 1 : 0 }}>
          <Typography level="body-sm">{submitError}</Typography>
        </Alert>
      )}
      {activeAction && (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="outlined"
            color="neutral"
            onClick={onCancelAction}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            color={confirmColor}
            onClick={onConfirmAction}
            loading={submitting}
            disabled={submitting}
          >
            تأكيد
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ActionFooterRegion;
