/**
 * NoticeModal — Informational viewer for Notice-type inbox items.
 *
 * Notice items (messageType === 'NOTICE') are informational messages sent to
 * one or more units. They have no complaint workflow, no RCA, no action items.
 *
 * This is an informational form — footer is Close + OK only.
 * No complaint workflow controls appear here.
 *
 * Stage S6: migrated onto the shared WorkflowFormShell/ModalLayoutShell/
 * ContextRegion/SimpleModalFooter system. All state, handlers, and API calls
 * below are unchanged — only the surrounding JSX shell moved.
 */

import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, Chip, CircularProgress, Alert } from '@mui/joy';
import { getWorkflowIncidentDetail, actOnSubcase } from '../../api/workflowApi';
import WorkflowFormShell from './WorkflowFormShell';
import ModalLayoutShell from './ModalLayoutShell';
import ContextRegion from './ContextRegion';
import SimpleModalFooter from './SimpleModalFooter';
import StatusChip from './StatusChip';
import theme from '../../theme';

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

  const caseLabel = item.incidentNumber || `#${item.subcaseId}`;
  const title = item.messageType === 'PATIENT_SERVICES_OPINION'
    ? `إشعار — بانتظار قرار خدمات المرضى — ${caseLabel}`
    : `إشعار — ${caseLabel}`;

  return (
    <WorkflowFormShell open={open} onClose={onClose} submitting={submitting} size="sm">
      <ModalLayoutShell
        context={
          <ContextRegion
            title={title}
            orgUnitName={item.targetOrgUnitName}
            statusChip={item.status ? <StatusChip status={item.status} /> : null}
            item={item}
          />
        }
        mainContent={
          <Box>
            <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
              {item.messageType === 'PATIENT_SERVICES_OPINION'
                ? 'هذه الحالة بانتظار قرار خدمات المرضى بحسب المراجع العلميّة. لا يوجد إجراء مطلوب منكم حاليًا.'
                : 'رسالة إعلامية — لا يوجد إجراء مطلوب'}
            </Typography>

            {item.createdAt && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip size="sm" variant="soft" color="neutral">
                  {item.createdAt.toLocaleDateString('ar-SA')}
                </Chip>
              </Box>
            )}

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
                  <Card
                    variant="soft"
                    color="neutral"
                    sx={{
                      p: 1.5,
                      borderRight: `2px solid ${theme.colors.primary}`,
                    }}
                  >
                    <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                      {detail.complaint_text}
                    </Typography>
                  </Card>
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
        }
        footer={
          <SimpleModalFooter
            onClose={onClose}
            closeDisabled={submitting}
            primaryLabel="حسناً"
            onPrimary={handleAcknowledge}
            primaryDisabled={submitting || loading}
            primaryLoading={submitting}
            error={submitError}
          />
        }
      />
    </WorkflowFormShell>
  );
};

export default NoticeModal;
