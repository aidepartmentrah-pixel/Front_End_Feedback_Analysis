import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Alert,
  CircularProgress,
  Chip,
  Card,
  IconButton,
} from '@mui/joy';
import CloseRounded from '@mui/icons-material/CloseRounded';
import WorkflowFormShell from './WorkflowFormShell';
import ModalLayoutShell from './ModalLayoutShell';
import SimpleModalFooter from './SimpleModalFooter';
import { fetchAllTargetUnits } from '../../api/orgUnits';
import { createSupervisorActionItem } from '../../api/supervisorActionItems';
import apiClient from '../../api/apiClient';

/**
 * CreateSupervisorActionItemModal
 * Allows Complaint Supervisor to create a cross-unit administrative action item
 * directly from the Calendar page. No acceptance step — pure assignment.
 *
 * Props:
 *   open      — bool
 *   onClose   — () => void
 *   onSuccess — (newItem) => void
 */
const CreateSupervisorActionItemModal = ({ open, onClose, onSuccess }) => {
  // ── Org units ──────────────────────────────────────────────
  const [orgUnits, setOrgUnits] = useState([]);
  const [orgUnitsLoading, setOrgUnitsLoading] = useState(false);

  // ── Case search ────────────────────────────────────────────
  const [caseQuery, setCaseQuery] = useState('');
  const [caseResults, setCaseResults] = useState([]);
  const [caseSearchLoading, setCaseSearchLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null); // { caseId, label }
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const debounceRef = useRef(null);
  const caseBoxRef = useRef(null);

  // ── Form fields ────────────────────────────────────────────
  const [targetOrgUnitId, setTargetOrgUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  // ── Submission ─────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Load org units once when modal opens
  useEffect(() => {
    if (!open) return;
    setOrgUnitsLoading(true);
    fetchAllTargetUnits()
      .then(setOrgUnits)
      .catch(() => setOrgUnits([]))
      .finally(() => setOrgUnitsLoading(false));
  }, [open]);

  // Debounced case search
  useEffect(() => {
    if (selectedCase) return; // already selected, don't re-search
    if (caseQuery.trim().length < 2) {
      setCaseResults([]);
      setShowCaseDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCaseSearchLoading(true);
      try {
        const resp = await apiClient.get('/api/incidents', {
          params: { search: caseQuery.trim(), page_size: 8 },
        });
        const incidents = resp.data.incidents || [];
        setCaseResults(incidents);
        setShowCaseDropdown(incidents.length > 0);
      } catch {
        setCaseResults([]);
        setShowCaseDropdown(false);
      } finally {
        setCaseSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [caseQuery, selectedCase]);

  // Close case dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (caseBoxRef.current && !caseBoxRef.current.contains(e.target)) {
        setShowCaseDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectIncident = async (incident) => {
    setShowCaseDropdown(false);
    setCaseSearchLoading(true);
    try {
      // Fetch the full incident to get its linked case ID(s)
      const resp = await apiClient.get(`/api/incidents/${incident.incident_id}`);
      const cases = resp.data.incident?.cases || [];
      const firstCase = cases[0];
      if (!firstCase) {
        setSubmitError('لا توجد حالة مرتبطة بهذه الشكوى. تحقق من البيانات.');
        return;
      }
      setSelectedCase({
        caseId: firstCase.case_id,
        label: `${incident.patient_name || '—'} · ${incident.incident_number || '—'} · حالة #${firstCase.case_id}`,
      });
      setCaseQuery('');
    } catch {
      setSubmitError('فشل في جلب بيانات الحالة. حاول مرة أخرى.');
    } finally {
      setCaseSearchLoading(false);
    }
  };

  const handleClearCase = () => {
    setSelectedCase(null);
    setCaseQuery('');
    setCaseResults([]);
  };

  const handleClose = () => {
    if (submitting) return;
    setSelectedCase(null);
    setCaseQuery('');
    setCaseResults([]);
    setTargetOrgUnitId('');
    setDescription('');
    setDueDate('');
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!selectedCase?.caseId || !targetOrgUnitId || !description.trim()) {
      setSubmitError('الشكوى والوحدة التنظيمية والوصف جميعها مطلوبة.');
      return;
    }
    setSubmitting(true);
    try {
      const item = await createSupervisorActionItem({
        incidentRequestCaseId: selectedCase.caseId,
        targetOrgUnitId: parseInt(targetOrgUnitId, 10),
        description: description.trim(),
        dueDate: dueDate || null,
      });
      handleClose();
      onSuccess?.(item);
    } catch (err) {
      setSubmitError(err.message || 'فشل إنشاء بند الإجراء. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const contextContent = (
    <Box sx={{ pb: 1.5 }}>
      <Typography level="title-md" sx={{ fontWeight: 700 }}>
        إنشاء بند إجراء إداري
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.5 }}>
        تكليف إجراء لأي وحدة تنظيمية بصرف النظر عن سلسلة التصعيد الحالية للحالة.
      </Typography>
    </Box>
  );

  const mainContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

      {/* ── Row 1: Case search + Org unit ── */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>

        {/* Case search */}
        <FormControl required sx={{ flex: 1 }}>
          <FormLabel>الشكوى / الحالة</FormLabel>
          <Box ref={caseBoxRef} sx={{ position: 'relative' }}>
            {selectedCase ? (
              /* Show selected case as a clearable chip */
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  border: '1px solid', borderColor: 'neutral.outlinedBorder',
                  borderRadius: 'sm', px: 1.5, py: 0.75, minHeight: 36,
                  background: 'var(--joy-palette-success-softBg)',
                }}
              >
                <Chip size="sm" color="success" variant="soft" sx={{ flex: 1, justifyContent: 'flex-start' }}>
                  {selectedCase.label}
                </Chip>
                <IconButton
                  size="sm" variant="plain" color="neutral"
                  onClick={handleClearCase} disabled={submitting}
                  sx={{ minWidth: 24, minHeight: 24 }}
                >
                  <CloseRounded sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ) : (
              <Input
                placeholder="ابحث باسم المريض أو رقم الحادثة..."
                value={caseQuery}
                onChange={(e) => setCaseQuery(e.target.value)}
                onFocus={() => caseResults.length > 0 && setShowCaseDropdown(true)}
                disabled={submitting}
                endDecorator={caseSearchLoading ? <CircularProgress size="sm" /> : null}
              />
            )}

            {/* Results dropdown */}
            {showCaseDropdown && (
              <Card
                variant="outlined"
                sx={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  zIndex: 10002, mt: 0.5, p: 0, maxHeight: 200, overflow: 'auto',
                }}
              >
                {caseResults.map((incident) => (
                  <Box
                    key={incident.incident_id}
                    onMouseDown={() => handleSelectIncident(incident)}
                    sx={{
                      px: 2, py: 1, cursor: 'pointer',
                      '&:hover': { bgcolor: 'primary.softBg' },
                      borderBottom: '1px solid', borderColor: 'neutral.outlinedBorder',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Typography level="body-sm" fontWeight={600}>
                      {incident.patient_name || 'مريض غير معروف'}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                      {incident.incident_number}
                      {incident.case_count > 0 && ` · ${incident.case_count} حالة`}
                    </Typography>
                  </Box>
                ))}
              </Card>
            )}
          </Box>
        </FormControl>

        {/* Org unit — Fix 1: slotProps z-index so the listbox appears above the modal */}
        <FormControl required sx={{ flex: 1 }}>
          <FormLabel>الوحدة التنظيمية المستهدفة</FormLabel>
          {orgUnitsLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
              <CircularProgress size="sm" />
              <Typography level="body-sm">جاري التحميل...</Typography>
            </Box>
          ) : (
            <Select
              placeholder="اختر الوحدة..."
              value={targetOrgUnitId || null}
              onChange={(_, val) => setTargetOrgUnitId(val ?? '')}
              disabled={submitting}
              slotProps={{ listbox: { sx: { zIndex: 10001 } } }}
            >
              {orgUnits.map((unit) => (
                <Option key={unit.id} value={String(unit.id)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="body-sm">{unit.name}</Typography>
                    {unit.type_label && (
                      <Chip size="sm" variant="soft" color="neutral" sx={{ fontSize: '0.65rem' }}>
                        {unit.type_label}
                      </Chip>
                    )}
                  </Box>
                </Option>
              ))}
            </Select>
          )}
        </FormControl>
      </Box>

      {/* ── Description ── */}
      <FormControl required>
        <FormLabel>الوصف / الإجراء المطلوب</FormLabel>
        <Textarea
          minRows={3}
          maxRows={6}
          placeholder="اكتب وصف الإجراء المطلوب..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
        />
      </FormControl>

      {/* ── Due date (full width, cleaner layout) ── */}
      <FormControl sx={{ maxWidth: 240 }}>
        <FormLabel>تاريخ الاستحقاق (اختياري)</FormLabel>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={submitting}
        />
      </FormControl>

    </Box>
  );

  const footerContent = (
    <SimpleModalFooter
      onClose={handleClose}
      closeLabel="إلغاء"
      closeDisabled={submitting}
      primaryLabel="إنشاء بند الإجراء"
      onPrimary={handleSubmit}
      primaryDisabled={submitting || !selectedCase?.caseId || !targetOrgUnitId || !description.trim()}
      primaryLoading={submitting}
      primaryColor="success"
      error={submitError}
    />
  );

  return (
    <WorkflowFormShell open={open} onClose={handleClose} submitting={submitting} size="md">
      <ModalLayoutShell
        context={contextContent}
        mainContent={mainContent}
        supportContent={null}
        footer={footerContent}
      />
    </WorkflowFormShell>
  );
};

export default CreateSupervisorActionItemModal;
