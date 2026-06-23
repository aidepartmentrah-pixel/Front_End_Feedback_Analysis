/**
 * CaseReviewModal — Unified Review + Action Modal
 *
 * Entry point for all standard workflow actions on incident subcases:
 *   SUBMIT_RESPONSE  — section: explanation + action items + RCA
 *   ACCEPT_COMPLAINT — section: instant قبول الشكوى, no form
 *   APPROVE          — dept/admin: instant قبول, no form
 *   OVERRIDE         — dept/admin: own explanation + replace action items
 *   REJECT           — any: rejection text
 *   REOPEN           — supervisor: note text
 *
 * Stage 1 refactor: shell, complaint details, existing response, action buttons,
 * action items editor, and RCA picker have been extracted to separate components.
 * Behavior is identical to the pre-refactor version.
 *
 * TODO (Stage 7): Centralize STATUS_LABELS across CaseReviewModal and
 * WorkflowInboxPage. Confirmed backend key is RETURNED_TO_DEPT_FOR_REVISION
 * (short form). WorkflowInboxPage.getStatusDisplay incorrectly uses
 * RETURNED_TO_DEPARTMENT_FOR_REVISION (long form) — that entry never matches,
 * causing the status to fall back to the default neutral label in the inbox row.
 * Fix in a later stage that touches the status display system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Box, Button, Textarea,
  FormControl, FormLabel, Alert, CircularProgress, Divider, Chip,
} from '@mui/joy';
import { actOnSubcase, getWorkflowIncidentDetail, getSubcaseResponse, getSubcaseHistory, savePatientServicesDecision, getSubcaseFillState, giveSectionMoreTime, giveDepartmentMoreTime, giveAdministrationMoreTime } from '../../api/workflowApi';
import { getRcaPairsForSubcase, saveRcaSelections } from '../../api/rcaApi';
import WorkflowFormShell from './WorkflowFormShell';
import ComplaintDetailsSection from './ComplaintDetailsSection';
import InvestigationHistorySection from './InvestigationHistorySection';
import WorkflowActionButtons from './WorkflowActionButtons';
import ActionItemsEditor from './ActionItemsEditor';
import RcaPairsPicker from './RcaPairsPicker';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  SUBMITTED_TO_SECTION:             { label: 'بانتظار رد القسم',        color: 'primary' },
  RETURNED_TO_SECTION_FOR_REVISION: { label: 'مُعاد للقسم للمراجعة',    color: 'warning' },
  SECTION_ACCEPTED_PENDING_DEPT:    { label: 'بانتظار موافقة الدائرة',  color: 'success' },
  RETURNED_TO_DEPT_FOR_REVISION:    { label: 'مُعاد للدائرة للمراجعة',  color: 'warning' },
  DEPT_ACCEPTED_PENDING_ADMIN:      { label: 'بانتظار موافقة الإدارة',  color: 'success' },
  ADMIN_APPROVED:                   { label: 'مُعتمدة',                  color: 'success' },
  SECTION_DENIED:                   { label: 'مرفوضة من القسم',          color: 'danger'  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const entry = STATUS_LABELS[status] || { label: status, color: 'neutral' };
  return <Chip size="sm" color={entry.color} variant="soft">{entry.label}</Chip>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const CaseReviewModal = ({ open, onClose, item, onSuccess }) => {
  const allowedActions = item?.allowedActions || [];
  const subcaseId      = item?.subcaseId;
  const incidentId     = item?.incidentId;

  // True when the user is section-level (must write the first response)
  const isSection = allowedActions.includes('submit_response') || allowedActions.includes('accept_complaint');

  // Org unit type constants: 323=Administration, 324=Section, 325=Department
  // RCA ownership follows the target: Section-target → Section edits,
  // Department-target → Dept edits, Administration-target → Admin edits.
  const isRcaOwner =
    (item?.targetOrgUnitType === 324 && allowedActions.includes('submit_response')) ||
    (item?.targetOrgUnitType === 325 && allowedActions.includes('override')) ||
    (item?.targetOrgUnitType === 323 && allowedActions.includes('override'));

  // Patient Services review: PS writes an independent opinion instead of a complaint response.
  // When true, the standard action panel and RCA section are hidden; the Opinion Region is shown.
  const isPatientServicesReview =
    allowedActions.includes('save_patient_services_decision') ||
    allowedActions.includes('edit_patient_services_decision');

  // Force-closed context: the case is force-closed at some level.
  const giveMoreTimeAction =
    allowedActions.includes('give_section_more_time')        ? 'give_section_more_time' :
    allowedActions.includes('give_department_more_time')     ? 'give_department_more_time' :
    allowedActions.includes('give_administration_more_time') ? 'give_administration_more_time' :
    null;

  // ── DATA STATE ──────────────────────────────────────────
  const [incidentData, setIncidentData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [history,      setHistory]      = useState(null);
  const [dataLoading,  setDataLoading]  = useState(false);
  const [dataError,    setDataError]    = useState(null);   // eslint-disable-line no-unused-vars

  // ── UI STATE ─────────────────────────────────────────────
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [activeAction,  setActiveAction]  = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState(null);

  // ── FORM FIELDS ──────────────────────────────────────────
  const [explanationText, setExplanationText] = useState('');
  const [rejectionText,   setRejectionText]   = useState('');
  const [actionItems,     setActionItems]      = useState([{ action_item_id: null, title: '', description: '', due_date: '' }]);
  const [rcaCategories,   setRcaCategories]   = useState([]);
  const [selectedIds,     setSelectedIds]      = useState(new Set());
  const [rcaLoading,      setRcaLoading]       = useState(false);

  // ── PATIENT SERVICES OPINION STATE ───────────────────────
  const [opinionText,    setOpinionText]    = useState('');
  const [opinionSaving,  setOpinionSaving]  = useState(false);
  const [opinionError,   setOpinionError]   = useState(null);

  // ── LOAD DATA ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!subcaseId) return;
    setDataLoading(true);
    setDataError(null);

    const [incident, response, hist, fillState] = await Promise.all([
      incidentId
        ? getWorkflowIncidentDetail(incidentId).catch(() => null)
        : Promise.resolve(null),
      getSubcaseResponse(subcaseId).catch(() => null),
      getSubcaseHistory(subcaseId).catch(() => null),
      isPatientServicesReview
        ? getSubcaseFillState(subcaseId).catch(() => null)
        : Promise.resolve(null),
    ]);

    setIncidentData(incident);
    setResponseData(response);
    setHistory(hist);
    if (fillState) {
      setOpinionText(fillState.patientServicesDecision?.decisionText || '');
    }
    setDataLoading(false);
  }, [subcaseId, incidentId, isPatientServicesReview]); // eslint-disable-line

  useEffect(() => {
    if (!open) return;
    // Reset all state when a new item opens
    setComplaintOpen(isSection || isPatientServicesReview || giveMoreTimeAction !== null);
    setActiveAction(null);
    setExplanationText('');
    setRejectionText('');
    setActionItems([{ action_item_id: null, title: '', description: '', due_date: '' }]);
    setRcaCategories([]);
    setSelectedIds(new Set());
    setSubmitError(null);
    setIncidentData(null);
    setResponseData(null);
    setHistory(null);
    setOpinionText('');
    setOpinionError(null);
    loadData();
  }, [open, subcaseId]); // eslint-disable-line

  // ── ACTION ITEM HELPERS ──────────────────────────────────
  const addActionItem    = () => setActionItems(prev => [...prev, { action_item_id: null, title: '', description: '', due_date: '' }]);
  const removeActionItem = (i) => setActionItems(prev => prev.filter((_, idx) => idx !== i));
  const updateActionItem = (i, field, val) =>
    setActionItems(prev => prev.map((ai, idx) => idx === i ? { ...ai, [field]: val } : ai));

  // Load RCA cause/action pairs on open — needed for both editable (owner) and read-only views
  useEffect(() => {
    if (!open || !subcaseId) return;
    setRcaLoading(true);
    getRcaPairsForSubcase(subcaseId)
      .then(data => {
        const cats = data.categories || [];
        setRcaCategories(cats);
        const pre = cats.flatMap(c => c.pairs.filter(p => p.is_selected).map(p => p.pair_id));
        setSelectedIds(new Set(pre));
      })
      .catch(() => {})
      .finally(() => setRcaLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subcaseId]);

  // ── SELECT ACTION ────────────────────────────────────────
  const selectAction = (code) => {
    const isToggleOff = activeAction === code;
    setActiveAction(isToggleOff ? null : code);
    setSubmitError(null);

    // Pre-populate action items from the loaded response when opening edit forms
    if (!isToggleOff && (code === 'SUBMIT_RESPONSE' || code === 'OVERRIDE')) {
      const existing = responseData?.actionItems || [];
      if (existing.length > 0) {
        setActionItems(existing.map(ai => ({
          action_item_id: ai.actionItemId || null,
          title: ai.title || '',
          description: ai.description || '',
          due_date: ai.dueDate || '',
        })));
      } else {
        setActionItems([{ action_item_id: null, title: '', description: '', due_date: '' }]);
      }
    }
  };

  // ── PATIENT SERVICES OPINION SAVE ───────────────────────
  const handleOpinionSave = async () => {
    setOpinionError(null);
    if (!opinionText.trim()) {
      setOpinionError('يرجى إدخال نص الرأي');
      return;
    }
    setOpinionSaving(true);
    try {
      await savePatientServicesDecision(subcaseId, opinionText.trim());
      onClose();
      onSuccess?.();
    } catch (err) {
      setOpinionError(err.message || 'فشل حفظ الرأي، يرجى المحاولة مرة أخرى');
    } finally {
      setOpinionSaving(false);
    }
  };

  // ── TOGGLE RCA PAIR ──────────────────────────────────────
  const toggleRcaId = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── SUBMIT ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError(null);
    if ((activeAction === 'SUBMIT_RESPONSE' || activeAction === 'OVERRIDE') && !explanationText.trim()) {
      setSubmitError('يرجى إدخال نص التوضيح');
      return;
    }
    if ((activeAction === 'REJECT' || activeAction === 'REOPEN') && !rejectionText.trim()) {
      setSubmitError(activeAction === 'REOPEN' ? 'يرجى إدخال ملاحظة للقسم' : 'يرجى إدخال سبب الرفض');
      return;
    }

    let payload = {};
    if (activeAction === 'SUBMIT_RESPONSE' || activeAction === 'OVERRIDE') {
      payload = {
        explanation_text: explanationText,
        action_items: actionItems
          .filter(i => i.title.trim())
          .map(i => ({
            action_item_id: i.action_item_id || null,
            title: i.title,
            description: i.description,
            due_date: i.due_date || null,
          })),
      };
    } else if (activeAction === 'REJECT' || activeAction === 'REOPEN') {
      payload = { rejection_text: rejectionText };
    }

    setSubmitting(true);
    try {
      if (activeAction === 'GIVE_SECTION_MORE_TIME') {
        await giveSectionMoreTime(subcaseId);
        onClose(); onSuccess?.(); return;
      }
      if (activeAction === 'GIVE_DEPARTMENT_MORE_TIME') {
        await giveDepartmentMoreTime(subcaseId);
        onClose(); onSuccess?.(); return;
      }
      if (activeAction === 'GIVE_ADMINISTRATION_MORE_TIME') {
        await giveAdministrationMoreTime(subcaseId);
        onClose(); onSuccess?.(); return;
      }
      await actOnSubcase(subcaseId, activeAction, payload);
      if (activeAction === 'SUBMIT_RESPONSE' || (activeAction === 'OVERRIDE' && isRcaOwner)) {
        try {
          const expanded = new Set();
          rcaCategories.forEach(c => c.pairs.forEach(p => {
            if (selectedIds.has(p.pair_id)) {
              expanded.add(p.pair_id);
              expanded.add(p.action_suggestion_id);
            }
          }));
          await saveRcaSelections(subcaseId, [...expanded]);
        } catch (_) {
          // RCA save failure is non-blocking
        }
      }
      onClose();
      onSuccess();
    } catch (err) {
      setSubmitError(err.message || 'فشل في تنفيذ الإجراء، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  // ── RENDER: INLINE ACTION FORM ───────────────────────────
  // Kept in CaseReviewModal because it directly reads/writes 5+ local state
  // fields (explanationText, rejectionText, activeAction, submitError, submitting).
  // ActionItemsEditor and RcaPairsPicker are used here as extracted sub-components.
  const renderActionForm = () => {
    if (!activeAction) return null;

    const isGiveMoreTime =
      activeAction === 'GIVE_SECTION_MORE_TIME' ||
      activeAction === 'GIVE_DEPARTMENT_MORE_TIME' ||
      activeAction === 'GIVE_ADMINISTRATION_MORE_TIME';

    const confirmColor =
      activeAction === 'REJECT'  ? 'danger'  :
      (activeAction === 'REOPEN' || isGiveMoreTime) ? 'warning' :
      'success';

    return (
      <Box sx={{
        mt: 2, p: 2, borderRadius: 'sm',
        border: '1px solid', borderColor: 'neutral.300',
        backgroundColor: 'background.surface',
      }}>

        {/* APPROVE / ACCEPT_COMPLAINT — confirmation only */}
        {(activeAction === 'APPROVE' || activeAction === 'ACCEPT_COMPLAINT') && (
          <Alert color="success" variant="soft">
            <Box>
              <Typography level="body-md" sx={{ fontWeight: 600, mb: 0.5 }}>
                {activeAction === 'APPROVE' ? 'تأكيد القبول' : 'تأكيد قبول الشكوى'}
              </Typography>
              {activeAction === 'ACCEPT_COMPLAINT' && (
                <Typography level="body-sm">
                  سيتم كتابة <strong>"قبول الشكوى"</strong> تلقائياً في حقل التوضيح. لا يلزم إدخال بنود إجراءات أو RCA.
                </Typography>
              )}
            </Box>
          </Alert>
        )}

        {/* SUBMIT_RESPONSE — full form with action items + RCA */}
        {activeAction === 'SUBMIT_RESPONSE' && (
          <>
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>التوضيح / الشرح</FormLabel>
              <Textarea
                minRows={4}
                placeholder="أدخل التوضيح..."
                value={explanationText}
                onChange={e => setExplanationText(e.target.value)}
                disabled={submitting}
              />
            </FormControl>
            <Divider sx={{ my: 1 }} />
            <ActionItemsEditor
              actionItems={actionItems}
              onAdd={addActionItem}
              onRemove={removeActionItem}
              onUpdate={updateActionItem}
              disabled={submitting}
            />
            <Divider sx={{ my: 2 }} />
            <RcaPairsPicker
              categories={rcaCategories}
              selectedIds={selectedIds}
              onToggle={toggleRcaId}
              loading={rcaLoading}
              disabled={submitting}
            />
          </>
        )}

        {/* OVERRIDE — explanation + action items + RCA (when owner) */}
        {activeAction === 'OVERRIDE' && (
          <>
            <FormControl required sx={{ mb: 1 }}>
              <FormLabel>توضيح الدائرة / الإدارة</FormLabel>
              <Textarea
                minRows={3}
                placeholder="أدخل التوضيح..."
                value={explanationText}
                onChange={e => setExplanationText(e.target.value)}
                disabled={submitting}
              />
            </FormControl>
            <ActionItemsEditor
              actionItems={actionItems}
              onAdd={addActionItem}
              onRemove={removeActionItem}
              onUpdate={updateActionItem}
              disabled={submitting}
            />
            {isRcaOwner && (
              <>
                <Divider sx={{ my: 2 }} />
                <RcaPairsPicker
                  categories={rcaCategories}
                  selectedIds={selectedIds}
                  onToggle={toggleRcaId}
                  loading={rcaLoading}
                  disabled={submitting}
                />
              </>
            )}
          </>
        )}

        {/* REJECT */}
        {activeAction === 'REJECT' && (
          <FormControl required>
            <FormLabel>سبب الرفض</FormLabel>
            <Textarea
              minRows={3}
              placeholder="أدخل سبب الرفض..."
              value={rejectionText}
              onChange={e => setRejectionText(e.target.value)}
              disabled={submitting}
            />
          </FormControl>
        )}

        {/* REOPEN */}
        {activeAction === 'REOPEN' && (
          <>
            <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
              <Typography level="body-sm">ستعود الحالة إلى صندوق وارد القسم للمراجعة.</Typography>
            </Alert>
            <FormControl required>
              <FormLabel>ملاحظة للقسم</FormLabel>
              <Textarea
                minRows={3}
                placeholder="وضح سبب إعادة الإرسال..."
                value={rejectionText}
                onChange={e => setRejectionText(e.target.value)}
                disabled={submitting}
              />
            </FormControl>
          </>
        )}

        {/* GIVE MORE TIME — confirmation only, no text input */}
        {isGiveMoreTime && (
          <Alert color="warning" variant="soft">
            <Box>
              <Typography level="body-md" sx={{ fontWeight: 600, mb: 0.5 }}>
                تأكيد منح المهلة الإضافية
              </Typography>
              <Typography level="body-sm">
                ستتم إعادة تفعيل الحالة في صندوق وارد المستوى المسؤول لاستكمال الرد.
              </Typography>
            </Box>
          </Alert>
        )}

        {submitError && (
          <Alert color="danger" variant="soft" sx={{ mt: 2 }}>
            <Typography level="body-sm">{submitError}</Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => { setActiveAction(null); setSubmitError(null); }}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            color={confirmColor}
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            تأكيد
          </Button>
        </Box>
      </Box>
    );
  };

  // ── MAIN RENDER ──────────────────────────────────────────
  const caseLabel     = item?.incidentId ? `Case #${item.incidentId}` : `#${subcaseId}`;
  const needsBigModal = isPatientServicesReview || activeAction === 'SUBMIT_RESPONSE' || activeAction === 'OVERRIDE';

  return (
    <WorkflowFormShell open={open} onClose={onClose} submitting={submitting} wide={needsBigModal}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <Box sx={{ mb: 1 }}>
        <Typography level="h4" sx={{ mb: 0.5 }}>
          {isPatientServicesReview
            ? `مراجعة — خدمات المرضى — ${caseLabel}`
            : `مراجعة الحالة — ${caseLabel}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {item?.targetOrgUnitName && (
            <Chip size="sm" color="neutral" variant="outlined">{item.targetOrgUnitName}</Chip>
          )}
          {item?.status && <StatusChip status={item.status} />}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ── LOADING ────────────────────────────────────── */}
      {dataLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size="md" />
        </Box>
      ) : (
        <>
          {/* ── COMPLAINT DETAILS ────────────────────────── */}
          <ComplaintDetailsSection
            incidentData={incidentData}
            item={item}
            open={complaintOpen}
            onChange={() => setComplaintOpen(p => !p)}
          />

          {/* ── INVESTIGATION HISTORY ────────────────────── */}
          <InvestigationHistorySection history={history} responseData={responseData} />

          {/* ── RCA — read-only for non-owners when pairs exist (not shown for PS) ── */}
          {!isRcaOwner && !isPatientServicesReview && rcaCategories.length > 0 && selectedIds.size > 0 && (
            <Box sx={{ mb: 2 }}>
              <RcaPairsPicker
                categories={rcaCategories}
                selectedIds={selectedIds}
                onToggle={() => {}}
                loading={rcaLoading}
                disabled={true}
              />
            </Box>
          )}

          {/* ── PATIENT SERVICES OPINION REGION ──────────── */}
          {isPatientServicesReview && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography level="title-md" sx={{ mb: 0.5 }}>رأي خدمات المرضى</Typography>
              <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 2 }}>
                Patient Services Opinion
              </Typography>
              <FormControl sx={{ mb: 2 }}>
                <Textarea
                  minRows={7}
                  placeholder="أدخل رأي خدمات المرضى هنا..."
                  value={opinionText}
                  onChange={e => setOpinionText(e.target.value)}
                  disabled={opinionSaving}
                  sx={{ minHeight: 180 }}
                />
              </FormControl>
              {opinionError && (
                <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
                  <Typography level="body-sm">{opinionError}</Typography>
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="plain" color="neutral" onClick={onClose} disabled={opinionSaving}>
                  إغلاق
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  onClick={handleOpinionSave}
                  disabled={opinionSaving || !opinionText.trim()}
                  startDecorator={opinionSaving ? <CircularProgress size="sm" /> : null}
                >
                  {opinionSaving ? 'جاري الحفظ...' : 'حفظ الرأي'}
                </Button>
              </Box>
            </Box>
          )}

          {/* ── ACTION PANEL (hidden for PS review only) ── */}
          {!isPatientServicesReview && (
            <>
              <Divider sx={{ mb: 2 }} />
              {/* Force-closed info banner — shown whenever give-more-time is available */}
              {giveMoreTimeAction && (
                <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
                  <Box>
                    <Typography level="title-sm" sx={{ mb: 0.5 }}>هذه الحالة أُغلقت قسريًا</Typography>
                    <Typography level="body-sm" sx={{ color: 'neutral.700' }}>
                      السبب: تجاوز المهلة المحددة دون تقديم رد.
                      يمكنك منح مهلة إضافية لإعادة تفعيل الحالة في الصف المسؤول، أو اتخاذ أي إجراء آخر متاح أدناه.
                    </Typography>
                  </Box>
                </Alert>
              )}
              <Typography level="title-sm" sx={{ mb: 1 }}>الإجراء المطلوب:</Typography>
              {/* Normal workflow action buttons (driven entirely by backend allowedActions) */}
              <WorkflowActionButtons
                allowedActions={allowedActions}
                activeAction={activeAction}
                onSelect={selectAction}
                disabled={submitting}
              />
              {submitError && (
                <Alert color="danger" variant="soft" sx={{ mt: 2 }}>
                  <Typography level="body-sm">{submitError}</Typography>
                </Alert>
              )}
              {renderActionForm()}
            </>
          )}
        </>
      )}
    </WorkflowFormShell>
  );
};

export default CaseReviewModal;
