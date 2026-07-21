/**
 * ActionItemNoticeModal — Action Item notification viewer (AIC-S7).
 *
 * Covers two notice cases, one shared form, one Accept button:
 * - messageType === 'ACTION_ITEM_ASSIGNED' — a Calendar-assigned Action Item
 *   (APP_SupervisorActionItem) reached this user/org unit.
 * - messageType === 'ACTION_ITEM_CHANGED'  — a higher-hierarchy edit changed
 *   an Action Item this user originally suggested (APP_SubcaseActionItem).
 *
 * Accept = acknowledge only. No workflow state change — this is a pure
 * notification side-channel, independent of the underlying item's Status.
 */

import React, { useState, useEffect } from 'react';
import { Typography, Box, Chip, CircularProgress, Alert } from '@mui/joy';
import {
  acknowledgeSupervisorActionItem, acknowledgeActionItemChangeNotice,
  getWorkflowIncidentDetail, getSubcaseHistory,
} from '../../api/workflowApi';
import WorkflowFormShell from './WorkflowFormShell';
import ModalLayoutShell from './ModalLayoutShell';
import ContextRegion from './ContextRegion';
import SimpleModalFooter from './SimpleModalFooter';
import ComplaintDetailsSection from './ComplaintDetailsSection';
import InvestigationHistorySection from './InvestigationHistorySection';

const ActionItemNoticeModal = ({ open, onClose, item, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Full case detail — only for ACTION_ITEM_ASSIGNED, which always has an
  // incident (item.incidentRequestCaseId) but may have no subcase (a
  // standalone supervisor-assigned action item), so history is optional.
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isAssigned = item?.messageType === 'ACTION_ITEM_ASSIGNED';

  useEffect(() => {
    if (open && isAssigned && item?.incidentRequestCaseId) {
      setDetailLoading(true);
      setDetailError(null);
      Promise.all([
        getWorkflowIncidentDetail(item.incidentRequestCaseId),
        item.subcaseId ? getSubcaseHistory(item.subcaseId).catch(() => null) : Promise.resolve(null),
      ])
        .then(([data, historyData]) => {
          setDetail(data);
          setHistory(historyData);
        })
        .catch((err) => setDetailError(err.message || 'فشل تحميل تفاصيل الحالة.'))
        .finally(() => setDetailLoading(false));
    }
    if (!open) {
      setDetail(null);
      setHistory(null);
      setDetailError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAssigned, item?.incidentRequestCaseId, item?.subcaseId]);

  if (!item) return null;

  const caseLabel = item.incidentNumber || (item.incidentRequestCaseId ? `#${item.incidentRequestCaseId}` : '');
  const title = isAssigned
    ? `بند إجراء جديد — ${caseLabel}`.trim()
    : 'تعديل على بند إجراء مُقترَح';

  const handleAcknowledge = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isAssigned) {
        await acknowledgeSupervisorActionItem(item.actionItemId);
      } else {
        await acknowledgeActionItemChangeNotice(item.noticeId);
      }
      onClose();
      onSuccess?.();
    } catch (err) {
      setSubmitError(err.message || 'فشل تنفيذ الإجراء، يرجى المحاولة مرة أخرى.');
      setSubmitting(false);
    }
  };

  return (
    <WorkflowFormShell open={open} onClose={onClose} submitting={submitting} size="sm">
      <ModalLayoutShell
        context={
          <ContextRegion
            title={title}
            orgUnitName={isAssigned ? item.targetOrgUnitName : null}
            item={item}
          />
        }
        mainContent={
          <Box>
            {isAssigned ? (
              <>
                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1.5 }}>
                  تم تكليفك ببند إجراء جديد من المشرف.
                </Typography>
                <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {item.description}
                </Typography>
                {item.createdByDisplayName && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 90 }}>بواسطة:</Typography>
                    <Typography level="body-sm">{item.createdByDisplayName}</Typography>
                  </Box>
                )}
                {item.dueDate && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 90 }}>تاريخ الاستحقاق:</Typography>
                    <Typography level="body-sm">{item.dueDate.toLocaleDateString('ar-SA')}</Typography>
                  </Box>
                )}

                {detailLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                )}

                {detailError && !detailLoading && (
                  <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
                    <Typography level="body-sm">{detailError}</Typography>
                  </Alert>
                )}

                {!detailLoading && !detailError && (
                  <>
                    <ComplaintDetailsSection
                      incidentData={detail}
                      item={item}
                      open={detailsOpen}
                      onChange={() => setDetailsOpen((p) => !p)}
                    />
                    <InvestigationHistorySection history={history} responseData={null} />
                  </>
                )}
              </>
            ) : (
              <>
                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1.5 }}>
                  تم تعديل بند الإجراء الذي اقترحتَه:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
                  <Box>
                    <Typography level="body-xs" fontWeight="bold" sx={{ color: 'neutral.500' }}>قبل:</Typography>
                    <Typography level="body-sm" sx={{ textDecoration: 'line-through', color: 'neutral.500' }}>
                      {item.oldTitle}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography level="body-xs" fontWeight="bold" sx={{ color: 'neutral.500' }}>بعد:</Typography>
                    <Typography level="body-sm" fontWeight="bold">{item.newTitle}</Typography>
                  </Box>
                </Box>
                {item.changedByDisplayName && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography level="body-xs" fontWeight="bold" sx={{ minWidth: 90 }}>بواسطة:</Typography>
                    <Typography level="body-sm">{item.changedByDisplayName}</Typography>
                  </Box>
                )}
              </>
            )}

            {item.createdAt || item.changedAt ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip size="sm" variant="soft" color="neutral">
                  {(item.createdAt || item.changedAt).toLocaleDateString('ar-SA')}
                </Chip>
              </Box>
            ) : null}
          </Box>
        }
        footer={
          <SimpleModalFooter
            onClose={onClose}
            closeDisabled={submitting}
            primaryLabel="حسناً"
            onPrimary={handleAcknowledge}
            primaryDisabled={submitting}
            primaryLoading={submitting}
            error={submitError}
          />
        }
      />
    </WorkflowFormShell>
  );
};

export default ActionItemNoticeModal;
