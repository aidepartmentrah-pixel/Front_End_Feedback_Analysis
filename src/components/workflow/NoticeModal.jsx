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
import { Typography, Box, Chip, CircularProgress, Alert } from '@mui/joy';
import { getWorkflowIncidentDetail, getSubcaseHistory, actOnSubcase } from '../../api/workflowApi';
import WorkflowFormShell from './WorkflowFormShell';
import ModalLayoutShell from './ModalLayoutShell';
import ContextRegion from './ContextRegion';
import SimpleModalFooter from './SimpleModalFooter';
import StatusChip from './StatusChip';
import ComplaintDetailsSection from './ComplaintDetailsSection';
import InvestigationHistorySection from './InvestigationHistorySection';

// Notice items carry whatever forward action the underlying case status allows
// (e.g. a section seeing a notice on a new complaint can still accept_complaint
// to advance it). Preference order mirrors SeasonalReportViewerModal.
function getNoticeAdvanceAction(allowedActions = []) {
  if (allowedActions.includes('accept_complaint'))     return 'ACCEPT_COMPLAINT';
  if (allowedActions.includes('accept'))                return 'APPROVE';
  if (allowedActions.includes('submit_response'))       return 'SUBMIT_RESPONSE';
  if (allowedActions.includes('acknowledge_decision'))  return 'ACKNOWLEDGE_DECISION';
  return null;
}

const NoticeModal = ({ open, onClose, item, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (open && item?.incidentId) {
      fetchDetail();
    }
    if (!open) {
      setDetail(null);
      setHistory(null);
      setError(null);
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.incidentId]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, historyData] = await Promise.all([
        getWorkflowIncidentDetail(item.incidentId),
        item.subcaseId ? getSubcaseHistory(item.subcaseId).catch(() => null) : Promise.resolve(null),
      ]);
      setDetail(data);
      setHistory(historyData);
    } catch (err) {
      setError(err.message || 'فشل تحميل تفاصيل التنويه.');
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
  const title = `تنويه — ${caseLabel}`;

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
              رسالة إعلامية — لا يوجد إجراء مطلوب
            </Typography>

            {item.createdAt && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip size="sm" variant="soft" color="neutral">
                  {item.createdAt.toLocaleDateString('ar-SA')}
                </Chip>
              </Box>
            )}

            {/* Decision text lives in the سجل التحقيق (InvestigationHistorySection)
                "قرار خدمات المرضى" entry below once the decision lands — showing it
                again here would duplicate the exact same text. */}

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

            {!loading && !error && (
              <>
                <ComplaintDetailsSection
                  incidentData={detail}
                  item={item}
                  open={detailsOpen}
                  onChange={() => setDetailsOpen((p) => !p)}
                  sectionTitle="📋 تفاصيل الملاحظة"
                  emptyText="لم يتم تحميل تفاصيل الملاحظة"
                />
                <InvestigationHistorySection history={history} responseData={null} />
              </>
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
