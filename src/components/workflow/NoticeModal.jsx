/**
 * NoticeModal — Informational viewer for Notice-type inbox items.
 *
 * Notice items (messageType === 'NOTICE') are informational messages sent to
 * one or more units. They have no complaint workflow, no RCA, no action items.
 *
 * This is an informational form — footer is Close + OK only.
 * No complaint workflow controls appear here.
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/joy';
import { getWorkflowIncidentDetail, actOnSubcase } from '../../api/workflowApi';

// Notice items carry whatever forward action the underlying case status allows
// (e.g. a section seeing a notice on a new complaint can still accept_complaint
// to advance it). Preference order mirrors SeasonalReportViewerModal.
function getNoticeAdvanceAction(allowedActions = []) {
  if (allowedActions.includes('accept_complaint')) return 'ACCEPT_COMPLAINT';
  if (allowedActions.includes('accept'))            return 'APPROVE';
  if (allowedActions.includes('submit_response'))   return 'SUBMIT_RESPONSE';
  return null;
}

const NoticeModal = ({ open, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (open && item?.incidentId) {
      fetchDetail();
    }
    if (!open) {
      setDetail(null);
      setError(null);
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.incidentId]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkflowIncidentDetail(item.incidentId);
      setDetail(data);
    } catch (err) {
      setError(err.message || 'فشل تحميل تفاصيل الإشعار.');
    } finally {
      setLoading(false);
    }
  };

  const advanceAction = getNoticeAdvanceAction(item?.allowedActions || []);

  const handleAcknowledge = async () => {
    if (!advanceAction || !item?.subcaseId) {
      onClose();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await actOnSubcase(item.subcaseId, advanceAction);
      onClose();
      onSuccess?.();
    } catch (err) {
      setSubmitError(err.message || 'فشل تنفيذ الإجراء، يرجى المحاولة مرة أخرى.');
      setSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 560,
          width: '100%',
          direction: 'rtl',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
        layout="center"
      >
        <ModalClose />

        <Typography level="title-lg" sx={{ mb: 1 }}>
          {item.messageType === 'PATIENT_SERVICES_OPINION' ? 'إشعار — بانتظار قرار خدمات المرضى' : 'إشعار'}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
          {item.messageType === 'PATIENT_SERVICES_OPINION'
            ? 'هذه الحالة بانتظار قرار خدمات المرضى بحسب المراجع العلميّة. لا يوجد إجراء مطلوب منكم حاليًا.'
            : 'رسالة إعلامية — لا يوجد إجراء مطلوب'}
        </Typography>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
          {/* Context chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {item.incidentNumber && (
              <Chip size="sm" variant="outlined" color="neutral">{item.incidentNumber}</Chip>
            )}
            {item.targetOrgUnitName && (
              <Chip size="sm" variant="soft" color="neutral">{item.targetOrgUnitName}</Chip>
            )}
            {item.createdAt && (
              <Chip size="sm" variant="soft" color="neutral">
                {item.createdAt.toLocaleDateString('ar-SA')}
              </Chip>
            )}
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && !loading && (
            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
              <Typography level="body-sm">{error}</Typography>
            </Alert>
          )}

          {detail && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {detail.complaint_text && (
                <Box sx={{ p: 1.5, bgcolor: 'background.level1', borderRadius: 'sm' }}>
                  <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                    {detail.complaint_text}
                  </Typography>
                </Box>
              )}
              {detail.patient_name && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 110 }}>المريض:</Typography>
                  <Typography level="body-sm">{detail.patient_name}</Typography>
                </Box>
              )}
              {detail.issuing_department_name && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 110 }}>القسم المُصدر:</Typography>
                  <Typography level="body-sm">{detail.issuing_department_name}</Typography>
                </Box>
              )}
              {detail.feedback_received_date && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 110 }}>تاريخ الإشعار:</Typography>
                  <Typography level="body-sm">{detail.feedback_received_date}</Typography>
                </Box>
              )}
              {detail.doctors?.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 110 }}>الأطباء:</Typography>
                  <Typography level="body-sm">{detail.doctors.map(d => d.name).join('، ')}</Typography>
                </Box>
              )}
              {detail.employees?.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 110 }}>الموظفون:</Typography>
                  <Typography level="body-sm">{detail.employees.map(e => e.full_name).join('، ')}</Typography>
                </Box>
              )}
            </Box>
          )}

          {!detail && !loading && !error && (
            <Typography level="body-sm" sx={{ color: 'neutral.500', fontStyle: 'italic' }}>
              لا توجد تفاصيل إضافية متاحة لهذا الإشعار.
            </Typography>
          )}
        </Box>

        {submitError && (
          <Alert color="danger" variant="soft" sx={{ mb: 1 }}>
            <Typography level="body-sm">{submitError}</Typography>
          </Alert>
        )}

        <Divider />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2, direction: 'ltr' }}>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={submitting}>إغلاق</Button>
          <Button
            variant="solid"
            color="primary"
            onClick={handleAcknowledge}
            loading={submitting}
            disabled={submitting || loading}
          >
            حسناً
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default NoticeModal;
