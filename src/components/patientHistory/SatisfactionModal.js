/**
 * SatisfactionModal
 * Modal for adding patient satisfaction to a case.
 * 
 * Used in Patient History page to record satisfaction per case.
 * Once submitted, satisfaction cannot be edited.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  Button,
  FormControl,
  FormLabel,
  Checkbox,
  Select,
  Option,
  Alert,
  CircularProgress,
  Divider,
  Input,
} from '@mui/joy';
import { getSatisfactionStatuses, createCaseSatisfaction } from '../../api/satisfactionApi';

const SatisfactionModal = ({ open, onClose, caseId, caseName, onSuccess }) => {
  // State
  const [loading, setLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Form state
  const [feedbackNeeded, setFeedbackNeeded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackDatetime, setFeedbackDatetime] = useState('');
  const [satisfactionStatusId, setSatisfactionStatusId] = useState(null);

  // Load satisfaction statuses on mount
  useEffect(() => {
    if (open) {
      loadStatuses();
      resetForm();
    }
  }, [open]);

  const loadStatuses = async () => {
    try {
      setStatusesLoading(true);
      const data = await getSatisfactionStatuses();
      setStatuses(data);
    } catch (err) {
      setErrorMessage('Failed to load satisfaction statuses');
    } finally {
      setStatusesLoading(false);
    }
  };

  const resetForm = () => {
    setFeedbackNeeded(false);
    setFeedbackGiven(false);
    setFeedbackDatetime('');
    setSatisfactionStatusId(null);
    setErrorMessage(null);
  };

  const validateForm = () => {
    if (satisfactionStatusId === null) {
      setErrorMessage('Please select a satisfaction status');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await createCaseSatisfaction(caseId, {
        feedback_needed: feedbackNeeded,
        feedback_given: feedbackGiven,
        feedback_datetime: feedbackDatetime || null,
        satisfaction_status_id: satisfactionStatusId,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage('Satisfaction already exists for this case');
      } else if (err.response?.status === 403) {
        setErrorMessage('You are not authorized to add satisfaction');
      } else {
        setErrorMessage(err.response?.data?.detail || 'Failed to submit satisfaction');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1: return 'neutral';   // Not Present
      case 2: return 'success';   // Satisfied
      case 3: return 'danger';    // Not Satisfied
      default: return 'neutral';
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 9999 }}>
      <ModalDialog
        variant="outlined"
        sx={{
          maxWidth: 500,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 10000,
        }}
      >
        <ModalClose disabled={loading} />

        <Typography level="h4" sx={{ mb: 1 }}>
          📋 Add Patient Satisfaction
        </Typography>

        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          Case: {caseName || `#${caseId}`}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Error Display */}
        {errorMessage && (
          <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
            <Typography level="body-sm">{errorMessage}</Typography>
          </Alert>
        )}

        {statusesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Satisfaction Status (required) */}
            <FormControl required>
              <FormLabel>Satisfaction Status</FormLabel>
              <Select
                placeholder="Select status..."
                value={satisfactionStatusId}
                onChange={(e, value) => setSatisfactionStatusId(value)}
                disabled={loading}
                color={getStatusColor(satisfactionStatusId)}
                slotProps={{
                  listbox: {
                    sx: { zIndex: 10001 }
                  }
                }}
              >
                {statuses.map((status) => (
                  <Option key={status.satisfaction_status_id} value={status.satisfaction_status_id}>
                    {status.status_name_en} / {status.status_name_ar}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Feedback Needed */}
            <FormControl>
              <Checkbox
                label="Feedback was requested from patient"
                checked={feedbackNeeded}
                onChange={(e) => setFeedbackNeeded(e.target.checked)}
                disabled={loading}
              />
            </FormControl>

            {/* Feedback Given */}
            <FormControl>
              <Checkbox
                label="Feedback was provided by patient"
                checked={feedbackGiven}
                onChange={(e) => setFeedbackGiven(e.target.checked)}
                disabled={loading}
              />
            </FormControl>

            {/* Feedback Datetime (optional, shown if feedback_given) */}
            {feedbackGiven && (
              <FormControl>
                <FormLabel>Feedback Date & Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={feedbackDatetime}
                  onChange={(e) => setFeedbackDatetime(e.target.value)}
                  disabled={loading}
                />
              </FormControl>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Info Alert */}
            <Alert color="warning" variant="soft">
              <Typography level="body-xs">
                ⚠️ Once submitted, satisfaction cannot be edited or deleted.
              </Typography>
            </Alert>

            {/* Footer Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                startDecorator={loading && <CircularProgress size="sm" />}
              >
                {loading ? 'Submitting...' : 'Submit Satisfaction'}
              </Button>
            </Box>
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default SatisfactionModal;
