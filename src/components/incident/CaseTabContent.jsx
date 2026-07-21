// src/components/incident/CaseTabContent.jsx
// Content of a single case tab within the Incident form.
import React, { useState } from "react";
import { Box, Card, Typography, FormControl, FormLabel, Select, Option, Switch, Textarea, Button, Alert } from "@mui/joy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import { useEntitySearch } from "../../hooks/useEntitySearch";
import { searchDoctors, searchEmployees, classifyText, fetchCategories, fetchSubcategories, fetchClassifications } from "../../api/insertRecord";
import { normalizeClassifications } from "../../utils/classificationMappings";

import EntitySearchBox from "./EntitySearchBox";
import SpeechToTextButton from "./SpeechToTextButton";
import OrgUnitSearchSelect from "./OrgUnitSearchSelect";
import ClassificationCascade from "./ClassificationCascade";

const CaseTabContent = ({ caseData, caseIndex, onChange, refData, sections, orgUnits = [], validationErrors = {} }) => {
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyMsg, setClassifyMsg] = useState(null);

  const doctorSearch = useEntitySearch(searchDoctors);
  const employeeSearch = useEntitySearch(searchEmployees);

  const caseIsNotice = !!(refData.feedback_intent_types || []).find(
    (f) => f.id === caseData.feedback_intent_type_id && f.code === "NOTICE"
  );

  function field(key, value) {
    onChange({ [key]: value });
  }

  const err = (k) => validationErrors[k] ? "danger" : "neutral";

  async function runClassify() {
    const text = caseData.complaint_text;
    if (!text || !text.trim()) { setClassifyMsg({ type: "warning", msg: "Enter complaint text first." }); return; }
    try {
      setClassifyLoading(true);
      setClassifyMsg(null);
      const resp = await classifyText(text);
      if (!resp?.success) { setClassifyMsg({ type: "danger", msg: "Classification failed." }); return; }
      const cls = normalizeClassifications(resp.classifications || resp);

      // Cascade: domain → categories → category → subcategories → subcategory → classifications → set all
      let patch = {};
      if (cls.domain_id) {
        patch.domain_id = cls.domain_id;
        patch.category_id = null; patch.subcategory_id = null; patch.classification_id = null;
        patch._categories = []; patch._subcategories = []; patch._classifications = [];
        try {
          const cats = await fetchCategories(cls.domain_id);
          patch._categories = Array.isArray(cats) ? cats : [];
          if (cls.category_id) {
            patch.category_id = cls.category_id;
            const subs = await fetchSubcategories(cls.category_id);
            patch._subcategories = Array.isArray(subs) ? subs : [];
            if (cls.subcategory_id) {
              patch.subcategory_id = cls.subcategory_id;
              const clss = await fetchClassifications(cls.subcategory_id);
              patch._classifications = Array.isArray(clss) ? clss : [];
              if (cls.classification_id) patch.classification_id = cls.classification_id;
            }
          }
        } catch { /* ignore cascade errors */ }
      }
      if (cls.severity_id) patch.severity_id = cls.severity_id;
      if (cls.stage_id) patch.stage_id = cls.stage_id;
      if (cls.harm_id) patch.harm_id = cls.harm_id;
      if (cls.clinical_risk_type_id) patch.clinical_risk_type_id = cls.clinical_risk_type_id;
      onChange(patch);
      setClassifyMsg({ type: "success", msg: "Classification applied." });
      setTimeout(() => setClassifyMsg(null), 3000);
    } catch { setClassifyMsg({ type: "danger", msg: "Classification failed." }); }
    finally { setClassifyLoading(false); }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
      {/* Target Unit */}
      <Card variant="soft" color="primary" sx={{ p: 2 }}>
        <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>Target Unit *</Typography>
        <Typography level="body-xs" sx={{ mb: 1.5, color: "neutral.600" }}>
          Select the Administration, Department, or Section that should handle this case.
        </Typography>
        <FormControl required>
          <OrgUnitSearchSelect
            units={orgUnits}
            value={caseData.target_department_id}
            onChange={(v) => field("target_department_id", v)}
            placeholder="Select target unit..."
            error={!!validationErrors.target_department_id}
          />
          {validationErrors.target_department_id && (
            <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{validationErrors.target_department_id}</Typography>
          )}
        </FormControl>
      </Card>

      {/* Feedback Intent + Morbidity + Doctors + Employees */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end" }}>
        <FormControl required sx={{ flex: 1.5, minWidth: 200 }}>
          <FormLabel sx={{ color: validationErrors.feedback_intent_type_id ? "danger.500" : undefined }}>
            Feedback Intent *
          </FormLabel>
          <Select
            placeholder="Select intent…"
            value={caseData.feedback_intent_type_id ?? null}
            onChange={(_, v) => field("feedback_intent_type_id", v)}
            color={validationErrors.feedback_intent_type_id ? "danger" : "neutral"}
            slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}
          >
            {(refData.feedback_intent_types || []).map((f) => (
              <Option key={f.id} value={f.id} sx={{ color: "#000" }}>{f.name_en || f.name}</Option>
            ))}
          </Select>
          {validationErrors.feedback_intent_type_id && (
            <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>{validationErrors.feedback_intent_type_id}</Typography>
          )}
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 0.5 }}>
          <Switch
            checked={caseData.is_morbidity ?? false}
            onChange={(e) => field("is_morbidity", e.target.checked)}
          />
          <Typography level="body-sm">{caseData.is_morbidity ? "Morbidity" : "No Morbidity"}</Typography>
        </Box>
      </Box>

      {/* Doctors + Employees */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <EntitySearchBox
          label="Doctor(s)"
          placeholder="Search doctor…"
          query={doctorSearch.query}
          results={doctorSearch.results}
          loading={doctorSearch.loading}
          onQueryChange={(q) => doctorSearch.search(q)}
          onSelect={(d) => {
            const already = (caseData.doctors || []).some((x) => x.doctor_id === d.doctor_id);
            if (!already) {
              field("doctors", [...(caseData.doctors || []), { doctor_id: d.doctor_id, doctor_name: d.name || d.doctor_name || "" }]);
            }
            doctorSearch.search("");
          }}
          renderOption={(d) => <Typography level="body-sm">{d.name || d.doctor_name}</Typography>}
          selectedItems={(caseData.doctors || []).map((d) => ({ label: d.doctor_name }))}
          onRemove={(i) => field("doctors", (caseData.doctors || []).filter((_, idx) => idx !== i))}
        />
        <EntitySearchBox
          label="Employee(s)"
          placeholder="Search employee…"
          query={employeeSearch.query}
          results={employeeSearch.results}
          loading={employeeSearch.loading}
          onQueryChange={(q) => employeeSearch.search(q)}
          onSelect={(emp) => {
            const already = (caseData.employees || []).some((x) => x.employee_id === emp.employee_id);
            if (!already) {
              field("employees", [...(caseData.employees || []), { employee_id: emp.employee_id, full_name: emp.full_name || emp.name || "", employee_name: emp.full_name || emp.name || "" }]);
            }
            employeeSearch.search("");
          }}
          renderOption={(e) => <Typography level="body-sm">{e.full_name || e.name}</Typography>}
          selectedItems={(caseData.employees || []).map((e) => ({ label: e.full_name || e.employee_name }))}
          onRemove={(i) => field("employees", (caseData.employees || []).filter((_, idx) => idx !== i))}
        />
      </Box>

      {/* Case-specific text */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <FormControl required>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <FormLabel sx={{ color: validationErrors.complaint_text ? "danger.500" : undefined, mb: 0 }}>
              {caseIsNotice ? "Notice Description *" : "Complaint / Feedback Description *"}
            </FormLabel>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <SpeechToTextButton onTranscription={(t) => field("complaint_text", (caseData.complaint_text ? caseData.complaint_text + " " : "") + t)} />
              <Button
                size="sm"
                variant="soft"
                color="primary"
                startDecorator={<AutoFixHighIcon />}
                loading={classifyLoading}
                onClick={runClassify}
                disabled={!caseData.complaint_text?.trim() || caseIsNotice}
              >
                Extract & Classify
              </Button>
            </Box>
          </Box>
          {classifyMsg && <Alert color={classifyMsg.type} size="sm" sx={{ mb: 0.5 }}>{classifyMsg.msg}</Alert>}
          <Textarea
            minRows={3}
            placeholder={caseIsNotice ? "Describe the notice…" : "Describe this specific case…"}
            value={caseData.complaint_text}
            onChange={(e) => field("complaint_text", e.target.value)}
            color={err("complaint_text")}
          />
        </FormControl>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <FormControl required sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <FormLabel sx={{ color: validationErrors.immediate_action ? "danger.500" : undefined, mb: 0 }}>Immediate Action *</FormLabel>
              <SpeechToTextButton onTranscription={(t) => field("immediate_action", (caseData.immediate_action ? caseData.immediate_action + " " : "") + t)} />
            </Box>
            <Textarea minRows={2} placeholder="Immediate actions taken…" value={caseData.immediate_action} onChange={(e) => field("immediate_action", e.target.value)} color={err("immediate_action")} disabled={caseIsNotice} />
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <FormLabel sx={{ mb: 0 }}>Action Given by Section</FormLabel>
              <SpeechToTextButton onTranscription={(t) => field("taken_action", (caseData.taken_action ? caseData.taken_action + " " : "") + t)} />
            </Box>
            <Textarea minRows={2} placeholder="Action given by the section…" value={caseData.taken_action} onChange={(e) => field("taken_action", e.target.value)} disabled={caseIsNotice} />
          </FormControl>
        </Box>
      </Box>

      {/* Classification */}
      <Box>
        <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>Classification *</Typography>
        <ClassificationCascade
          caseData={caseData}
          onChange={onChange}
          refData={refData}
          validationErrors={validationErrors}
          disabled={caseIsNotice}
        />
      </Box>

      {/* Severity / Stage / Harm / Clinical Risk */}
      <Box>
        <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>Risk & Severity *</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <FormControl required sx={{ flex: 1, minWidth: 140 }}>
            <FormLabel sx={{ color: validationErrors.severity_id ? "danger.500" : undefined }}>Severity</FormLabel>
            <Select placeholder="Severity" value={caseData.severity_id ?? null} onChange={(_, v) => field("severity_id", v)} color={err("severity_id")}
              disabled={caseIsNotice} slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}>
              {refData.severity.map((s) => <Option key={s.id} value={s.id} sx={{ color: "#000" }}>{s.name || s.name_en}</Option>)}
            </Select>
          </FormControl>
          <FormControl required sx={{ flex: 1, minWidth: 140 }}>
            <FormLabel sx={{ color: validationErrors.stage_id ? "danger.500" : undefined }}>Care Stage</FormLabel>
            <Select placeholder="Stage" value={caseData.stage_id ?? null} onChange={(_, v) => field("stage_id", v)} color={err("stage_id")}
              disabled={caseIsNotice} slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}>
              {refData.stages.map((s) => <Option key={s.id} value={s.id} sx={{ color: "#000" }}>{s.name || s.name_en}</Option>)}
            </Select>
          </FormControl>
          <FormControl required sx={{ flex: 1, minWidth: 140 }}>
            <FormLabel sx={{ color: validationErrors.harm_id ? "danger.500" : undefined }}>Harm Level</FormLabel>
            <Select placeholder="Harm" value={caseData.harm_id ?? null} onChange={(_, v) => field("harm_id", v)} color={err("harm_id")}
              disabled={caseIsNotice} slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}>
              {refData.harm.map((h) => <Option key={h.id} value={h.id} sx={{ color: "#000" }}>{h.name || h.name_en}</Option>)}
            </Select>
          </FormControl>
          <FormControl required sx={{ flex: 1, minWidth: 160 }}>
            <FormLabel>Clinical Risk Type</FormLabel>
            <Select value={caseData.clinical_risk_type_id ?? 1} onChange={(_, v) => field("clinical_risk_type_id", v)}
              disabled={caseIsNotice} slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}>
              {(refData.clinical_risk_types || []).map((r) => <Option key={r.id} value={r.id} sx={{ color: "#000" }}>{r.name || r.name_en}</Option>)}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
};

export default CaseTabContent;
