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
 *
 * UI Smoothing S1: the modal body is now built from a region scaffold
 * (ModalLayoutShell/ContextRegion/MainContentRegion/SupportRegion/
 * ActionFooterRegion) for a larger, scrollable-body/sticky-footer layout.
 * All state, handlers, validation, and payloads below are unchanged from
 * the pre-S1 version — only where the JSX renders moved.
 *
 * TODO (Stage 7): Centralize STATUS_LABELS across CaseReviewModal and
 * WorkflowInboxPage. Confirmed backend key is RETURNED_TO_DEPT_FOR_REVISION
 * (short form). WorkflowInboxPage.getStatusDisplay incorrectly uses
 * RETURNED_TO_DEPARTMENT_FOR_REVISION (long form) — that entry never matches,
 * causing the status to fall back to the default neutral label in the inbox row.
 * Fix in a later stage that touches the status display system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/joy';
import { actOnSubcase, getWorkflowIncidentDetail, getSubcaseResponse, getSubcaseHistory, savePatientServicesDecision, getSubcaseFillState, giveSectionMoreTime, giveDepartmentMoreTime, giveAdministrationMoreTime } from '../../api/workflowApi';
import { getRcaPairsForSubcase, saveRcaSelections } from '../../api/rcaApi';
import WorkflowFormShell from './WorkflowFormShell';
import ModalLayoutShell from './ModalLayoutShell';
import ContextRegion from './ContextRegion';
import MainContentRegion from './MainContentRegion';
import SupportRegion from './SupportRegion';
import ActionFooterRegion from './ActionFooterRegion';
import StatusChip from './StatusChip';

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
  // RCA Text Assistant (Stage S3): tracks which exact sentence was auto-inserted
  // into explanationText for each currently-selected pair, so deselecting can
  // safely remove it ONLY if the user hasn't edited it since (Rules 1-4).
  const [rcaGeneratedSegments, setRcaGeneratedSegments] = useState(new Map());

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
    setRcaGeneratedSegments(new Map());
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

  // ── RCA ACTION ITEM SUGGESTIONS (Stage S4) ───────────────
  // Accepting a suggestion creates a normal, fully editable action item —
  // identical to one added via addActionItem(), just pre-filled. Fills the
  // default blank row if nothing else has been entered yet, else appends.
  const acceptSuggestedAction = (actionText) => {
    setActionItems(prev => {
      const isSingleBlank = prev.length === 1 && !prev[0].title.trim() && !prev[0].description.trim() && !prev[0].due_date;
      const newItem = { action_item_id: null, title: actionText, description: '', due_date: '' };
      return isSingleBlank ? [newItem] : [...prev, newItem];
    });
  };

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

  // ── RCA TEXT ASSISTANT (Stage S3) ────────────────────────
  // Composes a sentence for a given cause: prefers the curated DescriptionAr
  // narrative (settings-authored) when present, else falls back to a neutral
  // sentence built from the existing cause label + category — so the
  // assistant is useful immediately and upgrades silently as narratives are
  // added. Never invents unverified causal-impact claims.
  const composeRcaSentence = (pairId) => {
    for (const cat of rcaCategories) {
      const pair = (cat.pairs || []).find(p => p.pair_id === pairId);
      if (pair) {
        if (pair.description_ar && pair.description_ar.trim()) {
          return pair.description_ar.trim();
        }
        const categoryName = cat.category_name_ar || cat.category_name_en || '';
        return `ضمن فئة «${categoryName}»، تم تحديد السبب الجذري التالي: ${pair.cause_text_ar}.`;
      }
    }
    return null;
  };

  // ── TOGGLE RCA PAIR ──────────────────────────────────────
  const toggleRcaId = (id) => {
    const wasSelected = selectedIds.has(id);

    setSelectedIds(prev => {
      const next = new Set(prev);
      if (wasSelected) next.delete(id); else next.add(id);
      return next;
    });

    if (!wasSelected) {
      // Selecting: compose and append — never overwrites existing text (Rules 1-3).
      const sentence = composeRcaSentence(id);
      if (sentence) {
        setExplanationText(prev => (prev.trim() ? `${prev.trimEnd()}\n${sentence}` : sentence));
        setRcaGeneratedSegments(prev => new Map(prev).set(id, sentence));
      }
    } else {
      // Deselecting: remove the generated sentence only if it's still present
      // verbatim (untouched by the user) — otherwise leave their edits alone (Rule 4).
      const sentence = rcaGeneratedSegments.get(id);
      if (sentence) {
        setExplanationText(prev => {
          if (!prev.includes(sentence)) return prev;
          return prev.replace(`\n${sentence}`, '').replace(sentence, '');
        });
      }
      setRcaGeneratedSegments(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
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

  // ── MAIN RENDER ──────────────────────────────────────────
  const caseLabel = item?.incidentId ? `Case #${item.incidentId}` : `#${subcaseId}`;

  const isGiveMoreTimeActive =
    activeAction === 'GIVE_SECTION_MORE_TIME' ||
    activeAction === 'GIVE_DEPARTMENT_MORE_TIME' ||
    activeAction === 'GIVE_ADMINISTRATION_MORE_TIME';

  const confirmColor =
    activeAction === 'REJECT' ? 'danger' :
    (activeAction === 'REOPEN' || isGiveMoreTimeActive) ? 'warning' :
    'success';

  // Support-column gating: editable RCA/Action Items while filling SUBMIT_RESPONSE/OVERRIDE,
  // otherwise the read-only RCA recap for non-owners. Never both at once.
  const showActionItemsSupport = !isPatientServicesReview && (activeAction === 'SUBMIT_RESPONSE' || activeAction === 'OVERRIDE');
  const showRcaEditableSupport = !isPatientServicesReview && (activeAction === 'SUBMIT_RESPONSE' || (activeAction === 'OVERRIDE' && isRcaOwner));
  const showRcaReadOnlySupport = !showRcaEditableSupport && !isRcaOwner && !isPatientServicesReview && rcaCategories.length > 0 && selectedIds.size > 0;
  const showRcaSupport = showRcaEditableSupport || showRcaReadOnlySupport;
  const hasSupportContent = showActionItemsSupport || showRcaSupport;

  // Suggested Action Items (Stage S4): derived, not separately tracked —
  // a suggestion exists for a selected cause's paired action text as long as
  // no current action item already has that exact title. Accepting one makes
  // the titles match, which is what makes it disappear (no separate "accepted" flag needed).
  const acceptedActionTitles = new Set(actionItems.map(ai => ai.title.trim()).filter(Boolean));
  const suggestedActions = !showRcaEditableSupport ? [] : rcaCategories
    .flatMap(cat => cat.pairs || [])
    .filter(p => selectedIds.has(p.pair_id) && p.action_text_ar?.trim() && !acceptedActionTitles.has(p.action_text_ar.trim()))
    .map(p => ({ pairId: p.pair_id, actionText: p.action_text_ar.trim() }));

  return (
    <WorkflowFormShell open={open} onClose={onClose} submitting={submitting} size="lg">
      <ModalLayoutShell
        context={
          <ContextRegion
            title={isPatientServicesReview
              ? `مراجعة — خدمات المرضى — ${caseLabel}`
              : `مراجعة الحالة — ${caseLabel}`}
            orgUnitName={item?.targetOrgUnitName}
            statusChip={item?.status ? <StatusChip status={item.status} /> : null}
            item={item}
          />
        }
        mainContent={
          dataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size="md" />
            </Box>
          ) : (
            <MainContentRegion
              incidentData={incidentData}
              item={item}
              complaintOpen={complaintOpen}
              onToggleComplaint={() => setComplaintOpen(p => !p)}
              history={history}
              responseData={responseData}
              isPatientServicesReview={isPatientServicesReview}
              opinionText={opinionText}
              onOpinionChange={e => setOpinionText(e.target.value)}
              opinionSaving={opinionSaving}
              opinionError={opinionError}
              giveMoreTimeAction={giveMoreTimeAction}
              activeAction={activeAction}
              explanationText={explanationText}
              onExplanationChange={e => setExplanationText(e.target.value)}
              rejectionText={rejectionText}
              onRejectionChange={e => setRejectionText(e.target.value)}
              submitting={submitting}
            />
          )
        }
        supportContent={
          !dataLoading && hasSupportContent ? (
            <SupportRegion
              showActionItems={showActionItemsSupport}
              actionItems={actionItems}
              onAddItem={addActionItem}
              onRemoveItem={removeActionItem}
              onUpdateItem={updateActionItem}
              suggestedActions={suggestedActions}
              onAcceptSuggestedAction={acceptSuggestedAction}
              showRca={showRcaSupport}
              rcaCategories={rcaCategories}
              selectedIds={selectedIds}
              onToggleRca={showRcaEditableSupport ? toggleRcaId : () => {}}
              rcaLoading={rcaLoading}
              rcaDisabled={showRcaEditableSupport ? submitting : true}
              submitting={submitting}
            />
          ) : null
        }
        footer={
          dataLoading ? null : (
            <ActionFooterRegion
              isPatientServicesReview={isPatientServicesReview}
              onClose={onClose}
              opinionSaving={opinionSaving}
              onSaveOpinion={handleOpinionSave}
              opinionDisabled={opinionSaving || !opinionText.trim()}
              allowedActions={allowedActions}
              activeAction={activeAction}
              onSelectAction={selectAction}
              submitting={submitting}
              submitError={submitError}
              confirmColor={confirmColor}
              onCancelAction={() => { setActiveAction(null); setSubmitError(null); }}
              onConfirmAction={handleSubmit}
            />
          )
        }
      />
    </WorkflowFormShell>
  );
};

export default CaseReviewModal;
