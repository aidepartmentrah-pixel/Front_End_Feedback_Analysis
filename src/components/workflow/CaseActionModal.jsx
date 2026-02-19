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
 * - SUBMIT_RESPONSE: explanation + action items + RCA feedback (mandatory)
 * - REJECT: rejection text
 * - APPROVE: confirmation only (empty payload)
 * - OVERRIDE: explanation + action items
 * - FORCE_CLOSE: reason text
 * - REOPEN: rejection text (note for section explaining why it's being resent)
 * - DIRECT_APPROVE: explanation + action items + RCA feedback (mandatory)
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
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { actOnSubcase } from '../../api/workflowApi';

// Default RCA state object
const defaultRcaState = {
  // Staff causes
  Cause_Staff_Training: false,
  Cause_Staff_Incentives: false,
  Cause_Staff_Competency: false,
  Cause_Staff_Understaffed: false,
  Cause_Staff_NonCompliance: false,
  Cause_Staff_NoCoordination: false,
  Cause_Staff_Other: false,
  Cause_Staff_OtherText: '',
  // Process causes
  Cause_Process_NotComprehensive: false,
  Cause_Process_Unclear: false,
  Cause_Process_MissingProtocol: false,
  Cause_Process_Other: false,
  Cause_Process_OtherText: '',
  // Equipment causes
  Cause_Equipment_NotAvailable: false,
  Cause_Equipment_SystemIncomplete: false,
  Cause_Equipment_HardToApply: false,
  Cause_Equipment_Other: false,
  Cause_Equipment_OtherText: '',
  // Environment causes
  Cause_Environment_PlaceNature: false,
  Cause_Environment_Surroundings: false,
  Cause_Environment_WorkConditions: false,
  Cause_Environment_Other: false,
  Cause_Environment_OtherText: '',
  // Preventive measures
  Preventive_MonthlyMeetings: false,
  Preventive_TrainingPrograms: false,
  Preventive_IncreaseStaff: false,
  Preventive_MMCommitteeActions: false,
  Preventive_Other: false,
  Preventive_OtherText: '',
};

const CaseActionModal = ({ open, onClose, subcaseId, subcaseIds, actionCode, onSuccess }) => {
  // Support both single subcaseId and array of subcaseIds (for bulk operations)
  // If subcaseIds array is provided, use it; otherwise wrap single subcaseId in array
  const targetSubcaseIds = subcaseIds && subcaseIds.length > 0 
    ? subcaseIds 
    : (subcaseId ? [subcaseId] : []);
  const isBulkOperation = targetSubcaseIds.length > 1;
  
  // ============================
  // STATE
  // ============================
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [bulkProgress, setBulkProgress] = useState({ completed: 0, failed: 0, total: 0 });

  // Form state (varies by action)
  const [explanationText, setExplanationText] = useState('');
  const [rejectionText, setRejectionText] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [actionItems, setActionItems] = useState([
    { title: '', description: '', due_date: '' },
  ]);
  
  // RCA Feedback state (for SUBMIT_RESPONSE and DIRECT_APPROVE)
  const [rcaFeedback, setRcaFeedback] = useState({ ...defaultRcaState });

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
      setRcaFeedback({ ...defaultRcaState });
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
  // RCA FEEDBACK MANAGEMENT
  // ============================
  const updateRcaField = (field, value) => {
    setRcaFeedback(prev => ({ ...prev, [field]: value }));
  };

  // ============================
  // VALIDATION
  // ============================
  const validateForm = () => {
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
      case 'DIRECT_APPROVE':
        if (!explanationText.trim()) {
          setErrorMessage('Explanation text is required');
          return false;
        }
        // RCA is mandatory for section submissions
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
      case 'DIRECT_APPROVE':
        return {
          explanation_text: explanationText,
          action_items: actionItems
            .filter((item) => item.title.trim()) // Only include items with titles
            .map((item) => ({
              title: item.title,
              description: item.description,
              due_date: item.due_date || null,
            })),
          rca_feedback: rcaFeedback,
        };
      case 'OVERRIDE':
        return {
          explanation_text: explanationText,
          action_items: actionItems
            .filter((item) => item.title.trim())
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

    // Build payload (same for all subcases in bulk operation)
    const payload = buildPayload();

    setLoading(true);

    if (isBulkOperation) {
      // Bulk operation: fire parallel requests for all subcases
      setBulkProgress({ completed: 0, failed: 0, total: targetSubcaseIds.length });
      
      try {
        const results = await Promise.allSettled(
          targetSubcaseIds.map(id => actOnSubcase(id, actionCode, payload))
        );
        
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        setBulkProgress({ completed: succeeded, failed, total: targetSubcaseIds.length });
        
        if (failed === 0) {
          // All succeeded
          onClose();
          onSuccess();
        } else if (succeeded > 0) {
          // Partial success
          setErrorMessage(`Completed ${succeeded}/${targetSubcaseIds.length} subcases. ${failed} failed.`);
          // Still trigger refresh to show updated state
          setTimeout(() => {
            onClose();
            onSuccess();
          }, 2000);
        } else {
          // All failed
          setErrorMessage('All operations failed. Please try again.');
        }
      } catch (err) {
        setErrorMessage('Bulk operation failed: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    } else {
      // Single operation (original behavior)
      try {
        await actOnSubcase(targetSubcaseIds[0], actionCode, payload);
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
    }
  };

  // ============================
  // RENDER RCA FORM SECTION
  // ============================
  const renderRcaForm = () => (
    <Box sx={{ mt: 2 }}>
      <Typography level="title-md" sx={{ mb: 2, color: 'primary.600' }}>
        📋 Root Cause Analysis (RCA)
      </Typography>
      
      <AccordionGroup sx={{ maxWidth: '100%' }}>
        {/* Staff Causes */}
        <Accordion defaultExpanded>
          <AccordionSummary>
            <Typography level="title-sm">👥 Staff-Related Causes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Checkbox
                label="Training Deficiency"
                checked={rcaFeedback.Cause_Staff_Training}
                onChange={(e) => updateRcaField('Cause_Staff_Training', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Insufficient Incentives"
                checked={rcaFeedback.Cause_Staff_Incentives}
                onChange={(e) => updateRcaField('Cause_Staff_Incentives', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Competency Issues"
                checked={rcaFeedback.Cause_Staff_Competency}
                onChange={(e) => updateRcaField('Cause_Staff_Competency', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Understaffing"
                checked={rcaFeedback.Cause_Staff_Understaffed}
                onChange={(e) => updateRcaField('Cause_Staff_Understaffed', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Non-Compliance"
                checked={rcaFeedback.Cause_Staff_NonCompliance}
                onChange={(e) => updateRcaField('Cause_Staff_NonCompliance', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Poor Coordination"
                checked={rcaFeedback.Cause_Staff_NoCoordination}
                onChange={(e) => updateRcaField('Cause_Staff_NoCoordination', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Other (specify below)"
                checked={rcaFeedback.Cause_Staff_Other}
                onChange={(e) => updateRcaField('Cause_Staff_Other', e.target.checked)}
                disabled={loading}
              />
              {rcaFeedback.Cause_Staff_Other && (
                <Input
                  placeholder="Specify other staff cause..."
                  value={rcaFeedback.Cause_Staff_OtherText}
                  onChange={(e) => updateRcaField('Cause_Staff_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ ml: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Process Causes */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">⚙️ Process-Related Causes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Checkbox
                label="Not Comprehensive"
                checked={rcaFeedback.Cause_Process_NotComprehensive}
                onChange={(e) => updateRcaField('Cause_Process_NotComprehensive', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Process Unclear"
                checked={rcaFeedback.Cause_Process_Unclear}
                onChange={(e) => updateRcaField('Cause_Process_Unclear', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Missing Protocol"
                checked={rcaFeedback.Cause_Process_MissingProtocol}
                onChange={(e) => updateRcaField('Cause_Process_MissingProtocol', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Other (specify below)"
                checked={rcaFeedback.Cause_Process_Other}
                onChange={(e) => updateRcaField('Cause_Process_Other', e.target.checked)}
                disabled={loading}
              />
              {rcaFeedback.Cause_Process_Other && (
                <Input
                  placeholder="Specify other process cause..."
                  value={rcaFeedback.Cause_Process_OtherText}
                  onChange={(e) => updateRcaField('Cause_Process_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ ml: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Equipment Causes */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">🔧 Equipment-Related Causes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Checkbox
                label="Equipment Not Available"
                checked={rcaFeedback.Cause_Equipment_NotAvailable}
                onChange={(e) => updateRcaField('Cause_Equipment_NotAvailable', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="System Incomplete"
                checked={rcaFeedback.Cause_Equipment_SystemIncomplete}
                onChange={(e) => updateRcaField('Cause_Equipment_SystemIncomplete', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Hard to Apply/Use"
                checked={rcaFeedback.Cause_Equipment_HardToApply}
                onChange={(e) => updateRcaField('Cause_Equipment_HardToApply', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Other (specify below)"
                checked={rcaFeedback.Cause_Equipment_Other}
                onChange={(e) => updateRcaField('Cause_Equipment_Other', e.target.checked)}
                disabled={loading}
              />
              {rcaFeedback.Cause_Equipment_Other && (
                <Input
                  placeholder="Specify other equipment cause..."
                  value={rcaFeedback.Cause_Equipment_OtherText}
                  onChange={(e) => updateRcaField('Cause_Equipment_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ ml: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Environment Causes */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">🏢 Environment-Related Causes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Checkbox
                label="Place/Location Nature"
                checked={rcaFeedback.Cause_Environment_PlaceNature}
                onChange={(e) => updateRcaField('Cause_Environment_PlaceNature', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Surroundings Issues"
                checked={rcaFeedback.Cause_Environment_Surroundings}
                onChange={(e) => updateRcaField('Cause_Environment_Surroundings', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Work Conditions"
                checked={rcaFeedback.Cause_Environment_WorkConditions}
                onChange={(e) => updateRcaField('Cause_Environment_WorkConditions', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Other (specify below)"
                checked={rcaFeedback.Cause_Environment_Other}
                onChange={(e) => updateRcaField('Cause_Environment_Other', e.target.checked)}
                disabled={loading}
              />
              {rcaFeedback.Cause_Environment_Other && (
                <Input
                  placeholder="Specify other environment cause..."
                  value={rcaFeedback.Cause_Environment_OtherText}
                  onChange={(e) => updateRcaField('Cause_Environment_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ ml: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Preventive Measures */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">🛡️ Preventive Measures Taken</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Checkbox
                label="Monthly Meetings"
                checked={rcaFeedback.Preventive_MonthlyMeetings}
                onChange={(e) => updateRcaField('Preventive_MonthlyMeetings', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Training Programs"
                checked={rcaFeedback.Preventive_TrainingPrograms}
                onChange={(e) => updateRcaField('Preventive_TrainingPrograms', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Increase Staff"
                checked={rcaFeedback.Preventive_IncreaseStaff}
                onChange={(e) => updateRcaField('Preventive_IncreaseStaff', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="M&M Committee Actions"
                checked={rcaFeedback.Preventive_MMCommitteeActions}
                onChange={(e) => updateRcaField('Preventive_MMCommitteeActions', e.target.checked)}
                disabled={loading}
              />
              <Checkbox
                label="Other (specify below)"
                checked={rcaFeedback.Preventive_Other}
                onChange={(e) => updateRcaField('Preventive_Other', e.target.checked)}
                disabled={loading}
              />
              {rcaFeedback.Preventive_Other && (
                <Input
                  placeholder="Specify other preventive measure..."
                  value={rcaFeedback.Preventive_OtherText}
                  onChange={(e) => updateRcaField('Preventive_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ ml: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Box>
  );

  // ============================
  // RENDER ACTION ITEMS SECTION
  // ============================
  const renderActionItems = () => (
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
  );

  // ============================
  // RENDER ACTION-SPECIFIC UI
  // ============================
  const renderFormFields = () => {
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
      case 'DIRECT_APPROVE':
        return (
          <>
            <FormControl required>
              <FormLabel>Explanation</FormLabel>
              <Textarea
                placeholder="Enter explanation..."
                minRows={3}
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                disabled={loading}
              />
            </FormControl>

            <Divider sx={{ my: 2 }} />
            
            {renderActionItems()}

            <Divider sx={{ my: 2 }} />
            
            {renderRcaForm()}
          </>
        );
        
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

            {renderActionItems()}
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
    const bulkSuffix = isBulkOperation ? ` (${targetSubcaseIds.length} subcases)` : '';
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
        return 'Submit Response' + bulkSuffix;
      case 'DIRECT_APPROVE':
        return isBulkOperation 
          ? `⚡ Bulk Direct Approve (${targetSubcaseIds.length} subcases)`
          : 'Direct Approve (Universal Section)';
      case 'REJECT':
        return 'Reject Case' + bulkSuffix;
      case 'APPROVE':
        return 'Approve Case' + bulkSuffix;
      case 'OVERRIDE':
        return 'Override Case' + bulkSuffix;
      case 'FORCE_CLOSE':
        return 'Force Close Case' + bulkSuffix;
      case 'REOPEN':
        return 'Resend to Section' + bulkSuffix;
      default:
        return 'Case Action' + bulkSuffix;
    }
  };
  
  // Determine if this is an action that needs RCA (larger modal)
  const needsRcaForm = actionCode === 'SUBMIT_RESPONSE' || actionCode === 'DIRECT_APPROVE';

  // ============================
  // RENDER MODAL
  // ============================
  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 9999 }}>
      <ModalDialog
        variant="outlined"
        sx={{
          maxWidth: needsRcaForm ? 800 : 600,
          width: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <ModalClose disabled={loading} />
        
        <Typography level="h4" sx={{ mb: 2 }}>
          {getActionTitle()}
        </Typography>

        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          {isBulkOperation 
            ? `Processing ${targetSubcaseIds.length} subcases from the same case`
            : `Subcase ID: #${targetSubcaseIds[0]}`
          }
        </Typography>
        
        {/* Bulk Progress Indicator */}
        {isBulkOperation && loading && (
          <Alert color="primary" variant="soft" sx={{ mb: 2 }}>
            <Typography level="body-sm">
              Processing... {bulkProgress.completed + bulkProgress.failed}/{bulkProgress.total} complete
            </Typography>
          </Alert>
        )}

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
            color={
              actionCode === 'REJECT' || actionCode === 'FORCE_CLOSE' 
                ? 'danger' 
                : actionCode === 'REOPEN' 
                  ? 'warning' 
                  : actionCode === 'DIRECT_APPROVE'
                    ? 'success'
                    : 'primary'
            }
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
