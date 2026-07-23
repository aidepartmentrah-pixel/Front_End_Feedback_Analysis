// src/pages/EditRecord.js
// Edit an entire incident — all cases shown as tabs, same shared components as InsertRecord.
// URL: /edit-record/:id  where id = IncidentRequestCaseID (any case in the incident)
// On load: fetches all sibling cases via GET /api/incidents/{incident_id}/cases.
// "Add Case" creates a new blank Draft case via POST /api/incidents/{incident_id}/cases.
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box, Container, Typography, Divider, CircularProgress, Card, Alert, Button,
  Tabs, TabList, Tab, TabPanel, IconButton,
} from "@mui/joy";
import { Warning } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useParams } from "react-router-dom";
import theme from "../theme";

import MainLayout from "../components/common/MainLayout";
import EditActionButtons from "../components/edit/EditActionButtons";
import IncidentMetadataSection from "../components/incident/IncidentMetadataSection";
import CaseTabContent from "../components/incident/CaseTabContent";

import { getRecordById, updateRecord } from "../api/complaints";
import {
  fetchReferenceData, fetchCategories, fetchSubcategories, fetchClassifications,
  fetchIncidentFullCases, addCaseToIncident,
} from "../api/insertRecord";
import { fetchAllTargetUnits } from "../api/orgUnits";

import { emptyIncident, emptyCase } from "../utils/incidentModel";
import { computeIncidentValidation } from "../utils/incidentValidation";
import { recordToIncidentAndCase, recordToCase, buildUpdatePayload } from "../utils/editRecordMapping";

const PATIENT_SEARCH_STUB = {
  query: "", results: [], loading: false,
  search: () => {}, setQuery: () => {}, setResults: () => {},
};

const PREPARATION_STATUSES = new Set(["Draft", "Ready to Send"]);

