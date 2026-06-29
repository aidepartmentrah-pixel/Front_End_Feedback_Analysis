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
  FormControl, FormLabel, Alert, Chip,
} from '@mui/joy';
import { savePatientServicesDecision, acknowledgePatientServicesDecision } from '../../api/workflowApi';
import WorkflowFormShell from './WorkflowFormShell';
import ModalLayoutShell from './ModalLayoutShell';
import ContextRegion from './ContextRegion';
import SimpleModalFooter from './SimpleModalFooter';
import StatusChip from './StatusChip';
import theme from '../../theme';

const PatientServicesDecisionModal = ({ open, item, onClose, onSuccess, readOnly = false }) => {
  // Write mode state
  const [decisionText, setDecisionText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Read-only mode: decision text comes directly from the inbox/archive item
  const [acknowledging, setAcknowledging] = useState(false);
  const [acknowledgeError, setAcknowledgeError] = useState(null);

  // Pre-fill on open
  useEffect(() => {
    if (!open || !item) return;
    setError(null);
    setAcknowledgeError(null);
    if (!readOnly) {
      setDecisionText(item.patientServicesDecisionText || '');
    }
  }, [open, item, readOnly]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setDecisionText('');
      setError(null);
      setAcknowledgeError(null);
      setAcknowledging(false);
    }
  }, [open]);

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

  const canAcknowledge = readOnly && item?.allowedActions?.includes('acknowledge_decision');

  const handleAcknowledge = async () => {
    if (!item?.subcaseId) { onClose(); return; }
    setAcknowledging(true);
    setAcknowledgeError(null);
    try {
      await acknowledgePatientServicesDecision(item.subcaseId);
      onSuccess?.();
      onClose();
    } catch (err) {
      setAcknowledgeError(err.message || 'فشل تأكيد القرار، يرجى المحاولة مرة أخرى.');
      setAcknowledging(false);
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

              <Card
                variant="soft"
                color="neutral"
                sx={{
                  mb: 2, p: 2,
                  borderRight: `2px solid ${theme.colors.primary}`,
                }}
              >
                <Typography level="body-xs" fontWeight="bold" sx={{ mb: 1 }}>
                  نص القرار
                </Typography>
                <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {item.patientServicesDecisionText || '—'}
                </Typography>
              </Card>
            </Box>
          }
          footer={
            <SimpleModalFooter
              onClose={onClose}
              closeDisabled={acknowledging}
              primaryLabel="حسناً"
              onPrimary={canAcknowledge ? handleAcknowledge : onClose}
              primaryDisabled={acknowledging}
              primaryLoading={acknowledging}
              error={acknowledgeError}
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
