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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Typography level="title-sm" sx={{ whiteSpace: 'nowrap' }}>الإجراء المطلوب:</Typography>
          <WorkflowActionButtons
            allowedActions={allowedActions}
            activeAction={activeAction}
            onSelect={onSelectAction}
            disabled={submitting}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeAction && (
            <>
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
            </>
          )}
          <Button variant="plain" color="neutral" onClick={onClose} disabled={submitting}>
            إغلاق
          </Button>
        </Box>
      </Box>
      {submitError && (
        <Alert color="danger" variant="soft" sx={{ mt: 1 }}>
          <Typography level="body-sm">{submitError}</Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ActionFooterRegion;
