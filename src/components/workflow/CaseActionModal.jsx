/**
 * CaseActionModal — Workflow Transition UI Component (Phase 4)
 * 
 * Purpose:
 * - Executes workflow transitions using workflowApi.actOnSubcase()
 * - Builds action-specific payloads following backend contract
 * - No permission logic, no role checks, no workflow state inference
 * 
 * Architecture:
 * - Reusable modal component (not coupled to specific page)
 * - Conditional UI rendering based on actionCode prop
 * - Payload structure strictly follows backend contract (snake_case fields)
 * - Delegates permission/scope enforcement to backend
 * 
 * Supported Actions:
 * - SUBMIT_RESPONSE: explanation + action items
 * - REJECT: rejection text
 * - APPROVE: confirmation only (empty payload)
 * - OVERRIDE: explanation + action items
 * - FORCE_CLOSE: reason text
 * - REOPEN: rejection text (note for section explaining why it's being resent)
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  Button,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Card,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { actOnSubcase } from '../../api/workflowApi';

const CaseActionModal = ({ open, onClose, subcaseId, actionCode, onSuccess }) => {
  // ============================
  // STATE
  // ============================
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form state (varies by action)
  const [explanationText, setExplanationText] = useState('');
  const [rejectionText, setRejectionText] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [actionItems, setActionItems] = useState([
    { title: '', description: '', due_date: '' },
  ]);

  // ============================
  // RESET STATE ON OPEN/CLOSE
  // ============================
  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setExplanationText('');
      setRejectionText('');
      setReasonText('');
      setActionItems([{ title: '', description: '', due_date: '' }]);
      setErrorMessage(null);
      setLoading(false);
    }
  }, [open, actionCode]);

  // ============================
  // ACTION ITEMS MANAGEMENT
  // ============================
  const addActionItem = () => {
    setActionItems([...actionItems, { title: '', description: '', due_date: '' }]);
  };

  const removeActionItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const updateActionItem = (index, field, value) => {
    const updated = [...actionItems];
    updated[index][field] = value;
    setActionItems(updated);
  };

  // ============================
  // VALIDATION
  // ============================
  const validateForm = () => {
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
        if (!explanationText.trim()) {
          setErrorMessage('Explanation text is required');
          return false;
        }
        break;
      case 'REJECT':
        if (!rejectionText.trim()) {
          setErrorMessage('Rejection text is required');
          return false;
        }
        break;
      case 'OVERRIDE':
        if (!explanationText.trim()) {
          setErrorMessage('Explanation text is required');
          return false;
        }
        break;
      case 'FORCE_CLOSE':
        if (!reasonText.trim()) {
          setErrorMessage('Reason is required');
          return false;
        }
        break;
      case 'REOPEN':
        if (!rejectionText.trim()) {
          setErrorMessage('Please provide a note explaining why this case is being resent to the section');
          return false;
        }
        break;
      case 'APPROVE':
        // No validation needed
        break;
      default:
        setErrorMessage(`Unknown action: ${actionCode}`);
        return false;
    }
    return true;
  };

  // ============================
  // BUILD PAYLOAD
  // ============================
  const buildPayload = () => {
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
      case 'OVERRIDE':
        return {
          explanation_text: explanationText,
          action_items: actionItems
            .filter((item) => item.title.trim()) // Only include items with titles
            .map((item) => ({
              title: item.title,
              description: item.description,
              due_date: item.due_date || null,
            })),
        };
      case 'REJECT':
        return {
          rejection_text: rejectionText,
        };
      case 'REOPEN':
        return {
          rejection_text: rejectionText,
        };
      case 'FORCE_CLOSE':
        return {
          reason: reasonText,
        };
      case 'APPROVE':
        return {};
      default:
        return {};
    }
  };

  // ============================
  // SUBMIT HANDLER
  // ============================
  const handleSubmit = async () => {
    setErrorMessage(null);

    // Validate
    if (!validateForm()) {
      return;
    }

    // Build payload
    const payload = buildPayload();

    setLoading(true);

    try {
      await actOnSubcase(subcaseId, actionCode, payload);
      // Success: close modal and trigger refresh
      onClose();
      onSuccess();
    } catch (err) {
      // Map error types to user-friendly messages
      let userMessage = 'Failed to perform action';
      
      if (err.response?.status === 403) {
        userMessage = 'You are not allowed to perform this action';
      } else if (err.response?.status === 409) {
        userMessage = 'This case is no longer in a valid state for this action';
      } else if (err.response?.status === 400) {
        userMessage = err.response?.data?.detail || 'Invalid input — please check your entries';
      } else if (!err.response) {
        userMessage = 'Network error — check your connection';
      } else if (err.message) {
        userMessage = err.message;
      }
      
      setErrorMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // RENDER ACTION-SPECIFIC UI
  // ============================
  const renderFormFields = () => {
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
      case 'OVERRIDE':
        return (
          <>
            <FormControl required>
              <FormLabel>Explanation</FormLabel>
              <Textarea
                placeholder="Enter explanation..."
                minRows={4}
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                disabled={loading}
              />
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography level="title-md">Action Items</Typography>
                <Button
                  size="sm"
                  variant="outlined"
                  startDecorator={<AddIcon />}
                  onClick={addActionItem}
                  disabled={loading}
                >
                  Add Item
                </Button>
              </Box>

              {actionItems.map((item, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography level="title-sm">Item {index + 1}</Typography>
                    {actionItems.length > 1 && (
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="danger"
                        onClick={() => removeActionItem(index)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <FormControl sx={{ mb: 1 }}>
                    <FormLabel>Title</FormLabel>
                    <Input
                      placeholder="Action item title"
                      value={item.title}
                      onChange={(e) => updateActionItem(index, 'title', e.target.value)}
                      disabled={loading}
                    />
                  </FormControl>

                  <FormControl sx={{ mb: 1 }}>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      placeholder="Optional description"
                      minRows={2}
                      value={item.description}
                      onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                      disabled={loading}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Due Date</FormLabel>
                    <Input
                      type="date"
                      value={item.due_date}
                      onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
                      disabled={loading}
                    />
                  </FormControl>
                </Card>
              ))}
            </Box>
          </>
        );

      case 'REJECT':
        return (
          <FormControl required>
            <FormLabel>Rejection Reason</FormLabel>
            <Textarea
              placeholder="Enter reason for rejection..."
              minRows={4}
              value={rejectionText}
              onChange={(e) => setRejectionText(e.target.value)}
              disabled={loading}
            />
          </FormControl>
        );

      case 'APPROVE':
        return (
          <Alert color="success" variant="soft">
            <Typography level="body-md">
              Are you sure you want to approve this case?
            </Typography>
          </Alert>
        );

      case 'FORCE_CLOSE':
        return (
          <FormControl required>
            <FormLabel>Reason for Force Close</FormLabel>
            <Textarea
              placeholder="Enter reason for force closing..."
              minRows={4}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              disabled={loading}
            />
          </FormControl>
        );

      case 'REOPEN':
        return (
          <>
            <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
              <Typography level="body-sm">
                This will resend the case back to the section for re-examination.
                The section admin will see this case in their inbox again.
              </Typography>
            </Alert>
            <FormControl required>
              <FormLabel>Note for Section</FormLabel>
              <Textarea
                placeholder="Explain why this case is being sent back to the section..."
                minRows={4}
                value={rejectionText}
                onChange={(e) => setRejectionText(e.target.value)}
                disabled={loading}
              />
            </FormControl>
          </>
        );

      default:
        return (
          <Alert color="warning" variant="soft">
            <Typography level="body-sm">Unknown action: {actionCode}</Typography>
          </Alert>
        );
    }
  };

  // ============================
  // RENDER ACTION TITLE
  // ============================
  const getActionTitle = () => {
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
        return 'Submit Response';
      case 'REJECT':
        return 'Reject Case';
      case 'APPROVE':
        return 'Approve Case';
      case 'OVERRIDE':
        return 'Override Case';
      case 'FORCE_CLOSE':
        return 'Force Close Case';
      case 'REOPEN':
        return 'Resend to Section';
      default:
        return 'Case Action';
    }
  };

  // ============================
  // RENDER MODAL
  // ============================
  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 9999 }}>
      <ModalDialog
        variant="outlined"
        sx={{
          maxWidth: 600,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <ModalClose disabled={loading} />
        
        <Typography level="h4" sx={{ mb: 2 }}>
          {getActionTitle()}
        </Typography>

        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          Subcase ID: #{subcaseId}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Error Display */}
        {errorMessage && (
          <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
            <Typography level="body-sm">{errorMessage}</Typography>
          </Alert>
        )}

        {/* Form Fields */}
        <Box sx={{ mb: 3 }}>{renderFormFields()}</Box>

        {/* Footer Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
            color={actionCode === 'REJECT' || actionCode === 'FORCE_CLOSE' ? 'danger' : actionCode === 'REOPEN' ? 'warning' : 'primary'}
            onClick={handleSubmit}
            disabled={loading}
            startDecorator={loading && <CircularProgress size="sm" />}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default CaseActionModal;
