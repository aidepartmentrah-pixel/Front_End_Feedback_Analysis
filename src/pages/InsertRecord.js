// src/pages/InsertRecord.js
// Incident + multi-case tabs UI
// Architecture:
//   Top card  — shared Incident fields (patient, intent, building, etc.)
//   Tab strip — one tab per Case; each tab targets exactly one section
//   Review modal — summary before final submit
//   Submit → POST /api/records/add-incident
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Button,
  IconButton,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  Input,
  Alert,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";

import { useSearchParams } from "react-router-dom";
import MainLayout from "../components/common/MainLayout";
import theme from "../theme";
import {
  fetchReferenceData,
  fetchCategories,
  searchPatients,
  submitIncident,
  createPatient,
  fetchNextNumbers,
} from "../api/insertRecord";
import { getRecordById, updateRecord } from "../api/complaints";
import { fetchAllTargetUnits } from "../api/orgUnits";

import { emptyIncident, emptyCase } from "../utils/incidentModel";
import { loadDraft, saveDraft, clearDraft, hasMeaningfulContent } from "../utils/draftPersistence";
import { computeIncidentValidation } from "../utils/incidentValidation";
import { buildIncidentPayload } from "../utils/incidentPayload";
import { useEntitySearch } from "../hooks/useEntitySearch";
import CaseTab from "../components/incident/CaseTabContent";
import IncidentMetadataSection from "../components/incident/IncidentMetadataSection";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────
// Main InsertRecord page
// ─────────────────────────────────────────────
const InsertRecord = () => {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draftId");  // null when creating new
  const isEditingDraft = Boolean(draftId);

  // ── Reference data ──
  const [refData, setRefData] = useState({ departments: [], sources: [], domains: [], severity: [], stages: [], harm: [], feedback_intent_types: [], clinical_risk_types: [], buildings: [] });
  const [sections, setSections] = useState([]);   // Type=324 sections — used for Issuing Section only
  const [orgUnits, setOrgUnits] = useState([]);   // All targetable units (323/325/324)

  // Derived: true when Feedback Intent = Notice (code-driven, not ID-hardcoded)
  const [loadingRef, setLoadingRef] = useState(false);
  const [draftLoadError, setDraftLoadError] = useState(null);

  // ── Draft restore banner ──
  const [draftRestored, setDraftRestored] = useState(false);

  // ── Incident (common) fields ── (init from draft if available)
  const _savedDraft = loadDraft();
  const [incident, setIncident] = useState(_savedDraft?.incident || emptyIncident());

  // ── Cases (tabs) ──
  const [cases, setCases] = useState(_savedDraft?.cases || [emptyCase()]);
  const [activeTab, setActiveTab] = useState(0);

  // ── NER search helpers ──
  const patientSearch = useEntitySearch(searchPatients);

  // Whether patient was chosen from search (shows chip) vs just typed
  const [patientConfirmed, setPatientConfirmed] = useState(false);

  // ── UI state ──
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [caseValidationErrors, setCaseValidationErrors] = useState([]);
  const [globalError, setGlobalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const submittingRef = useRef(false);

  // ── Paper-form reference numbers ──
  const [previewNumbers, setPreviewNumbers] = useState(null);

  // ── Quick-add patient modal ──
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({ first_name: "", middle_name: "", last_name: "" });
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddError, setQuickAddError] = useState(null);

  // Show draft-restored banner on mount if we loaded from a saved draft
  useEffect(() => {
    if (!isEditingDraft && _savedDraft && hasMeaningfulContent(_savedDraft.incident, _savedDraft.cases)) {
      setDraftRestored(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Paper-form reference numbers: fetch estimated IDs ──
  // Re-fetches whenever case count changes (Add Case / Remove Case).
  // Skipped when editing an existing draft (IDs already confirmed on first save).
  useEffect(() => {
    if (isEditingDraft) return;
    fetchNextNumbers(cases.length).then((nums) => {
      if (nums?.success) setPreviewNumbers(nums);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases.length, isEditingDraft]);

  // ── Load existing draft from DB when ?draftId is present ──
  useEffect(() => {
    if (!isEditingDraft) return;

    async function loadDraftFromDB() {
      setLoadingRef(true);
      setDraftLoadError(null);
      try {
        const record = await getRecordById(Number(draftId));
        if (!record) { setDraftLoadError("Draft not found"); return; }

        // Map flat API response → incident + cases state
        setIncident({
          complaint_summary: record.incident_summary || record.complaint_text || "",
          feedback_received_date: record.received_date || TODAY,
          incident_date: record.incident_date || record.received_date || TODAY,
          issuing_department_id: record.issuing_org_unit_id || null,
          source_id: record.source_id || null,
          is_inpatient: record.is_in_patient != null ? record.is_in_patient : (record.is_inpatient != null ? record.is_inpatient : true),
          building_id: record.building_id || null,
          patient_name: record.patient_name || "",
          patient_ids: [],
        });

        setCases([{
          target_department_id: record.target_departments?.[0]?.id || null,
          feedback_intent_type_id: record.feedback_intent_type_id || null,
          complaint_text: record.complaint_text || "",
          immediate_action: record.immediate_action || "",
          taken_action: record.taken_action || "",
          domain_id: record.domain_id || null,
          category_id: record.category_id || null,
          subcategory_id: record.subcategory_id || null,
          classification_id: record.classification_id || null,
          severity_id: record.severity_id || null,
          stage_id: record.stage_id || null,
          harm_id: record.harm_level_id || null,
          clinical_risk_type_id: record.clinical_risk_type_id || 1,
          is_morbidity: record.is_morbidity != null ? record.is_morbidity : false,
          doctors: record.doctors || [],
          employees: record.employees || [],
          _categories: [],
          _subcategories: [],
          _classifications: [],
        }]);

        setPatientConfirmed(Boolean(record.patient_name));

        // Cascade-load categories/subcategories if domain is set
        if (record.domain_id) {
          try {
            const cats = await fetchCategories(record.domain_id);
            // categories state is per-case and handled by the cascade useEffect
          } catch (_) {}
        }
      } catch (e) {
        setDraftLoadError(e?.response?.data?.message || e?.message || "Failed to load draft");
      } finally {
        setLoadingRef(false);
      }
    }

    loadDraftFromDB();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  // Auto-save draft whenever form data changes
  useEffect(() => {
    if (hasMeaningfulContent(incident, cases)) {
      saveDraft(incident, cases);
    } else {
      clearDraft();
    }
  }, [incident, cases]);

  // Browser beforeunload warning
  useEffect(() => {
    const warn = (e) => {
      if (hasMeaningfulContent(incident, cases)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [incident, cases]);

  // Load reference data
  useEffect(() => {
    (async () => {
      try {
        setLoadingRef(true);
        const data = await fetchReferenceData();
        setRefData(data);
        // Sections (Type=324) for the Issuing Section dropdown
        const resp = await fetch("/api/settings/sections", { credentials: "include" });
        if (resp.ok) {
          const j = await resp.json();
          setSections(j.sections || []);
        }
        // All targetable org units (Administration/Department/Section) for the Target Unit dropdown
        const targetUnits = await fetchAllTargetUnits();
        setOrgUnits(targetUnits);
      } catch (e) {
        setGlobalError("Failed to load reference data. Please refresh.");
      } finally {
        setLoadingRef(false);
      }
    })();
  }, []);

  // ── Incident field change ──
  function setIncidentField(key, value) {
    setIncident((prev) => ({ ...prev, [key]: value }));
  }

  // ── Case field change ──
  function updateCase(idx, patch) {
    setCases((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  // ── Add / remove case tabs ──
  function addCase() {
    setCases((prev) => [...prev, emptyCase()]);
    setActiveTab(cases.length);
  }

  function removeCase(idx) {
    if (cases.length === 1) return;
    const next = cases.filter((_, i) => i !== idx);
    setCases(next);
    setActiveTab(Math.min(activeTab, next.length - 1));
  }

  // ── Quick-add patient ──
  function openQuickAdd(prefillName) {
    setQuickAddForm({ first_name: prefillName, middle_name: "", last_name: "" });
    setQuickAddError(null);
    setQuickAddOpen(true);
  }

  async function submitQuickAdd() {
    if (!quickAddForm.first_name.trim()) {
      setQuickAddError("First name is required.");
      return;
    }
    try {
      setQuickAddLoading(true);
      setQuickAddError(null);
      const result = await createPatient(quickAddForm);
      const newPatient = result.patient || result;
      const name = newPatient.full_name || [quickAddForm.first_name, quickAddForm.middle_name, quickAddForm.last_name].filter(Boolean).join(" ");
      patientSearch.search("");
      setIncidentField("patient_name", name);
      setPatientConfirmed(true);
      setQuickAddOpen(false);
      setSuccessMsg(`Patient "${name}" created and selected.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setQuickAddError(e?.message || "Failed to create patient. Please try again.");
    } finally {
      setQuickAddLoading(false);
    }
  }

  // ── Validation ──
  function validate() {
    const { errs, caseErrs } = computeIncidentValidation(incident, cases, refData);

    setValidationErrors(errs);
    setCaseValidationErrors(caseErrs);

    const incidentOk = Object.keys(errs).length === 0;
    const casesOk = caseErrs.every((ce) => Object.keys(ce).length === 0);

    if (!incidentOk || !casesOk) {
      const badCaseIdx = caseErrs.findIndex((ce) => Object.keys(ce).length > 0);
      if (badCaseIdx >= 0) setActiveTab(badCaseIdx);
      return false;
    }
    return true;
  }

  // ── Open review modal ──
  function openReview() {
    if (!validate()) {
      setGlobalError("Please fix all highlighted fields before reviewing.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setGlobalError(null);
    setReviewOpen(true);
  }

  // ── Build payload (shared by all save modes) ──
  function buildPayload(saveMode) {
    return buildIncidentPayload(saveMode, incident, cases, refData);
  }

  function resetForm() {
    clearDraft();
    setDraftRestored(false);
    setIncident(emptyIncident());
    setCases([emptyCase()]);
    setActiveTab(0);
    setValidationErrors({});
    setCaseValidationErrors([]);
    patientSearch.setQuery("");
    patientSearch.setResults([]);
    setPatientConfirmed(false);
    setSuccessData(null);
  }

  // ── Shared save dispatcher ──
  async function dispatchSave(saveMode) {
    if (submittingRef.current) return;
    if (saveMode === 'complete' && !validate()) {
      setGlobalError("Please fill in all required fields before saving as complete.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    submittingRef.current = true;
    setSubmitLoading(true);
    setGlobalError(null);
    setSuccessData(null);
    setReviewOpen(false);

    try {
      let result;

      if (isEditingDraft) {
        // Editing existing draft → UPDATE
        const caseData = cases[0] || {};
        const updatePayload = {
          save_mode: saveMode,
          complaint_text: caseData.complaint_text || "",
          immediate_action: caseData.immediate_action || "",
          taken_action: caseData.taken_action || "",
          feedback_received_date: incident.feedback_received_date,
          incident_date: incident.incident_date,
          issuing_department_id: incident.issuing_department_id ? Number(incident.issuing_department_id) : undefined,
          source_id: incident.source_id ? Number(incident.source_id) : undefined,
          building_id: incident.building_id ? Number(incident.building_id) : undefined,
          is_inpatient: incident.is_inpatient,
          is_morbidity: caseData.is_morbidity ?? false,
          feedback_intent_type_id: caseData.feedback_intent_type_id ? Number(caseData.feedback_intent_type_id) : undefined,
          patient_name: incident.patient_name || "",
          target_department_ids: caseData.target_department_id ? [Number(caseData.target_department_id)] : [],
          domain_id: caseData.domain_id ? Number(caseData.domain_id) : undefined,
          category_id: caseData.category_id ? Number(caseData.category_id) : undefined,
          subcategory_id: caseData.subcategory_id ? Number(caseData.subcategory_id) : undefined,
          classification_id: caseData.classification_id ? Number(caseData.classification_id) : undefined,
          severity_id: caseData.severity_id ? Number(caseData.severity_id) : undefined,
          stage_id: caseData.stage_id ? Number(caseData.stage_id) : undefined,
          harm_id: caseData.harm_id ? Number(caseData.harm_id) : undefined,
          clinical_risk_type_id: Number(caseData.clinical_risk_type_id || 1),
          requires_explanation: false,
          doctors: caseData.doctors?.length > 0 ? caseData.doctors : undefined,
          employees: caseData.employees?.length > 0 ? caseData.employees : undefined,
        };
        result = await updateRecord(Number(draftId), updatePayload);
      } else {
        // New record → POST
        result = await submitIncident(buildPayload(saveMode));
      }

      if (saveMode === 'draft') {
        if (!isEditingDraft) {
          resetForm();
          if (result.incident_id) setSuccessData({ incident_id: result.incident_id, cases: result.cases || [] });
        }
        setSuccessMsg(isEditingDraft ? "Draft saved." : "Saved as Draft. Continue editing from the 'Not Sent' tab.");
        setTimeout(() => setSuccessMsg(null), 6000);
      } else {
        // complete
        if (result.demoted_to_draft) {
          setGlobalError("Saved as Draft — some required fields were still missing.");
        } else {
          if (!isEditingDraft) {
            resetForm();
            if (result.incident_id) setSuccessData({ incident_id: result.incident_id, cases: result.cases || [] });
          }
          setSuccessMsg("Marked as Ready to Send.");
          setTimeout(() => setSuccessMsg(null), 6000);
        }
      }
    } catch (e) {
      setGlobalError(e?.response?.data?.message || e?.message || "Save failed.");
    } finally {
      setSubmitLoading(false);
      submittingRef.current = false;
    }
  }

  // ── Save as Draft ──
  async function handleSaveDraft() { await dispatchSave("draft"); }

  // ── Save as Complete (→ Ready to Send) ──
  async function handleSaveComplete() { await dispatchSave("complete"); }

  // ── Submit (legacy workflow path, used by Review modal) ──
  async function handleSubmit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitLoading(true);
    setGlobalError(null);
    setReviewOpen(false);
    try {
      const result = await submitIncident(buildPayload("workflow"));
      resetForm();
      if (result.incident_id) setSuccessData({ incident_id: result.incident_id, cases: result.cases || [] });
      setSuccessMsg(`Incident created with ${result.count || cases.length} case(s). The form has been reset.`);
      setTimeout(() => setSuccessMsg(null), 8000);
    } catch (e) {
      setGlobalError(e?.response?.data?.message || e?.message || "Submission failed.");
    } finally {
      setSubmitLoading(false);
      submittingRef.current = false;
    }
  }

  // ── Tab label ──
  function tabLabel(c, i) {
    const unit = orgUnits.find((u) => u.id === c.target_department_id);
    return unit ? unit.name : `Case ${i + 1}`;
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* ── Header ── */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
            <Typography level="h2" sx={{ fontWeight: 800, background: theme.gradients.primary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isEditingDraft ? "✏️ Continue Draft" : "📋 Create New Incident"}
            </Typography>
            {isEditingDraft && (
              <Box sx={{ px: 1.5, py: 0.3, borderRadius: "20px", background: "#fef9c3", border: "1px solid #fde047", fontSize: "0.8rem", fontWeight: 700, color: "#854d0e" }}>
                Draft #{draftId}
              </Box>
            )}
          </Box>
          <Typography level="body-sm" sx={{ color: "#666" }}>
            {isEditingDraft
              ? "Continue filling in the missing fields, then Save as Complete when ready."
              : "Fill in the shared incident information, then add one or more cases targeting different organizational units."}
          </Typography>
        </Box>
        {draftLoadError && <Alert color="danger" sx={{ mb: 2 }}>Failed to load draft: {draftLoadError}</Alert>}

        {/* ── Paper-form reference numbers ── */}
        {!successData && previewNumbers && (
          <Card variant="outlined" sx={{
            mb: 3, p: 2.5,
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "2px solid #93c5fd",
            borderRadius: "12px",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography level="title-sm" sx={{ fontWeight: 700, color: "#1e40af" }}>
                📋 Paper Form Reference Numbers
              </Typography>
              <Button
                size="sm" variant="plain" color="neutral"
                onClick={() => fetchNextNumbers(cases.length).then((n) => n?.success && setPreviewNumbers(n))}
                sx={{ color: "#64748b", minWidth: "auto", px: 1 }}
                title="Refresh numbers"
              >
                ↻ Refresh
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-start" }}>
              {/* Incident number */}
              <Box>
                <Typography level="body-xs" sx={{ color: "#3b82f6", textTransform: "uppercase", fontWeight: 700, mb: 0.3, letterSpacing: "0.06em" }}>
                  Incident Number
                </Typography>
                <Typography level="h3" sx={{ fontFamily: "monospace", fontWeight: 800, color: "#1e3a8a", letterSpacing: "0.08em" }}>
                  {previewNumbers.incident_number}
                </Typography>
              </Box>
              {/* Per-case numbers */}
              {previewNumbers.case_ids.map((caseId, i) => (
                <Box key={i}>
                  <Typography level="body-xs" sx={{ color: "#3b82f6", textTransform: "uppercase", fontWeight: 700, mb: 0.3, letterSpacing: "0.06em" }}>
                    Case {i + 1} Number
                  </Typography>
                  <Typography level="h3" sx={{ fontFamily: "monospace", fontWeight: 800, color: "#1e3a8a", letterSpacing: "0.08em" }}>
                    #{caseId}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography level="body-xs" sx={{ color: "#64748b", mt: 1.5, fontStyle: "italic" }}>
              Write these on your paper form now. The numbers will be confirmed when you save.
            </Typography>
          </Card>
        )}

        {/* ── Global alerts ── */}
        {draftRestored && (
          <Alert
            color="warning"
            sx={{ mb: 2 }}
            endDecorator={
              <Button size="sm" variant="plain" color="warning" onClick={() => { resetForm(); setDraftRestored(false); }}>
                Discard
              </Button>
            }
          >
            ✏️ A temporary draft was restored from your last session. Review it below or discard.
          </Alert>
        )}
        {globalError && <Alert color="danger" sx={{ mb: 2 }}>{globalError}</Alert>}
        {successMsg && <Alert color="success" startDecorator={<CheckCircleIcon />} sx={{ mb: 2 }}>{successMsg}</Alert>}
        {successData && (
          <Alert
            color="success"
            startDecorator={<CheckCircleIcon />}
            sx={{ mb: 2, alignItems: "flex-start" }}
            endDecorator={
              <Button size="sm" variant="plain" color="success" onClick={() => setSuccessData(null)}>Dismiss</Button>
            }
          >
            <Box>
              <Typography level="title-sm" fontWeight={700} sx={{ mb: 1 }}>Incident Saved</Typography>
              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Box>
                  <Typography level="body-xs" sx={{ color: "success.700", textTransform: "uppercase", fontWeight: 600, mb: 0.3 }}>Incident Number</Typography>
                  <Typography level="body-lg" fontWeight={800} sx={{ fontFamily: "monospace", letterSpacing: 1 }}>
                    INC-{String(successData.incident_id).padStart(6, "0")}
                  </Typography>
                </Box>
                {successData.cases.length > 0 && (
                  <Box>
                    <Typography level="body-xs" sx={{ color: "success.700", textTransform: "uppercase", fontWeight: 600, mb: 0.3 }}>
                      Case Number{successData.cases.length > 1 ? "s" : ""}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      {successData.cases.map((c, i) => (
                        <Typography key={i} level="body-lg" fontWeight={800} sx={{ fontFamily: "monospace", letterSpacing: 1 }}>
                          Case #{c.case_id}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Alert>
        )}
        {loadingRef && <Alert color="neutral" sx={{ mb: 2 }}>Loading reference data…</Alert>}

        {/* ══════════════════════════════════════════
            SECTION 1 — Incident Common Fields
        ══════════════════════════════════════════ */}
        <IncidentMetadataSection
          incident={incident}
          onFieldChange={setIncidentField}
          refData={refData}
          sections={sections}
          validationErrors={validationErrors}
          patientSearch={patientSearch}
          patientConfirmed={patientConfirmed}
          onPatientConfirmedChange={setPatientConfirmed}
          onAddNewPatient={openQuickAdd}
        />

        {/* ══════════════════════════════════════════
            SECTION 2 — Cases (Tabs)
        ══════════════════════════════════════════ */}
        <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)", border: `1px solid ${theme.colors.primary}1A` }}>
          <Box sx={{ p: 2, pb: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography level="title-lg" sx={{ fontWeight: 700, color: theme.colors.primary }}>
              Cases — One per Target Unit
            </Typography>
            <Button
              size="sm"
              variant="soft"
              color="success"
              startDecorator={<AddIcon />}
              onClick={addCase}
            >
              Add Case
            </Button>
          </Box>
          <Typography level="body-xs" sx={{ px: 2, pb: 1, color: "#888" }}>
            Each tab is one case targeting exactly one organizational unit. Add as many cases as there are units involved in this incident.
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          >
            <TabList sx={{ overflowX: "auto", flexShrink: 0 }}>
              {cases.map((c, i) => {
                const hasError = caseValidationErrors[i] && Object.keys(caseValidationErrors[i]).length > 0;
                return (
                  <Tab
                    key={i}
                    value={i}
                    sx={{ minWidth: 130, position: "relative" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {hasError && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "danger.500" }} />}
                      <Typography level="body-sm" noWrap sx={{ maxWidth: 120 }}>
                        {tabLabel(c, i)}
                      </Typography>
                      {cases.length > 1 && (
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={(e) => { e.stopPropagation(); removeCase(i); }}
                          sx={{ p: 0.2, minWidth: 20, minHeight: 20 }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Tab>
                );
              })}
            </TabList>

            {cases.map((c, i) => (
              <TabPanel key={i} value={i} sx={{ p: 2 }}>
                <CaseTab
                  caseData={c}
                  caseIndex={i}
                  onChange={(patch) => updateCase(i, patch)}
                  refData={refData}
                  sections={sections}
                  orgUnits={orgUnits}
                  validationErrors={caseValidationErrors[i] || {}}
                />
              </TabPanel>
            ))}
          </Tabs>
        </Card>

        {/* ── Submit bar ── */}
        <Box sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 2, p: 2, borderRadius: "md",
          background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
          border: "1px solid #c5d5f5",
        }}>
          <Typography level="body-sm" sx={{ color: "neutral.600", maxWidth: 420 }}>
            <b>Save as Draft</b> — saves immediately with no validation.&nbsp;
            <b>Save as Complete</b> — validates and marks as Ready to Send for administrator review before publishing.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              color="neutral"
              size="lg"
              onClick={handleSaveDraft}
              loading={submitLoading}
              disabled={submitLoading}
              sx={{ minWidth: 150 }}
            >
              Save as Draft
            </Button>
            <Button
              variant="solid"
              color="primary"
              size="lg"
              startDecorator={<SendIcon />}
              onClick={handleSaveComplete}
              loading={submitLoading}
              disabled={submitLoading}
              sx={{ minWidth: 180 }}
            >
              Save as Complete
            </Button>
          </Box>
        </Box>

        {/* ══════════════════════════════════════════
            REVIEW MODAL
        ══════════════════════════════════════════ */}
        <Modal open={reviewOpen} onClose={() => setReviewOpen(false)}>
          <ModalDialog sx={{ maxWidth: 680, width: "95vw", maxHeight: "90vh", overflow: "auto" }}>
            <ModalClose />
            <DialogTitle>Review Incident Before Submitting</DialogTitle>
            <Divider />
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Incident summary */}
                <Card variant="soft" color="primary" sx={{ p: 2 }}>
                  <Typography level="title-sm" sx={{ fontWeight: 700, mb: 1 }}>Incident Info</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <Typography level="body-xs" sx={{ color: "#888" }}>Patient</Typography>
                      <Typography level="body-sm" fontWeight={600}>{incident.patient_name || "—"}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <Typography level="body-xs" sx={{ color: "#888" }}>Incident Date</Typography>
                      <Typography level="body-sm">{incident.incident_date}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <Typography level="body-xs" sx={{ color: "#888" }}>Received Date</Typography>
                      <Typography level="body-sm">{incident.feedback_received_date}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 180 }}>
                      <Typography level="body-xs" sx={{ color: "#888" }}>Patient Type</Typography>
                      <Typography level="body-sm">{incident.is_inpatient ? "Inpatient" : "Outpatient"}</Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Cases summary */}
                <Typography level="title-sm" fontWeight={700}>
                  {cases.length} Case{cases.length !== 1 ? "s" : ""}
                </Typography>
                {cases.map((c, i) => {
                  const unit = orgUnits.find((u) => u.id === c.target_department_id);
                  const intentLabel = (refData.feedback_intent_types || []).find((f) => f.id === c.feedback_intent_type_id);
                  return (
                    <Card key={i} variant="outlined" sx={{ p: 2 }}>
                      <Typography level="body-sm" fontWeight={700} sx={{ mb: 1 }}>
                        Case {i + 1} — {unit ? `[${unit.type_label}] ${unit.name}` : "No unit selected"}
                      </Typography>
                      {intentLabel && (
                        <Typography level="body-xs" sx={{ color: "#888", mb: 0.5 }}>
                          Intent: {intentLabel.name_en || intentLabel.name}
                          {c.is_morbidity ? " · Morbidity" : ""}
                        </Typography>
                      )}
                      {(c.doctors || []).length > 0 && (
                        <Typography level="body-xs" sx={{ color: "#888", mb: 0.5 }}>
                          Doctors: {c.doctors.map((d) => d.doctor_name).join(", ")}
                        </Typography>
                      )}
                      {(c.employees || []).length > 0 && (
                        <Typography level="body-xs" sx={{ color: "#888", mb: 0.5 }}>
                          Employees: {c.employees.map((e) => e.full_name || e.employee_name).join(", ")}
                        </Typography>
                      )}
                      <Typography level="body-xs" sx={{ color: "#888" }} noWrap>
                        {c.complaint_text.substring(0, 120)}{c.complaint_text.length > 120 ? "…" : ""}
                      </Typography>
                    </Card>
                  );
                })}
              </Box>
            </DialogContent>
            <Divider />
            <DialogActions>
              <Button variant="solid" color="primary" onClick={handleSubmit} loading={submitLoading} startDecorator={<SendIcon />}>
                Confirm & Submit
              </Button>
              <Button variant="plain" color="neutral" onClick={() => setReviewOpen(false)} disabled={submitLoading}>
                Go Back & Edit
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
        {/* ── Quick-Add Patient Modal ── */}
        <Modal open={quickAddOpen} onClose={() => !quickAddLoading && setQuickAddOpen(false)}>
          <ModalDialog sx={{ minWidth: 360, maxWidth: 480, maxHeight: "90vh", overflow: "auto" }}>
            <ModalClose disabled={quickAddLoading} />
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogContent sx={{ overflowX: "hidden" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}>
                {quickAddError && <Alert color="danger" size="sm">{quickAddError}</Alert>}
                <FormControl required>
                  <FormLabel>First Name *</FormLabel>
                  <Input
                    autoFocus
                    value={quickAddForm.first_name}
                    onChange={(e) => setQuickAddForm((f) => ({ ...f, first_name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && submitQuickAdd()}
                    placeholder="e.g. Ahmed"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Middle Name</FormLabel>
                  <Input
                    value={quickAddForm.middle_name}
                    onChange={(e) => setQuickAddForm((f) => ({ ...f, middle_name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && submitQuickAdd()}
                    placeholder="Optional"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={quickAddForm.last_name}
                    onChange={(e) => setQuickAddForm((f) => ({ ...f, last_name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && submitQuickAdd()}
                    placeholder="Optional"
                  />
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="solid"
                color="success"
                loading={quickAddLoading}
                onClick={submitQuickAdd}
                startDecorator={<AddIcon />}
              >
                Add Patient
              </Button>
              <Button variant="plain" color="neutral" onClick={() => setQuickAddOpen(false)} disabled={quickAddLoading}>
                Cancel
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </Container>
    </MainLayout>
  );
};

export default InsertRecord;