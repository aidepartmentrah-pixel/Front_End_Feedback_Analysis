import React from 'react';
import { Box, Button } from '@mui/joy';

/**
 * WorkflowActionButtons — renders the row of action selector buttons.
 *
 * Buttons are driven entirely by allowedActions from the backend.
 * No frontend role checks here.
 *
 * Props:
 *   allowedActions — string[]  (backend-computed, e.g. ['submit_response', 'reject'])
 *   activeAction   — string | null  (currently selected action code)
 *   onSelect       — (actionCode: string) => void
 *   disabled       — bool  (true while a submission is in-flight)
 */
const WorkflowActionButtons = ({ allowedActions, activeAction, onSelect, disabled }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    {allowedActions.includes('submit_response') && (
      <Button
        size="sm"
        variant={activeAction === 'SUBMIT_RESPONSE' ? 'solid' : 'outlined'}
        color="primary"
        onClick={() => onSelect('SUBMIT_RESPONSE')}
        disabled={disabled}
      >
        إرسال الرد
      </Button>
    )}
    {allowedActions.includes('accept_complaint') && (
      <Button
        size="sm"
        variant={activeAction === 'ACCEPT_COMPLAINT' ? 'solid' : 'outlined'}
        color="success"
        onClick={() => onSelect('ACCEPT_COMPLAINT')}
        disabled={disabled}
      >
        قبول الشكوى
      </Button>
    )}
    {allowedActions.includes('accept') && (
      <Button
        size="sm"
        variant={activeAction === 'APPROVE' ? 'solid' : 'outlined'}
        color="success"
        onClick={() => onSelect('APPROVE')}
        disabled={disabled}
      >
        قبول
      </Button>
    )}
    {allowedActions.includes('override') && (
      <Button
        size="sm"
        variant={activeAction === 'OVERRIDE' ? 'solid' : 'outlined'}
        color="primary"
        onClick={() => onSelect('OVERRIDE')}
        disabled={disabled}
      >
        تعديل الرد
      </Button>
    )}
    {allowedActions.includes('reject') && (
      <Button
        size="sm"
        variant={activeAction === 'REJECT' ? 'solid' : 'outlined'}
        color="danger"
        onClick={() => onSelect('REJECT')}
        disabled={disabled}
      >
        رفض
      </Button>
    )}
    {allowedActions.includes('reopen') && (
      <Button
        size="sm"
        variant={activeAction === 'REOPEN' ? 'solid' : 'outlined'}
        color="warning"
        onClick={() => onSelect('REOPEN')}
        disabled={disabled}
      >
        إعادة إرسال للقسم
      </Button>
    )}
    {allowedActions.includes('give_section_more_time') && (
      <Button
        size="sm"
        variant={activeAction === 'GIVE_SECTION_MORE_TIME' ? 'solid' : 'outlined'}
        color="warning"
        onClick={() => onSelect('GIVE_SECTION_MORE_TIME')}
        disabled={disabled}
      >
        إعطاء مهلة إضافية
      </Button>
    )}
    {allowedActions.includes('give_department_more_time') && (
      <Button
        size="sm"
        variant={activeAction === 'GIVE_DEPARTMENT_MORE_TIME' ? 'solid' : 'outlined'}
        color="warning"
        onClick={() => onSelect('GIVE_DEPARTMENT_MORE_TIME')}
        disabled={disabled}
      >
        إعطاء مهلة إضافية
      </Button>
    )}
    {allowedActions.includes('give_administration_more_time') && (
      <Button
        size="sm"
        variant={activeAction === 'GIVE_ADMINISTRATION_MORE_TIME' ? 'solid' : 'outlined'}
        color="warning"
        onClick={() => onSelect('GIVE_ADMINISTRATION_MORE_TIME')}
        disabled={disabled}
      >
        إعطاء مهلة إضافية
      </Button>
    )}
  </Box>
);

export default WorkflowActionButtons;
