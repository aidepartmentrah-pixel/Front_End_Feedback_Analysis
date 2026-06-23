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
 */

import React, { useState, useEffect } from 'react';
import {
  Modal, ModalDialog, ModalClose,
  Typography, Box, Button, Textarea,
  FormControl, FormLabel, Alert, CircularProgress, Divider, Chip,
} from '@mui/joy';
import { savePatientServicesDecision, getSubcaseFillState } from '../../api/workflowApi';

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

  // ── Read-Only Mode ──────────────────────────────────────────────────────────
  if (readOnly) {
    return (
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          sx={{ maxWidth: 600, width: '100%', direction: 'rtl', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
          layout="center"
        >
          <ModalClose />

          <Typography level="title-lg" sx={{ mb: 1 }}>قرار خدمات المرضى</Typography>
          <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
            القرار العلمي الصادر عن خدمات المرضى
          </Typography>

          <Divider />

          <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
            {/* Case chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {item.incidentNumber && (
                <Chip size="sm" variant="outlined" color="neutral">{item.incidentNumber}</Chip>
              )}
              {item.targetOrgUnitName && (
                <Chip size="sm" variant="soft" color="primary">{item.targetOrgUnitName}</Chip>
              )}
              {item.subcaseId && (
                <Chip size="sm" variant="soft" color="neutral">Subcase #{item.subcaseId}</Chip>
              )}
            </Box>

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
                {/* Decision text */}
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.level1', borderRadius: 'sm' }}>
                  <Typography level="body-xs" fontWeight="bold" sx={{ mb: 1 }}>
                    نص القرار
                  </Typography>
                  <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {decisionData.decisionText || '—'}
                  </Typography>
                </Box>

                {/* Metadata */}
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

          <Divider />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2 }}>
            <Button variant="plain" color="neutral" onClick={onClose}>إغلاق</Button>
            <Button variant="solid" color="primary" onClick={onClose}>حسناً</Button>
          </Box>
        </ModalDialog>
      </Modal>
    );
  }

  // ── Write Mode ──────────────────────────────────────────────────────────────
  return (
    <Modal open={open} onClose={saving ? undefined : onClose}>
      <ModalDialog
        sx={{ maxWidth: 600, width: '100%', direction: 'rtl' }}
        layout="center"
      >
        {!saving && <ModalClose />}

        <Typography level="title-lg" sx={{ mb: 1 }}>
          {isEdit ? 'تعديل القرار' : 'إدخال القرار'}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
          قرار خدمات المرضى بحسب المراجع العلميّة
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Case summary */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {item.incidentNumber && (
            <Chip size="sm" variant="outlined" color="neutral">{item.incidentNumber}</Chip>
          )}
          {item.targetOrgUnitName && (
            <Chip size="sm" variant="soft" color="primary">{item.targetOrgUnitName}</Chip>
          )}
          {item.subcaseId && (
            <Chip size="sm" variant="soft" color="neutral">Subcase #{item.subcaseId}</Chip>
          )}
        </Box>

        {/* Administration response context */}
        {item.administrationExplanationText && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.level1', borderRadius: 'sm' }}>
            <Typography level="body-xs" fontWeight="bold" sx={{ mb: 0.5 }}>رد الإدارة العليا</Typography>
            <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
              {item.administrationExplanationText}
            </Typography>
          </Box>
        )}

        {/* Decision textarea */}
        <FormControl required sx={{ mb: 2 }}>
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

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="plain" color="neutral" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button
            variant="solid"
            color="primary"
            onClick={handleSave}
            disabled={saving || !decisionText.trim()}
            startDecorator={saving ? <CircularProgress size="sm" /> : null}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ القرار'}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default PatientServicesDecisionModal;
