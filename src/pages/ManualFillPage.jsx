/**
 * FC-S5 — Manual Fill Page
 * Fill section/department/administration explanations on behalf of their roles.
 * Sequential unlock: Section → Department → Administration.
 * Accessible only to COMPLAINT_SUPERVISOR and WORKER.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Textarea,
  Input,
  CircularProgress,
  Chip,
  Divider,
  Alert,
} from '@mui/joy';
import MainLayout from '../components/common/MainLayout';
import {
  getSubcaseFillState,
  fillLevelOnBehalf,
  completeForceClosedDraft,
  savePatientServicesDecision,
} from '../api/workflowApi';

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────

const LEVELS = [
  {
    key: 'section',
    label: 'Section',
    onBehalfOf: 'SECTION_ADMIN',
    color: '#00b894',
    gradient: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    lockMsg: null, // never locked — first level
  },
  {
    key: 'department',
    label: 'Department',
    onBehalfOf: 'DEPARTMENT_ADMIN',
    color: '#6c5ce7',
    gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    lockMsg: 'Fill the Section level first before filling Department.',
  },
  {
    key: 'administration',
    label: 'Administration',
    onBehalfOf: 'ADMINISTRATION_ADMIN',
    color: '#e17055',
    gradient: 'linear-gradient(135deg, #e17055 0%, #fab1a0 100%)',
    lockMsg: 'Fill the Department level first before filling Administration.',
  },
];

const FORCE_CLOSED_STATUSES = ['FORCE_CLOSED', 'FORCE_CLOSED_DRAFT', 'FORCE_CLOSED_COMPLETE'];

const ENTRY_MODE_LABELS = {
  FORCE_CLOSE_INTERVENTION: 'Force-close intervention',
  ON_BEHALF: 'On behalf',
  NORMAL: 'Normal entry',
};

function formatTimestamp(dateObj) {
  if (!dateObj) return null;
  try {
    return dateObj.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return String(dateObj);
  }
}

function StatusBadge({ status }) {
  const map = {
    FORCE_CLOSED_DRAFT:                   { label: 'Force Closed — Draft',                      color: 'warning' },
    FORCE_CLOSED_COMPLETE:                { label: 'Force Closed — Complete',                    color: 'success' },
    FORCE_CLOSED:                         { label: 'Force Closed',                               color: 'neutral' },
    WAITING_PATIENT_SERVICES_DECISION:    { label: 'بانتظار قرار خدمات المرضى',                  color: 'warning' },
    PATIENT_SERVICES_DECISION_COMPLETED:  { label: 'تم إدخال قرار خدمات المرضى',                 color: 'success' },
  };
  const entry = map[status] || { label: status, color: 'neutral' };
  return <Chip size="sm" color={entry.color} variant="soft">{entry.label}</Chip>;
}

// ─────────────────────────────────────────────────────────
// AUTHORSHIP CHIP
// ─────────────────────────────────────────────────────────

function AuthorshipChip({ levelData }) {
  if (!levelData?.enteredBy) return null;
  const modeLabel = ENTRY_MODE_LABELS[levelData.entryMode] || levelData.entryMode || '';
  const ts = formatTimestamp(levelData.entryTimestamp);
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
      <Chip size="sm" color="primary" variant="soft">
        {levelData.enteredBy}
      </Chip>
      {levelData.enteredForRole && (
        <Chip size="sm" color="neutral" variant="outlined">
          on behalf of {levelData.enteredForRole}
        </Chip>
      )}
      {modeLabel && (
        <Chip size="sm" color="neutral" variant="soft">
          {modeLabel}
        </Chip>
      )}
      {ts && (
        <Chip size="sm" color="neutral" variant="soft">
          {ts}
        </Chip>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────
// LEVEL CARD
// ─────────────────────────────────────────────────────────

const emptyActionItem = () => ({ title: '', description: '', dueDate: '' });

function LevelCard({ levelConfig, levelData, isLocked, onSave, saving, isForceClose }) {
  const [text, setText] = useState(levelData?.explanationText || '');
  const [localError, setLocalError] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [actionItems, setActionItems] = useState([emptyActionItem()]);

  const showActionItems = levelConfig.key === 'section';

  // Sync explanation text when fill state reloads after a save
  useEffect(() => {
    setText(levelData?.explanationText || '');
  }, [levelData?.explanationText]);

  function updateItem(index, field, value) {
    setActionItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setActionItems(prev => [...prev, emptyActionItem()]);
  }

  function removeItem(index) {
    setActionItems(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!text.trim()) {
      setLocalError('Explanation text is required.');
      return;
    }
    setLocalError(null);

    const itemsToSend = showActionItems
      ? actionItems
          .filter(item => item.title.trim())
          .map(item => ({
            title: item.title.trim(),
            description: item.description.trim() || null,
            due_date: item.dueDate || null,
          }))
      : [];

    const ok = await onSave(levelConfig.key, text.trim(), itemsToSend);
    if (ok) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    }
  }

  const isFilled = Boolean(levelData?.explanationText);

  return (
    <Card
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderLeft: `4px solid ${levelConfig.color}`,
        opacity: isLocked ? 0.55 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Card header */}
      <Box sx={{ p: 2, background: levelConfig.gradient }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'white' }}>
              {levelConfig.label}
            </Typography>
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Filling on behalf of {levelConfig.onBehalfOf}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isFilled ? (
              <Chip size="sm" color="success" variant="solid">Filled</Chip>
            ) : (
              <Chip size="sm" color="warning" variant="solid">Not filled</Chip>
            )}
            {isLocked && (
              <Chip size="sm" color="neutral" variant="solid">Locked</Chip>
            )}
          </Box>
        </Box>
      </Box>

      {/* Card body */}
      <Box sx={{ p: 2 }}>
        {isLocked ? (
          <Typography level="body-sm" sx={{ color: 'neutral.500', fontStyle: 'italic' }}>
            🔒 {levelConfig.lockMsg}
          </Typography>
        ) : (
          <>
            {/* Authorship (shown when already filled) */}
            {isFilled && (
              <Box sx={{ mb: 1.5 }}>
                <Typography level="body-xs" sx={{ color: 'neutral.500', mb: 0.5 }}>
                  Last filled by:
                </Typography>
                <AuthorshipChip levelData={levelData} />
              </Box>
            )}

            {/* Explanation textarea */}
            <Textarea
              minRows={4}
              maxRows={10}
              placeholder={`Enter the ${levelConfig.label.toLowerCase()} explanation text here…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={saving}
              sx={{ mb: 1.5 }}
            />

            {/* Action items — section level only, active cases only */}
            {showActionItems && (
              <Box sx={{ mb: 1.5 }}>
                <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1 }}>
                  Action Items
                </Typography>
                {actionItems.map((item, idx) => (
                  <Card key={idx} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
                      <Input
                        size="sm"
                        placeholder="Action item title (required)"
                        value={item.title}
                        onChange={(e) => updateItem(idx, 'title', e.target.value)}
                        disabled={saving}
                        sx={{ flex: 1 }}
                      />
                      <Input
                        size="sm"
                        type="date"
                        placeholder="Due date"
                        value={item.dueDate}
                        onChange={(e) => updateItem(idx, 'dueDate', e.target.value)}
                        disabled={saving}
                        sx={{ width: 160 }}
                      />
                      {actionItems.length > 1 && (
                        <Button
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={() => removeItem(idx)}
                          disabled={saving}
                          sx={{ minWidth: 'unset', px: 0.5 }}
                        >
                          ✕
                        </Button>
                      )}
                    </Box>
                    <Input
                      size="sm"
                      placeholder="Description (optional)"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      disabled={saving}
                    />
                  </Card>
                ))}
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  onClick={addItem}
                  disabled={saving}
                >
                  + Add Action Item
                </Button>
              </Box>
            )}

            {localError && (
              <Typography level="body-xs" color="danger" sx={{ mb: 1 }}>
                {localError}
              </Typography>
            )}

            {savedFlash && (
              <Typography level="body-xs" color="success" sx={{ mb: 1 }}>
                ✓ Saved
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                size="sm"
                color="primary"
                loading={saving}
                onClick={handleSave}
                disabled={saving}
              >
                {isFilled ? 'Update' : 'Save'} {levelConfig.label}
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="success"
                loading={saving}
                disabled={saving}
                onClick={async () => {
                  setLocalError(null);
                  const ok = await onSave(levelConfig.key, 'قبول الشكوى', []);
                  if (ok) {
                    setSavedFlash(true);
                    setTimeout(() => setSavedFlash(false), 2500);
                  }
                }}
              >
                قبول الشكوى
              </Button>
              {isFilled && (
                <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                  Overwrite is allowed
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// PATIENT SERVICES DECISION CARD
// ─────────────────────────────────────────────────────────

const PS_COLOR    = '#0984e3';
const PS_GRADIENT = 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)';

function PatientServicesDecisionCard({ psData, isLocked, subcaseId, onRefresh }) {
  const [text, setText] = useState(psData?.decisionText || '');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setText(psData?.decisionText || '');
  }, [psData?.decisionText]);

  const isFilled = Boolean(psData?.decisionText);

  async function handleSave() {
    if (!text.trim()) {
      setLocalError('يرجى إدخال نص القرار.');
      return;
    }
    setLocalError(null);
    setSaving(true);
    try {
      await savePatientServicesDecision(Number(subcaseId), text.trim());
      await onRefresh();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      setLocalError(err.message || 'Failed to save decision.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderLeft: `4px solid ${PS_COLOR}`,
        opacity: isLocked ? 0.55 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Card header */}
      <Box sx={{ p: 2, background: PS_GRADIENT }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography level="title-lg" sx={{ fontWeight: 700, color: 'white' }}>
              بانتظار قرار خدمات المرضى بحسب المراجع العلميّة
            </Typography>
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Patient Services Scientific Decision
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isFilled ? (
              <Chip size="sm" color="success" variant="solid">Filled</Chip>
            ) : (
              <Chip size="sm" color="warning" variant="solid">Not filled</Chip>
            )}
            {isLocked && <Chip size="sm" color="neutral" variant="solid">Locked</Chip>}
          </Box>
        </Box>
      </Box>

      {/* Card body */}
      <Box sx={{ p: 2 }}>
        {isLocked ? (
          <Typography level="body-sm" sx={{ color: 'neutral.500', fontStyle: 'italic' }}>
            🔒 This case is already complete — Patient Services Decision is read-only.
          </Typography>
        ) : (
          <>
            {/* Authorship */}
            {isFilled && psData?.enteredBy && (
              <Box sx={{ mb: 1.5 }}>
                <Typography level="body-xs" sx={{ color: 'neutral.500', mb: 0.5 }}>
                  Last filled by:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip size="sm" color="primary" variant="soft">{psData.enteredBy}</Chip>
                  {psData.updatedAt && (
                    <Chip size="sm" color="neutral" variant="soft">
                      {formatTimestamp(psData.updatedAt)}
                    </Chip>
                  )}
                </Box>
              </Box>
            )}

            <Textarea
              minRows={4}
              maxRows={10}
              placeholder="اكتب قرار خدمات المرضى بحسب المراجع العلميّة هنا…"
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={saving}
              sx={{ mb: 1.5, direction: 'rtl' }}
            />

            {localError && (
              <Typography level="body-xs" color="danger" sx={{ mb: 1 }}>{localError}</Typography>
            )}
            {savedFlash && (
              <Typography level="body-xs" color="success" sx={{ mb: 1 }}>✓ Saved</Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                size="sm"
                color="primary"
                loading={saving}
                disabled={saving}
                onClick={handleSave}
              >
                {isFilled ? 'Update' : 'Save'} Decision
              </Button>
              {isFilled && (
                <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                  Overwrite is allowed
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
}


// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

const ManualFillPage = () => {
  const { subcaseId } = useParams();
  const navigate = useNavigate();

  const [fillState, setFillState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [savingLevel, setSavingLevel] = useState(null); // 'section'|'department'|'administration'|null
  const [saveError, setSaveError] = useState(null);

  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  const loadState = useCallback(async () => {
    try {
      setLoadError(null);
      const state = await getSubcaseFillState(Number(subcaseId));
      setFillState(state);
    } catch (err) {
      setLoadError(err.message || 'Failed to load fill state.');
    } finally {
      setLoading(false);
    }
  }, [subcaseId]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  async function handleSaveLevel(levelKey, text, actionItems = []) {
    setSavingLevel(levelKey);
    setSaveError(null);
    try {
      await fillLevelOnBehalf(Number(subcaseId), levelKey, text, actionItems);
      await loadState(); // Refresh to show updated authorship + unlock next level
      return true;
    } catch (err) {
      setSaveError(err.message || `Failed to save ${levelKey} data.`);
      return false;
    } finally {
      setSavingLevel(null);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    setCompleteError(null);
    try {
      await completeForceClosedDraft(Number(subcaseId));
      navigate('/insight');
    } catch (err) {
      setCompleteError(err.message || 'Failed to complete force-closed draft.');
      setCompleting(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout pageTitle="Manual Fill">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
          <CircularProgress size="lg" />
          <Typography level="body-lg">Loading case data…</Typography>
        </Box>
      </MainLayout>
    );
  }

  // ── Load error ──
  if (loadError) {
    return (
      <MainLayout pageTitle="Manual Fill">
        <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
          <Card variant="soft" color="danger" sx={{ p: 3, mb: 2 }}>
            <Typography level="title-sm" sx={{ mb: 1 }}>{loadError}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="sm" color="danger" onClick={loadState}>Retry</Button>
              <Button size="sm" variant="outlined" onClick={() => navigate('/insight')}>← Back</Button>
            </Box>
          </Card>
        </Box>
      </MainLayout>
    );
  }

  const sectionFilled  = Boolean(fillState.section.explanationText);
  const deptFilled     = Boolean(fillState.department.explanationText);
  const adminFilled    = Boolean(fillState.administration.explanationText);
  const psDecisionFilled = Boolean(fillState.patientServicesDecision?.decisionText);
  const allFilled      = sectionFilled && deptFilled && adminFilled;
  const isComplete     = fillState.status === 'FORCE_CLOSED_COMPLETE';
  const isForceClose   = FORCE_CLOSED_STATUSES.includes(fillState.status);
  const showPsCard     = adminFilled
    || fillState.status === 'WAITING_PATIENT_SERVICES_DECISION'
    || fillState.status === 'PATIENT_SERVICES_DECISION_COMPLETED';

  return (
    <MainLayout pageTitle="Manual Fill">
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>

        {/* ── Page header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography level="h3" sx={{ fontWeight: 700 }}>
              Manual Fill
            </Typography>
            <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
              Subcase #{subcaseId}{fillState.incidentId ? ` · Incident #${fillState.incidentId}` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <StatusBadge status={fillState.status} />
            <Button size="sm" variant="outlined" color="neutral" onClick={() => navigate('/insight')}>
              ← Back to Workflow Page
            </Button>
          </Box>
        </Box>

        {/* ── Force-close context card ── */}
        {fillState.forceCloseReason && (
          <Card variant="soft" color="warning" sx={{ p: 2, mb: 3 }}>
            <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
              Force-close context
            </Typography>
            <Typography level="body-sm" sx={{ mb: 0.5 }}>
              <strong>Reason:</strong> {fillState.forceCloseReason}
            </Typography>
            {fillState.forceClosedBy && (
              <Typography level="body-xs" sx={{ color: 'neutral.600' }}>
                Closed by {fillState.forceClosedBy}
                {fillState.forceClosedAt ? ` on ${formatTimestamp(fillState.forceClosedAt)}` : ''}
              </Typography>
            )}
          </Card>
        )}

        {/* ── Completion notice ── */}
        {isComplete && (
          <Alert color="success" sx={{ mb: 3 }}>
            This case is already <strong>Force Closed — Complete</strong>. All fields are read-only below.
          </Alert>
        )}

        {/* ── Save error banner ── */}
        {saveError && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        {/* ── Case context — complaint details + previous level explanations ── */}
        {(fillState.caseDescription || fillState.patientName || fillState.categoryName) && (
          <Card variant="soft" color="neutral" sx={{ p: 2, mb: 3 }}>
            <Typography level="title-sm" sx={{ fontWeight: 700, mb: 1.5 }}>Case Details</Typography>

            {/* Identity row */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 1 }}>
              {fillState.patientName && (
                <Typography level="body-sm"><strong>Patient:</strong> {fillState.patientName}</Typography>
              )}
              {fillState.incidentNumber && (
                <Typography level="body-sm"><strong>Incident:</strong> {fillState.incidentNumber}</Typography>
              )}
            </Box>

            {/* HCAT Classification chain */}
            {(fillState.categoryName || fillState.subCategoryName || fillState.classificationEN) && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                {fillState.categoryName && (
                  <Typography level="body-sm"><strong>Category:</strong> {fillState.categoryName}</Typography>
                )}
                {fillState.subCategoryName && (
                  <Typography level="body-sm"><strong>Sub-category:</strong> {fillState.subCategoryName}</Typography>
                )}
                {fillState.classificationEN && (
                  <Typography level="body-sm"><strong>Classification:</strong> {fillState.classificationEN}</Typography>
                )}
              </Box>
            )}

            {/* Complaint text */}
            {fillState.caseDescription && (
              <Typography level="body-sm" sx={{ mb: 1.5, color: 'neutral.800', fontStyle: 'italic', borderLeft: '3px solid', borderColor: 'neutral.300', pl: 1 }}>
                {fillState.caseDescription}
              </Typography>
            )}

            {/* Previous level explanations — reference for PS decision */}
            {(fillState.section?.explanationText || fillState.department?.explanationText || fillState.administration?.explanationText) && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography level="body-xs" sx={{ fontWeight: 700, color: 'neutral.600' }}>Previous Level Explanations</Typography>
                {fillState.section?.explanationText && (
                  <Box sx={{ p: 1, borderRadius: 'sm', bgcolor: 'background.surface', border: '1px solid', borderColor: 'neutral.200' }}>
                    <Typography level="body-xs" sx={{ fontWeight: 600, color: '#00b894', mb: 0.5 }}>Section</Typography>
                    <Typography level="body-xs" sx={{ color: 'neutral.700' }}>{fillState.section.explanationText}</Typography>
                  </Box>
                )}
                {fillState.department?.explanationText && (
                  <Box sx={{ p: 1, borderRadius: 'sm', bgcolor: 'background.surface', border: '1px solid', borderColor: 'neutral.200' }}>
                    <Typography level="body-xs" sx={{ fontWeight: 600, color: '#6c5ce7', mb: 0.5 }}>Department</Typography>
                    <Typography level="body-xs" sx={{ color: 'neutral.700' }}>{fillState.department.explanationText}</Typography>
                  </Box>
                )}
                {fillState.administration?.explanationText && (
                  <Box sx={{ p: 1, borderRadius: 'sm', bgcolor: 'background.surface', border: '1px solid', borderColor: 'neutral.200' }}>
                    <Typography level="body-xs" sx={{ fontWeight: 600, color: '#e17055', mb: 0.5 }}>Administration</Typography>
                    <Typography level="body-xs" sx={{ color: 'neutral.700' }}>{fillState.administration.explanationText}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Card>
        )}

        {/* ── Progress indicator ── */}
        <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography level="body-sm" sx={{ fontWeight: 600, mb: 1 }}>Fill progress</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {LEVELS.map((lvl) => {
              const filled = Boolean(fillState[lvl.key]?.explanationText);
              return (
                <Chip
                  key={lvl.key}
                  size="sm"
                  color={filled ? 'success' : 'neutral'}
                  variant={filled ? 'solid' : 'outlined'}
                >
                  {lvl.label}: {filled ? 'Done' : 'Empty'}
                </Chip>
              );
            })}
            {showPsCard && (
              <Chip
                size="sm"
                color={psDecisionFilled ? 'success' : 'neutral'}
                variant={psDecisionFilled ? 'solid' : 'outlined'}
              >
                Patient Services: {psDecisionFilled ? 'Done' : 'Empty'}
              </Chip>
            )}
          </Box>
        </Card>

        {/* ── Level cards ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {LEVELS.map((lvl, idx) => {
            const isLocked =
              isComplete ||
              (idx === 1 && !sectionFilled) ||
              (idx === 2 && !deptFilled);
            return (
              <LevelCard
                key={lvl.key}
                levelConfig={lvl}
                levelData={fillState[lvl.key]}
                isLocked={isLocked}
                saving={savingLevel === lvl.key}
                onSave={handleSaveLevel}
                isForceClose={isForceClose}
              />
            );
          })}

          {/* ── Patient Services Decision card ──
              Locked only when the whole case is already complete (read-only).
              Administration's on-behalf explanation is not a prerequisite —
              cases reaching this stage through the normal workflow pipeline
              never populate that field, so gating on it hid the decision area. */}
          {showPsCard && (
            <PatientServicesDecisionCard
              psData={fillState.patientServicesDecision}
              isLocked={isComplete}
              subcaseId={subcaseId}
              onRefresh={loadState}
            />
          )}
        </Box>

        {/* ── Complete button — force-close cases only ── */}
        {!isComplete && isForceClose && (
          <>
            <Divider sx={{ my: 3 }} />
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
                Complete Force-Closed Draft
              </Typography>
              <Typography level="body-sm" sx={{ color: 'neutral.600', mb: 1.5 }}>
                {allFilled
                  ? 'All three levels are filled. Click below to mark this case as Force Closed — Complete.'
                  : 'Fill all three levels above before completing. The case will remain in FORCE_CLOSED_DRAFT until then.'}
              </Typography>

              {completeError && (
                <Alert color="danger" sx={{ mb: 1.5 }}>
                  {completeError}
                </Alert>
              )}

              <Button
                color="success"
                loading={completing}
                disabled={!allFilled || completing}
                onClick={handleComplete}
              >
                Mark as Force Closed — Complete
              </Button>
            </Card>
          </>
        )}
      </Box>
    </MainLayout>
  );
};

export default ManualFillPage;