const EditRecord = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ── Raw API data for header ──
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [incidentId, setIncidentId] = useState(null);

  // ── Shared incident + cases state ──
  const [incident, setIncident] = useState(emptyIncident());
  const [cases, setCases] = useState([]);

  // ── Snapshots for Reset ──
  const [originalIncident, setOriginalIncident] = useState(null);
  const [originalCases, setOriginalCases] = useState(null);

  // ── Tab state (starts on the case matching the URL param) ──
  const [activeTab, setActiveTab] = useState(0);

  // ── Reference data ──
  const [refData, setRefData] = useState({
    domains: [], sources: [], severity: [], stages: [], harm: [],
    feedback_intent_types: [], clinical_risk_types: [], buildings: [],
  });
  const [sections, setSections] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);

  // ── UI state ──
  const [loading, setLoading] = useState(false);
  const [addingCase, setAddingCase] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [caseValidationErrors, setCaseValidationErrors] = useState([]);
  const isSubmittingRef = useRef(false);

  // ── Reference data + sections + orgUnits (parallel on mount) ──
  useEffect(() => {
    (async () => {
      try {
        const [data, secResp, units] = await Promise.all([
          fetchReferenceData(),
          fetch("/api/settings/sections", { credentials: "include" }),
          fetchAllTargetUnits(),
        ]);
        setRefData(data);
        if (secResp.ok) { const j = await secResp.json(); setSections(j.sections || []); }
        setOrgUnits(units);
      } catch (e) {
        console.error("Failed to load reference data:", e);
      }
    })();
  }, []);

  // ── Helper: pre-load cascade options for a single case ──
  const preloadCascade = async (caseObj) => {
    if (!caseObj.domain_id) return caseObj;
    try {
      const cats = await fetchCategories(caseObj.domain_id);
      caseObj._categories = Array.isArray(cats) ? cats : [];
      if (caseObj.category_id) {
        const subs = await fetchSubcategories(caseObj.category_id);
        caseObj._subcategories = Array.isArray(subs) ? subs : [];
        if (caseObj.subcategory_id) {
          const cls = await fetchClassifications(caseObj.subcategory_id);
          caseObj._classifications = Array.isArray(cls) ? cls : [];
        }
      }
    } catch { /* cascade load failure is non-fatal */ }
    return caseObj;
  };

  // ── Load incident + all its cases ──
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Load the primary case (from URL param) to get incident_id + header data
        const res = await getRecordById(id);
        const primaryRecord = res.record;
        primaryRecord.case_status_name = primaryRecord.case_status_name || primaryRecord.status_name || null;
        setSelectedRecord(primaryRecord);

        const incId = primaryRecord.incident_id;
        setIncidentId(incId);

        // 2. Map incident-level fields from primary case
        const { incident: inc } = recordToIncidentAndCase(primaryRecord);

        // 3. Fetch ALL cases for this incident
        let allCaseRecords = [];
        try {
          const casesResp = await fetchIncidentFullCases(incId);
          allCaseRecords = casesResp.cases || [];
        } catch {
          // Fall back to just the primary case if the endpoint fails
          allCaseRecords = [primaryRecord];
        }

        // 4. Map + pre-load cascade options for every case (in parallel)
        const mappedCases = await Promise.all(
          allCaseRecords.map(async (rec) => {
            const caseObj = recordToCase(rec);
            return preloadCascade(caseObj);
          })
        );

        setIncident(inc);
        setCases(mappedCases);
        setOriginalIncident(structuredClone(inc));
        setOriginalCases(structuredClone(mappedCases));

        // 5. Activate the tab that matches the URL param case_id
        const urlCaseId = Number(id);
        const tabIdx = allCaseRecords.findIndex((r) => r.id === urlCaseId);
        setActiveTab(tabIdx >= 0 ? tabIdx : 0);

        setHasChanges(false);
      } catch (e) {
        setError(`Failed to load record: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Field helpers ──
  const setIncidentField = (key, value) => {
    setIncident((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateCase = (idx, patch) => {
    setCases((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    setHasChanges(true);
  };

  // ── Derived: live validation ──
  const currentValidation = useMemo(
    () => computeIncidentValidation(incident, cases, refData),
    [incident, cases, refData]
  );
  const isFormValid = Object.keys(currentValidation.errs).length === 0 &&
                      currentValidation.caseErrs.every((ce) => Object.keys(ce).length === 0);

  // ── Incomplete-on-load banner ──
  const incompleteOnLoad = selectedRecord && !loading &&
    (Object.keys(currentValidation.errs).length > 0 ||
     currentValidation.caseErrs.some((ce) => Object.keys(ce).length > 0));
  const missingCount = Object.keys(currentValidation.errs).length +
    currentValidation.caseErrs.reduce((sum, ce) => sum + Object.keys(ce).length, 0);

  // ── Status guards ──
  // "Add Case" only available when all current cases are in a preparation status.
  const canAddCase = cases.length > 0 &&
    cases.every((c) => PREPARATION_STATUSES.has(c._status_name));

  // ── Update All ──
  const handleUpdateRecord = async () => {
    if (isSubmittingRef.current) return;
    try {
      isSubmittingRef.current = true;
      setLoading(true);
      setError(null);

      const { errs, caseErrs } = computeIncidentValidation(incident, cases, refData);
      const hasErrors = Object.keys(errs).length > 0 || caseErrs.some((ce) => Object.keys(ce).length > 0);
      if (hasErrors) {
        setValidationErrors(errs);
        setCaseValidationErrors(caseErrs);
        const badIdx = caseErrs.findIndex((ce) => Object.keys(ce).length > 0);
        if (badIdx >= 0) setActiveTab(badIdx);
        const total = Object.keys(errs).length + caseErrs.reduce((s, ce) => s + Object.keys(ce).length, 0);
        setError(`Please fix ${total} highlighted field(s) before saving.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Save each case in sequence (simple, predictable error reporting)
      for (let i = 0; i < cases.length; i++) {
        const c = cases[i];
        if (!c._case_id) continue;
        await updateRecord(c._case_id, buildUpdatePayload("workflow", incident, c));
      }

      setSuccess(`${cases.length} case(s) updated successfully! Redirecting…`);
      setHasChanges(false);
      setTimeout(() => navigate("/table-view"), 2000);
    } catch (e) {
      setError(`Error updating record: ${e.message}`);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // ── Add Case ──
  const handleAddCase = async () => {
    if (!incidentId || addingCase) return;
    try {
      setAddingCase(true);
      setError(null);
      const resp = await addCaseToIncident(incidentId);
      if (!resp.success) throw new Error("Failed to create case");

      const newRes = await getRecordById(resp.case_id);
      const newCaseObj = await preloadCascade(recordToCase(newRes.record));

      setCases((prev) => {
        const next = [...prev, newCaseObj];
        setActiveTab(next.length - 1);
        return next;
      });
      setOriginalCases((prev) => [...(prev || []), structuredClone(newCaseObj)]);
      setHasChanges(true);
    } catch (e) {
      setError(`Failed to add case: ${e.message}`);
    } finally {
      setAddingCase(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to cancel?")) return;
    navigate("/table-view");
  };

  const handleReset = () => {
    if (!originalIncident || !originalCases) return;
    setIncident(structuredClone(originalIncident));
    setCases(structuredClone(originalCases));
    setActiveTab(0);
    setHasChanges(false);
    setSuccess(null);
    setValidationErrors({});
    setCaseValidationErrors([]);
  };

  // ── Tab label — target unit name or fallback ──
  const tabLabel = (c, i) => {
    const unit = orgUnits.find((u) => u.id === c.target_department_id);
    return unit ? unit.name : `Case ${i + 1}`;
  };

  // ── Status badge colour ──
  const statusBadgeStyle = (statusName) => {
    if (statusName === "Draft") return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
    if (statusName === "Ready to Send") return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
    return { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" };
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>

        {/* ── Header ── */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography level="h2" sx={{ fontWeight: 800, background: theme.gradients.primary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ✏️ Edit Incident
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666", mt: 0.5 }}>
              {selectedRecord?.incident_number && (
                <span style={{ color: "#1F6F73", fontWeight: 700 }}>
                  {selectedRecord.incident_number}
                </span>
              )}
              {selectedRecord?.incident_number && cases.length > 0 && (
                <span style={{ marginLeft: 10, color: "#888" }}>
                  — {cases.length} case{cases.length !== 1 ? "s" : ""}
                </span>
              )}
            </Typography>
          </Box>
        </Box>

        {/* ── Loading ── */}
        {loading && !selectedRecord && (
          <Card sx={{ p: 4, textAlign: "center", background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)" }}>
            <CircularProgress size="lg" sx={{ "--CircularProgress-color": theme.colors.primary }} />
            <Typography level="body-md" sx={{ mt: 2, color: theme.colors.primary, fontWeight: 600 }}>Loading incident…</Typography>
          </Card>
        )}

        {/* ── Error ── */}
        {error && (
          <Card sx={{ mb: 2, p: 3, bgcolor: "danger.softBg", border: "2px solid", borderColor: "danger.solidBg" }}>
            <Typography color="danger" level="title-md" sx={{ fontWeight: 700, mb: 1 }}>❌ Error</Typography>
            <Typography color="danger" level="body-sm" sx={{ whiteSpace: "pre-line" }}>{error}</Typography>
          </Card>
        )}

        {/* ── Success ── */}
        {success && (
          <Card sx={{ mb: 2, p: 2, bgcolor: "success.softBg" }}>
            <Typography color="success">✅ {success}</Typography>
          </Card>
        )}

        {/* ── Incomplete-record warning ── */}
        {incompleteOnLoad && !error && (
          <Alert color="warning" variant="soft" startDecorator={<Warning />}
            sx={{ mb: 2, p: 3, border: "2px solid", borderColor: "warning.solidBg" }}>
            <Box>
              <Typography level="title-md" sx={{ fontWeight: 700, mb: 1 }}>
                ⚠️ This record is incomplete and must be fixed before saving.
              </Typography>
              <Typography level="body-sm">Missing required fields: {missingCount}</Typography>
              <Typography level="body-xs" sx={{ mt: 1, fontStyle: "italic" }}>
                Please fill all fields marked with * before updating.
              </Typography>
            </Box>
          </Alert>
        )}

        {/* ── Form ── */}
        {selectedRecord && !loading && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* Incident-level shared fields */}
            <IncidentMetadataSection
              incident={incident}
              onFieldChange={setIncidentField}
              refData={refData}
              sections={sections}
              validationErrors={validationErrors}
              patientSearch={PATIENT_SEARCH_STUB}
              patientConfirmed={true}
              onPatientConfirmedChange={() => {}}
              onAddNewPatient={() => {}}
              readOnlyPatient={true}
            />

            {/* Cases card with tabs */}
            <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)", border: `1px solid ${theme.colors.primary}1A` }}>
              <Box sx={{ p: 2, pb: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography level="title-lg" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                  Cases — One per Target Unit
                </Typography>
                {canAddCase && (
                  <Button
                    size="sm"
                    variant="soft"
                    color="success"
                    startDecorator={<AddIcon />}
                    onClick={handleAddCase}
                    loading={addingCase}
                    disabled={addingCase}
                  >
                    Add Case
                  </Button>
                )}
              </Box>
              <Typography level="body-xs" sx={{ px: 2, pb: 1, color: "#888" }}>
                Each tab is one case targeting exactly one organizational unit.
              </Typography>

              {cases.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <CircularProgress size="sm" />
                </Box>
              ) : (
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  sx={{ borderTop: "1px solid", borderColor: "divider" }}
                >
                  <TabList sx={{ overflowX: "auto", flexShrink: 0 }}>
                    {cases.map((c, i) => {
                      const hasError = caseValidationErrors[i] && Object.keys(caseValidationErrors[i]).length > 0;
                      const badge = statusBadgeStyle(c._status_name);
                      return (
                        <Tab key={c._case_id ?? i} value={i} sx={{ minWidth: 150, position: "relative" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "nowrap" }}>
                            {hasError && (
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "danger.500", flexShrink: 0 }} />
                            )}
                            <Typography level="body-sm" noWrap sx={{ maxWidth: 130 }}>
                              {tabLabel(c, i)}
                            </Typography>
                            {c._status_name && (
                              <Box sx={{
                                px: 0.8, py: 0.2, borderRadius: 10, fontSize: "0.68rem", fontWeight: 700,
                                bgcolor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                                whiteSpace: "nowrap",
                              }}>
                                {c._status_name}
                              </Box>
                            )}
                          </Box>
                        </Tab>
                      );
                    })}
                  </TabList>

                  {cases.map((c, i) => (
                    <TabPanel key={c._case_id ?? i} value={i} sx={{ p: 2 }}>
                      <CaseTabContent
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
              )}
            </Card>

            <EditActionButtons
              onUpdate={handleUpdateRecord}
              onCancel={handleCancel}
              onReset={handleReset}
              loading={loading}
              hasChanges={hasChanges}
              isFormValid={isFormValid}
            />
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && !selectedRecord && (
          <Box sx={{
            p: 4, textAlign: "center", borderRadius: "8px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "2px dashed rgba(102, 126, 234, 0.2)",
          }}>
            <Typography level="h3" sx={{ color: "#667eea", mb: 1 }}>🔍 No Data</Typography>
            <Typography level="body-sm" sx={{ color: "#999" }}>
              {error ? "Failed to load record details" : "No record data available"}
            </Typography>
          </Box>
        )}

      </Container>
    </MainLayout>
  );
};

export default EditRecord;
