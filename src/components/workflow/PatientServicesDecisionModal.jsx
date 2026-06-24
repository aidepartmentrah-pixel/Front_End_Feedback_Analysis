/**
 * PatientServicesDecisionModal
 *
 * Two modes:
 *
 * 1. Write mode (readOnly=false, default):
 *    Allows a Complaint Supervisor to record or edit the Patient Services
 *    scientific decision. Opens from inbox items with
 *    save_patient_services_decision or edit_patient_services_decision actions.
 *
 * 2. Read-only mode (readOnly=true):
 *    Informational viewer for completed decisions. Fetches decision text via
 *    getSubcaseFillState. Opens from archive items with status
 *    PATIENT_SERVICES_DECISION_COMPLETED where the user has no write action.
 *    Footer: Close + OK (no save).
 *
 * Stage S6: both modes migrated onto the shared WorkflowFormShell/
 * ModalLayoutShell/ContextRegion/SimpleModalFooter system. All state,
 * handlers, and API calls below are unchanged — only the surrounding JSX
 * shell moved.
 */

import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Card, Textarea,
  FormControl, FormLabel, Alert, CircularProgress, Chip,
} from '@mui/joy';
import { savePatientServicesDecision, getSubcaseFillState } from '../../api/workflowApi';
import WorkflowFormShell from './WorkflowFormShell';
import ModalLayoutShell from './ModalLayoutShell';
import ContextRegion from './ContextRegion';
import SimpleModalFooter from './SimpleModalFooter';
import StatusChip from './StatusChip';

const PatientServicesDecisionModal = ({ open, item, onClose, onSuccess, readOnly = false }) => {
  // Write mode state
  const [decisionText, setDecisionText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Read-only mode state
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [decisionData, setDecisionData] = useState(null);

  // Pre-fill / fetch on open
  useEffect(() => {
    if (!open || !item) return;
    setError(null);
    setFetchError(null);

    if (readOnly) {
      fetchDecisionData();
    } else {
      setDecisionText(item.patientServicesDecisionText || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item, readOnly]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setDecisionData(null);
      setDecisionText('');
      setError(null);
      setFetchError(null);
    }
  }, [open]);

  const fetchDecisionData = async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const fillState = await getSubcaseFillState(item.subcaseId);
      setDecisionData(fillState.patientServicesDecision);
    } catch (err) {
      setFetchError(err.message || 'فشل تحميل بيانات القرار');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!decisionText.trim()) {
      setError('يرجى إدخال نص القرار');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await savePatientServicesDecision(item.subcaseId, decisionText.trim());
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  const isEdit = !readOnly && (
    item.status === 'PATIENT_SERVICES_DECISION_COMPLETED'
    || item.allowedActions?.includes('edit_patient_services_decision')
  );

  const caseLabel = item.incidentNumber || `#${item.subcaseId}`;

  // ── Read-Only Mode ──────────────────────────────────────────────────────────
  if (readOnly) {
    return (
      <WorkflowFormShell open={open} onClose={onClose} submitting={false} size="sm">
        <ModalLayoutShell
          context={
            <ContextRegion
              title={`قرار خدمات المرضى — ${caseLabel}`}
              orgUnitName={item.targetOrgUnitName}
              statusChip={item.status ? <StatusChip status={item.status} /> : null}
              item={item}
            />
          }
          mainContent={
            <Box>
              <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
                القرار العلمي الصادر عن خدمات المرضى
              </Typography>

              {item.subcaseId && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip size="sm" variant="soft" color="neutral">Subcase #{item.subcaseId}</Chip>
                </Box>
              )}

              {fetchLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {fetchError && !fetchLoading && (
                <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
                  {fetchError}
                </Alert>
              )}

              {decisionData && !fetchLoading && (
                <>
                  <Card variant="soft" color="neutral" sx={{ mb: 2, p: 2 }}>
                    <Typography level="body-xs" fontWeight="bold" sx={{ mb: 1 }}>
                      نص القرار
                    </Typography>
                    <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {decisionData.decisionText || '—'}
                    </Typography>
                  </Card>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {decisionData.enteredBy && (
                      <Box>
                        <Typography level="body-xs" sx={{ color: 'neutral.500' }}>أدخله</Typography>
                        <Typography level="body-sm">{decisionData.enteredBy}</Typography>
                      </Box>
                    )}
                    {decisionData.decisionAt && (
                      <Box>
                        <Typography level="body-xs" sx={{ color: 'neutral.500' }}>تاريخ القرار</Typography>
                        <Typography level="body-sm">{decisionData.decisionAt.toLocaleDateString('ar-SA')}</Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          }
          footer={
            <SimpleModalFooter
              onClose={onClose}
              primaryLabel="حسناً"
              onPrimary={onClose}
            />
          }
        />
      </WorkflowFormShell>
    );
  }

  // ── Write Mode ──────────────────────────────────────────────────────────────
  return (
    <WorkflowFormShell open={open} onClose={onClose} submitting={saving} size="sm">
      <ModalLayoutShell
        context={
          <ContextRegion
            title={`${isEdit ? 'تعديل القرار' : 'إدخال القرار'} — ${caseLabel}`}
            orgUnitName={item.targetOrgUnitName}
            statusChip={item.status ? <StatusChip status={item.status} /> : null}
            item={item}
          />
        }
        mainContent={
          <Box>
            <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
              قرار خدمات المرضى بحسب المراجع العلميّة
            </Typography>

            {item.subcaseId && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip size="sm" variant="soft" color="neutral">Subcase #{item.subcaseId}</Chip>
              </Box>
            )}

            {item.administrationExplanationText && (
              <Card variant="soft" color="neutral" sx={{ mb: 2, p: 1.5 }}>
                <Typography level="body-xs" fontWeight="bold" sx={{ mb: 0.5 }}>رد الإدارة العليا</Typography>
                <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                  {item.administrationExplanationText}
                </Typography>
              </Card>
            )}

            <FormControl required>
              <FormLabel>قرار خدمات المرضى بحسب المراجع العلميّة</FormLabel>
              <Textarea
                minRows={4}
                maxRows={10}
                placeholder="اكتب القرار هنا..."
                value={decisionText}
                onChange={e => setDecisionText(e.target.value)}
                disabled={saving}
                sx={{ direction: 'rtl' }}
              />
            </FormControl>
          </Box>
        }
        footer={
          <SimpleModalFooter
            onClose={onClose}
            closeLabel="إلغاء"
            closeDisabled={saving}
            primaryLabel="حفظ القرار"
            onPrimary={handleSave}
            primaryDisabled={saving || !decisionText.trim()}
            primaryLoading={saving}
            error={error}
          />
        }
      />
    </WorkflowFormShell>
  );
};

export default PatientServicesDecisionModal;
