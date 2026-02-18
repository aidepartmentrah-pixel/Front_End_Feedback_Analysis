/**
 * Force Close Modal Component
 * 
 * Administrative modal for SOFTWARE_ADMIN, WORKER, and COMPLAINT_SUPERVISOR
 * to force close cases and all their subcases.
 * 
 * Features:
 * - Shows incident details and all subcases
 * - Requires reason (min 10 characters)
 * - Warning about permanent closure
 * - Calls /api/v2/workflow/case/{incident_id}/force-close
 */

import React, { useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
} from '@mui/joy';
import WarningIcon from '@mui/icons-material/Warning';
import LockIcon from '@mui/icons-material/Lock';
import { forceCloseCase } from '../../api/workflowApi';

const ForceCloseModal = ({ open, onClose, incident, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    // Validation
    if (!reason || reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await forceCloseCase(incident.FeedbackID, reason.trim());
      
      // Success
      if (onSuccess) {
        onSuccess(result);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to force close case');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  if (!incident) return null;

  const subcaseCount = incident.workflow_status?.open_subcase_count || 0;
  const subcases = incident.workflow_status?.subcases || [];

  return (
    <Modal open={open} onClose={handleClose} sx={{ zIndex: 9999 }}>
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        sx={{
          minWidth: 600,
          maxWidth: 800,
        }}
      >
        <ModalClose disabled={loading} />
        
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="danger" />
            <Typography level="h4" sx={{ color: 'danger.main' }}>
              Force Close Case
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent>
          {/* Warning Alert */}
          <Alert
            color="danger"
            variant="soft"
            startDecorator={<WarningIcon />}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                ⚠️ Permanent Administrative Action
              </Typography>
              <Typography level="body-sm" sx={{ mt: 0.5 }}>
                This will <strong>PERMANENTLY</strong> close this incident and{' '}
                <strong>ALL {subcaseCount} subcase{subcaseCount !== 1 ? 's' : ''}</strong>.
                The case will be removed from all inboxes and no further actions will be possible.
              </Typography>
            </Box>
          </Alert>

          {/* Incident Details */}
          <Box sx={{ mb: 3 }}>
            <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>
              Incident Details:
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography level="body-sm">
                <strong>ID:</strong> #{incident.FeedbackID}
              </Typography>
              <Typography level="body-sm" sx={{ mt: 0.5 }}>
                <strong>Title:</strong> {incident.ComplaintTitle || 'Untitled'}
              </Typography>
              {incident.FeedbackRecievedDate && (
                <Typography level="body-sm" sx={{ mt: 0.5 }}>
                  <strong>Date:</strong> {new Date(incident.FeedbackRecievedDate).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Subcases List */}
          {subcases.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>
                Subcases to be Closed ({subcases.length}):
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 'sm',
                  p: 1,
                }}
              >
                {subcases.map((subcase) => (
                  <Box
                    key={subcase.subcase_id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      '&:not(:last-child)': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      },
                    }}
                  >
                    <Box>
                      <Typography level="body-sm" fontWeight="bold">
                        Subcase #{subcase.subcase_id}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        {subcase.target_org_unit || 'Unknown Unit'}
                      </Typography>
                    </Box>
                    <Chip size="sm" variant="soft" color="neutral">
                      {subcase.status.replace(/_/g, ' ')}
                    </Chip>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Reason Text Area */}
          <Box>
            <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>
              Reason for Force Closure: <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Textarea
              placeholder="Enter reason for administratively closing this case (min 10 characters)&#10;&#10;Examples:&#10;- Duplicate case - merged with incident #12345&#10;- Invalid submission - no incident occurred&#10;- Administrative correction - resolved outside system"
              minRows={4}
              maxRows={8}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              disabled={loading}
              error={!!error}
              sx={{ fontFamily: 'inherit' }}
            />
            <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.secondary' }}>
              {reason.length}/10 characters minimum
            </Typography>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert color="danger" variant="soft" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <Divider />

        <DialogActions>
          <Button
            variant="solid"
            color="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={!reason || reason.trim().length < 10}
            startDecorator={<LockIcon />}
          >
            Force Close ({subcaseCount} subcase{subcaseCount !== 1 ? 's' : ''})
          </Button>
          <Button
            variant="plain"
            color="neutral"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default ForceCloseModal;
