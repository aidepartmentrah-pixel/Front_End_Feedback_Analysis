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
  
  // Helper component for clickable checkbox rows
  const RcaCheckboxRow = ({ label, field, disabled }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: disabled ? 'not-allowed' : 'pointer',
        py: 0.5,
        '&:hover': { backgroundColor: disabled ? 'transparent' : 'rgba(0,0,0,0.02)' },
        borderRadius: '4px',
        px: 0.5,
      }}
      onClick={() => !disabled && updateRcaField(field, !rcaFeedback[field])}
    >
      <Checkbox
        checked={rcaFeedback[field]}
        disabled={disabled}
        sx={{ pointerEvents: 'none' }}
      />
      <Typography level="body-md" sx={{ mr: 1, userSelect: 'none' }}>
        {label}
      </Typography>
    </Box>
  );
  
  const renderRcaForm = () => (
    <Box sx={{ mt: 2 }}>
      <Typography level="title-md" sx={{ mb: 2, color: 'primary.600' }}>
        📋 تحليل السبب الجذري (RCA)
      </Typography>
      
      <AccordionGroup sx={{ maxWidth: '100%' }}>
        {/* Staff Causes */}
        <Accordion defaultExpanded>
          <AccordionSummary>
            <Typography level="title-sm">👥 أسباب متعلقة بالكادر</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <RcaCheckboxRow label="قصور في التدريب" field="Cause_Staff_Training" disabled={loading} />
              <RcaCheckboxRow label="عدم كفاية الحوافز" field="Cause_Staff_Incentives" disabled={loading} />
              <RcaCheckboxRow label="مشاكل في الكفاءة" field="Cause_Staff_Competency" disabled={loading} />
              <RcaCheckboxRow label="نقص في الكادر" field="Cause_Staff_Understaffed" disabled={loading} />
              <RcaCheckboxRow label="عدم الالتزام" field="Cause_Staff_NonCompliance" disabled={loading} />
              <RcaCheckboxRow label="ضعف التنسيق" field="Cause_Staff_NoCoordination" disabled={loading} />
              <RcaCheckboxRow label="أخرى (حدد أدناه)" field="Cause_Staff_Other" disabled={loading} />
              {rcaFeedback.Cause_Staff_Other && (
                <Input
                  placeholder="حدد السبب الآخر..."
                  value={rcaFeedback.Cause_Staff_OtherText}
                  onChange={(e) => updateRcaField('Cause_Staff_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ mr: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Process Causes */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">⚙️ أسباب متعلقة بالإجراءات</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <RcaCheckboxRow label="غير شاملة" field="Cause_Process_NotComprehensive" disabled={loading} />
              <RcaCheckboxRow label="إجراءات غير واضحة" field="Cause_Process_Unclear" disabled={loading} />
              <RcaCheckboxRow label="عدم وجود بروتوكول" field="Cause_Process_MissingProtocol" disabled={loading} />
              <RcaCheckboxRow label="أخرى (حدد أدناه)" field="Cause_Process_Other" disabled={loading} />
              {rcaFeedback.Cause_Process_Other && (
                <Input
                  placeholder="حدد السبب الآخر..."
                  value={rcaFeedback.Cause_Process_OtherText}
                  onChange={(e) => updateRcaField('Cause_Process_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ mr: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Equipment Causes */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">🔧 أسباب متعلقة بالمعدات</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <RcaCheckboxRow label="المعدات غير متوفرة" field="Cause_Equipment_NotAvailable" disabled={loading} />
              <RcaCheckboxRow label="النظام غير مكتمل" field="Cause_Equipment_SystemIncomplete" disabled={loading} />
              <RcaCheckboxRow label="صعوبة في الاستخدام" field="Cause_Equipment_HardToApply" disabled={loading} />
              <RcaCheckboxRow label="أخرى (حدد أدناه)" field="Cause_Equipment_Other" disabled={loading} />
              {rcaFeedback.Cause_Equipment_Other && (
                <Input
                  placeholder="حدد السبب الآخر..."
                  value={rcaFeedback.Cause_Equipment_OtherText}
                  onChange={(e) => updateRcaField('Cause_Equipment_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ mr: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Environment Causes */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">🏢 أسباب متعلقة بالبيئة</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <RcaCheckboxRow label="طبيعة المكان/الموقع" field="Cause_Environment_PlaceNature" disabled={loading} />
              <RcaCheckboxRow label="مشاكل في المحيط" field="Cause_Environment_Surroundings" disabled={loading} />
              <RcaCheckboxRow label="ظروف العمل" field="Cause_Environment_WorkConditions" disabled={loading} />
              <RcaCheckboxRow label="أخرى (حدد أدناه)" field="Cause_Environment_Other" disabled={loading} />
              {rcaFeedback.Cause_Environment_Other && (
                <Input
                  placeholder="حدد السبب الآخر..."
                  value={rcaFeedback.Cause_Environment_OtherText}
                  onChange={(e) => updateRcaField('Cause_Environment_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ mr: 3 }}
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Preventive Measures */}
        <Accordion>
          <AccordionSummary>
            <Typography level="title-sm">🛡️ التدابير الوقائية المتخذة</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <RcaCheckboxRow label="اجتماعات شهرية" field="Preventive_MonthlyMeetings" disabled={loading} />
              <RcaCheckboxRow label="برامج تدريبية" field="Preventive_TrainingPrograms" disabled={loading} />
              <RcaCheckboxRow label="زيادة الكادر" field="Preventive_IncreaseStaff" disabled={loading} />
              <RcaCheckboxRow label="إجراءات لجنة المراجعة" field="Preventive_MMCommitteeActions" disabled={loading} />
              <RcaCheckboxRow label="أخرى (حدد أدناه)" field="Preventive_Other" disabled={loading} />
              {rcaFeedback.Preventive_Other && (
                <Input
                  placeholder="حدد التدبير الوقائي الآخر..."
                  value={rcaFeedback.Preventive_OtherText}
                  onChange={(e) => updateRcaField('Preventive_OtherText', e.target.value)}
                  disabled={loading}
                  sx={{ mr: 3 }}
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
        <Typography level="title-md">بنود الإجراءات</Typography>
        <Button
          size="sm"
          variant="outlined"
          startDecorator={<AddIcon />}
          onClick={addActionItem}
          disabled={loading}
        >
          إضافة بند
        </Button>
      </Box>

      {actionItems.map((item, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography level="title-sm">بند {index + 1}</Typography>
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
            <FormLabel>العنوان</FormLabel>
            <Input
              placeholder="عنوان بند الإجراء"
              value={item.title}
              onChange={(e) => updateActionItem(index, 'title', e.target.value)}
              disabled={loading}
            />
          </FormControl>

          <FormControl sx={{ mb: 1 }}>
            <FormLabel>الوصف</FormLabel>
            <Textarea
              placeholder="وصف اختياري"
              minRows={2}
              value={item.description}
              onChange={(e) => updateActionItem(index, 'description', e.target.value)}
              disabled={loading}
            />
          </FormControl>

          <FormControl>
            <FormLabel>تاريخ الاستحقاق</FormLabel>
            <Input
              type="date"
              value={item.due_date}
              onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  min: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
                }
              }}
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
              <FormLabel>التوضيح / الشرح</FormLabel>
              <Textarea
                placeholder="أدخل التوضيح..."
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
              <FormLabel>التوضيح / الشرح</FormLabel>
              <Textarea
                placeholder="أدخل التوضيح..."
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
            <FormLabel>سبب الرفض</FormLabel>
            <Textarea
              placeholder="أدخل سبب الرفض..."
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
              هل أنت متأكد من اعتماد هذه الحالة؟
            </Typography>
          </Alert>
        );

      case 'FORCE_CLOSE':
        return (
          <FormControl required>
            <FormLabel>سبب الإغلاق الإجباري</FormLabel>
            <Textarea
              placeholder="أدخل سبب الإغلاق الإجباري..."
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
                سيتم إعادة إرسال الحالة إلى القسم لإعادة المراجعة.
                سيرى مسؤول القسم هذه الحالة في صندوق الوارد مرة أخرى.
              </Typography>
            </Alert>
            <FormControl required>
              <FormLabel>ملاحظة للقسم</FormLabel>
              <Textarea
                placeholder="وضح سبب إعادة إرسال الحالة للقسم..."
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
    const bulkSuffix = isBulkOperation ? ` (${targetSubcaseIds.length} حالات فرعية)` : '';
    switch (actionCode) {
      case 'SUBMIT_RESPONSE':
        return 'إرسال الرد' + bulkSuffix;
      case 'DIRECT_APPROVE':
        return isBulkOperation 
          ? `⚡ اعتماد جماعي مباشر (${targetSubcaseIds.length} حالات فرعية)`
          : '⚡ اعتماد مباشر';
      case 'REJECT':
        return 'رفض الحالة' + bulkSuffix;
      case 'APPROVE':
        return 'اعتماد الحالة' + bulkSuffix;
      case 'OVERRIDE':
        return 'تجاوز الحالة' + bulkSuffix;
      case 'FORCE_CLOSE':
        return 'إغلاق إجباري' + bulkSuffix;
      case 'REOPEN':
        return 'إعادة إرسال للقسم' + bulkSuffix;
      default:
        return 'إجراء على الحالة' + bulkSuffix;
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
          direction: 'rtl',
          textAlign: 'right',
        }}
      >
        <ModalClose disabled={loading} />
        
        <Typography level="h4" sx={{ mb: 2 }}>
          {getActionTitle()}
        </Typography>

        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
          {isBulkOperation 
            ? `معالجة ${targetSubcaseIds.length} حالات فرعية من نفس الحالة`
            : `رقم الحالة الفرعية: #${targetSubcaseIds[0]}`
          }
        </Typography>
        
        {/* Bulk Progress Indicator */}
        {isBulkOperation && loading && (
          <Alert color="primary" variant="soft" sx={{ mb: 2 }}>
            <Typography level="body-sm">
              جاري المعالجة... {bulkProgress.completed + bulkProgress.failed}/{bulkProgress.total} مكتمل
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
            إلغاء
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
            {loading ? 'جاري المعالجة...' : 'تأكيد'}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default CaseActionModal;
