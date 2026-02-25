/**
 * SatisfactionModal
 * Modal for adding/editing patient satisfaction to a case.
 * 
 * Used in Patient History page to record satisfaction per case.
 * Supports both create and edit modes.
 * 
 * Arabic-first UI with RTL support.
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
  Textarea,
} from '@mui/joy';
import { getSatisfactionStatuses, getCaseSatisfaction, createCaseSatisfaction, updateCaseSatisfaction } from '../../api/satisfactionApi';

/**
 * Extract error message from various error formats
 * Handles Pydantic validation errors (array of {type, loc, msg, input})
 */
const extractErrorMessage = (err) => {
  // Check for Pydantic validation error array
  const detail = err.response?.data?.detail;
  
  if (Array.isArray(detail)) {
    // Pydantic validation errors - extract messages
    return detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
  }
  
  if (typeof detail === 'string') {
    return detail;
  }
  
  if (typeof detail === 'object' && detail !== null) {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  
  return err.message || 'حدث خطأ غير متوقع';
};

const SatisfactionModal = ({ open, onClose, caseId: propCaseId, caseName: propCaseName, caseData, onSuccess }) => {
  // Extract caseId and caseName from caseData or direct props
  const caseId = propCaseId || caseData?.id || caseData?.incident_case_id;
  const caseName = propCaseName || caseData?.name || (caseId ? `حالة #${caseId}` : '');
  
  // State
  const [loading, setLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [feedbackNeeded, setFeedbackNeeded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackDatetime, setFeedbackDatetime] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [satisfactionStatusId, setSatisfactionStatusId] = useState(null);

  // Load satisfaction statuses and existing data on mount
  useEffect(() => {
    if (open && caseId) {
      loadInitialData();
    }
  }, [open, caseId]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    setErrorMessage(null);
    
    try {
      // Load statuses and existing satisfaction in parallel
      const [statusesData, existingData] = await Promise.all([
        getSatisfactionStatuses(),
        getCaseSatisfaction(caseId)
      ]);
      
      setStatuses(statusesData);
      setStatusesLoading(false);
      
      // Check if satisfaction exists and populate form
      if (existingData.exists) {
        setIsEditMode(true);
        setFeedbackNeeded(existingData.feedback_needed || false);
        setFeedbackGiven(existingData.feedback_given || false);
        // Convert datetime to date only (YYYY-MM-DD)
        if (existingData.feedback_datetime) {
          const dateOnly = existingData.feedback_datetime.split('T')[0];
          setFeedbackDatetime(dateOnly);
        } else {
          setFeedbackDatetime('');
        }
        setFeedbackText(existingData.feedback_text || '');
        setSatisfactionStatusId(existingData.satisfaction_status_id);
      } else {
        // Reset form for new entry
        setIsEditMode(false);
        resetForm();
      }
    } catch (err) {
      setErrorMessage('فشل في تحميل البيانات');
      console.error('Error loading satisfaction data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadStatuses = async () => {
    try {
      setStatusesLoading(true);
      const data = await getSatisfactionStatuses();
      setStatuses(data);
    } catch (err) {
      setErrorMessage('فشل في تحميل حالات الرضا');
    } finally {
      setStatusesLoading(false);
    }
  };

  const resetForm = () => {
    setFeedbackNeeded(false);
    setFeedbackGiven(false);
    setFeedbackDatetime('');
    setFeedbackText('');
    setSatisfactionStatusId(null);
    setErrorMessage(null);
  };

  const validateForm = () => {
    if (satisfactionStatusId === null) {
      setErrorMessage('يرجى اختيار حالة الرضا');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);

    const payload = {
      feedback_needed: feedbackNeeded,
      feedback_given: feedbackGiven,
      feedback_datetime: feedbackDatetime || null,
      feedback_text: feedbackText || null,
      satisfaction_status_id: satisfactionStatusId,
    };

    try {
      if (isEditMode) {
        await updateCaseSatisfaction(caseId, payload);
      } else {
        await createCaseSatisfaction(caseId, payload);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage('الرضا موجود بالفعل لهذه الحالة');
      } else if (err.response?.status === 403) {
        setErrorMessage('غير مصرح لك بإضافة الرضا');
      } else if (err.response?.status === 404) {
        setErrorMessage('لم يتم العثور على سجل الرضا');
      } else {
        setErrorMessage(extractErrorMessage(err));
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
          direction: 'rtl',
        }}
      >
        <ModalClose disabled={loading} />

        <Typography level="h4" sx={{ mb: 1, textAlign: 'right' }}>
          📋 {isEditMode ? 'تعديل رضا المريض' : 'إضافة رضا المريض'}
        </Typography>

        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600', textAlign: 'right' }}>
          الحالة: {caseName || `#${caseId}`}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Error Display */}
        {errorMessage && (
          <Alert color="danger" variant="soft" sx={{ mb: 2, textAlign: 'right' }}>
            <Typography level="body-sm">{errorMessage}</Typography>
          </Alert>
        )}

        {initialLoading || statusesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Satisfaction Status (required) */}
            <FormControl required>
              <FormLabel sx={{ textAlign: 'right' }}>حالة الرضا</FormLabel>
              <Select
                placeholder="اختر الحالة..."
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
                    {status.status_name_ar} / {status.status_name_en}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Feedback Needed */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: loading ? 'not-allowed' : 'pointer',
                py: 0.5,
              }}
              onClick={() => !loading && setFeedbackNeeded(!feedbackNeeded)}
            >
              <Checkbox
                checked={feedbackNeeded}
                disabled={loading}
                sx={{ pointerEvents: 'none' }}
              />
              <Typography level="body-md" sx={{ mr: 1, userSelect: 'none' }}>
                تم طلب التغذية الراجعة من المريض
              </Typography>
            </Box>

            {/* Feedback Given */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: loading ? 'not-allowed' : 'pointer',
                py: 0.5,
              }}
              onClick={() => !loading && setFeedbackGiven(!feedbackGiven)}
            >
              <Checkbox
                checked={feedbackGiven}
                disabled={loading}
                sx={{ pointerEvents: 'none' }}
              />
              <Typography level="body-md" sx={{ mr: 1, userSelect: 'none' }}>
                تم تقديم التغذية الراجعة من المريض
              </Typography>
            </Box>

            {/* Feedback Details (shown if feedback_given) */}
            {feedbackGiven && (
              <>
                <FormControl>
                  <FormLabel sx={{ textAlign: 'right' }}>تاريخ التغذية الراجعة</FormLabel>
                  <Input
                    type="date"
                    value={feedbackDatetime}
                    onChange={(e) => setFeedbackDatetime(e.target.value)}
                    disabled={loading}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel sx={{ textAlign: 'right' }}>نص التغذية الراجعة</FormLabel>
                  <Textarea
                    placeholder="أدخل تفاصيل التغذية الراجعة هنا..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={loading}
                    minRows={3}
                    maxRows={6}
                    sx={{ direction: 'rtl', textAlign: 'right' }}
                  />
                </FormControl>
              </>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Info Alert */}
            <Alert color="neutral" variant="soft" sx={{ textAlign: 'right' }}>
              <Typography level="body-xs">
                {isEditMode 
                  ? '✏️ أنت تقوم بتعديل سجل رضا موجود.'
                  : 'ℹ️ سيتم حفظ رضا المريض لهذه الحالة.'}
              </Typography>
            </Alert>

            {/* Footer Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mt: 1 }}>
              <Button
                variant="solid"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                startDecorator={loading && <CircularProgress size="sm" />}
              >
                {loading 
                  ? 'جاري الحفظ...' 
                  : isEditMode 
                    ? 'حفظ التعديلات' 
                    : 'إرسال الرضا'}
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                onClick={onClose}
                disabled={loading}
              >
                إلغاء
              </Button>
            </Box>
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default SatisfactionModal;
