// src/pages/EditRecord.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box, Container, Typography, Divider, CircularProgress, Card, Alert, Button,
} from "@mui/joy";
import { Warning } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useParams } from "react-router-dom";
import theme from "../theme";

import MainLayout from "../components/common/MainLayout";
import EditActionButtons from "../components/edit/EditActionButtons";
import IncidentMetadataSection from "../components/incident/IncidentMetadataSection";
import CaseTabContent from "../components/incident/CaseTabContent";

import { getRecordById, updateRecord, publishComplaint } from "../api/complaints";
import { fetchReferenceData, fetchCategories, fetchSubcategories, fetchClassifications } from "../api/insertRecord";
import { fetchAllTargetUnits } from "../api/orgUnits";

import { emptyIncident, emptyCase } from "../utils/incidentModel";
import { computeIncidentValidation } from "../utils/incidentValidation";
import { recordToIncidentAndCase, buildUpdatePayload } from "../utils/editRecordMapping";

const PATIENT_SEARCH_STUB = {
  query: "", results: [], loading: false,
  search: () => {}, setQuery: () => {}, setResults: () => {},
};

const EditRecord = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ── Raw API response (for header badge / Publish button) ──
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ── Shared incident + case state ──
  const [incident, setIncident] = useState(emptyIncident());
  const [cases, setCases] = useState([emptyCase()]);

  // ── Snapshots for Reset ──
  const [originalIncident, setOriginalIncident] = useState(null);
  const [originalCase, setOriginalCase] = useState(null);

  // ── Reference data ──
  const [refData, setRefData] = useState({
    domains: [], sources: [], severity: [], stages: [], harm: [],
    feedback_intent_types: [], clinical_risk_types: [], buildings: [],
  });
  const [sections, setSections] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);

  // ── UI state ──
  const [loading, setLoading] = useState(false);
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

  // ── Load record by case_id (response already includes incident_id) ──
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getRecordById(id);
        const record = res.record;
        record.case_status_name = record.case_status_name || record.status_name || null;
        setSelectedRecord(record);

        const { incident: inc, caseObj } = recordToIncidentAndCase(record);

        // Pre-load cascade options so ClassificationCascade renders with correct child lists.
        if (caseObj.domain_id) {
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
          } catch { /* cascade load failure is non-fatal; user can re-select */ }
        }

        setIncident(inc);
        setCases([caseObj]);
        setOriginalIncident(structuredClone(inc));
        setOriginalCase(structuredClone(caseObj));
        setHasChanges(false);
      } catch (e) {
        setError(`Failed to load record: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
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

  // ── Derived: current validation (live, uses latest refData) ──
  const currentValidation = useMemo(
    () => computeIncidentValidation(incident, cases, refData),
    [incident, cases, refData]
  );
  const isFormValid = Object.keys(currentValidation.errs).length === 0 &&
                      currentValidation.caseErrs.every((ce) => Object.keys(ce).length === 0);

  // ── Initial validation warning (shown on load — uses the same live result) ──
  const incompleteOnLoad = selectedRecord && !loading &&
    (Object.keys(currentValidation.errs).length > 0 ||
     currentValidation.caseErrs.some((ce) => Object.keys(ce).length > 0));
  const missingCount = Object.keys(currentValidation.errs).length +
    currentValidation.caseErrs.reduce((sum, ce) => sum + Object.keys(ce).length, 0);

  // ── Update ──
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
        setError(`Please fix ${Object.keys(errs).length + caseErrs.reduce((s, ce) => s + Object.keys(ce).length, 0)} highlighted field(s) before saving.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      await updateRecord(id, buildUpdatePayload("workflow", incident, cases[0]));
      setSuccess("Record updated successfully! Redirecting…");
      setHasChanges(false);
      setTimeout(() => navigate("/table-view"), 2000);
    } catch (e) {
      setError(`Error updating record: ${e.message}`);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to cancel?")) return;
    navigate("/table-view");
  };

  const handleReset = () => {
    if (!originalIncident || !originalCase) return;
    setIncident(structuredClone(originalIncident));
    setCases([structuredClone(originalCase)]);
    setHasChanges(false);
    setSuccess(null);
    setValidationErrors({});
    setCaseValidationErrors([]);
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>

        {/* ── Header ── */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography level="h2" sx={{ fontWeight: 800, background: theme.gradients.primary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ✏️ Edit Record
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666", mt: 0.5 }}>
              Record #{id}
              {selectedRecord?.incident_number && (
                <span style={{ marginLeft: 12, color: "#1F6F73", fontWeight: 700 }}>
                  — Incident: {selectedRecord.incident_number}
                </span>
              )}
              {selectedRecord?.case_status_name && (
                <span style={{
                  marginLeft: 12, padding: "2px 10px", borderRadius: 12,
                  fontSize: "0.8rem", fontWeight: 700,
                  background: selectedRecord.case_status_name === "Draft" ? "#f1f5f9"
                    : selectedRecord.case_status_name === "Ready to Send" ? "#dcfce7" : "#eff6ff",
                  color: selectedRecord.case_status_name === "Draft" ? "#64748b"
                    : selectedRecord.case_status_name === "Ready to Send" ? "#166534" : "#1e40af",
                  border: `1px solid ${selectedRecord.case_status_name === "Draft" ? "#cbd5e1"
                    : selectedRecord.case_status_name === "Ready to Send" ? "#86efac" : "#bfdbfe"}`,
                }}>
                  {selectedRecord.case_status_name}
                </span>
              )}
            </Typography>
          </Box>
          {selectedRecord?.case_status_name === "Ready to Send" && (
            <Button variant="solid" color="success" size="sm" startDecorator={<SendIcon />}
              onClick={async () => {
                if (!window.confirm("Publish this complaint into the workflow?")) return;
                try { await publishComplaint(id); window.location.reload(); }
                catch (e) { alert(e?.response?.data?.message || "Publish failed"); }
              }}>
              Publish
            </Button>
          )}
        </Box>

        {/* ── Loading ── */}
        {loading && !selectedRecord && (
          <Card sx={{ p: 4, textAlign: "center", background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)" }}>
            <CircularProgress size="lg" sx={{ "--CircularProgress-color": theme.colors.primary }} />
            <Typography level="body-md" sx={{ mt: 2, color: theme.colors.primary, fontWeight: 600 }}>Loading record…</Typography>
          </Card>
        )}

        {/* ── Error ── */}
        {error && (
          <Card sx={{ mb: 2, p: 3, bgcolor: "danger.softBg", border: "2px solid", borderColor: "danger.solidBg" }}>
            <Typography color="danger" level="title-md" sx={{ fontWeight: 700, mb: 1 }}>❌ Validation Error</Typography>
            <Typography color="danger" level="body-sm" sx={{ whiteSpace: "pre-line" }}>{error}</Typography>
          </Card>
        )}

        {/* ── Success ── */}
        {success && (
          <Card sx={{ mb: 2, p: 2, bgcolor: "success.softBg" }}>
            <Typography color="success">✅ {success}</Typography>
          </Card>
        )}

        {/* ── Incomplete-record warning banner ── */}
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

        {/* ── Form (visible once record is loaded) ── */}
        {selectedRecord && !loading && (
          <>
            <Divider sx={{ my: 3 }} />

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
              onRunNER={() => {}}
              nerLoading={false}
              readOnlyPatient={true}
            />

            <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)", border: `1px solid ${theme.colors.primary}1A` }}>
              <Typography level="title-lg" sx={{ fontWeight: 700, p: 2, pb: 0, color: theme.colors.primary }}>
                Case Details
              </Typography>
              <Box sx={{ p: 2 }}>
                <CaseTabContent
                  caseData={cases[0]}
                  caseIndex={0}
                  onChange={(patch) => updateCase(0, patch)}
                  refData={refData}
                  sections={sections}
                  orgUnits={orgUnits}
                  validationErrors={caseValidationErrors[0] || {}}
                />
              </Box>
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

        {/* ── Empty/no data state ── */}
        {!loading && !selectedRecord && (
          <Box sx={{ p: 4, textAlign: "center", borderRadius: "8px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "2px dashed rgba(102, 126, 234, 0.2)" }}>
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
