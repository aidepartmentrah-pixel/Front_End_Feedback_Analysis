// src/components/incident/IncidentMetadataSection.jsx
// Shared "Incident Information" card: date, issuing section, source, building,
// inpatient toggle, patient search, complaint summary. Shared across all cases.
import React from "react";
import { Box, Card, Typography, Divider, FormControl, FormLabel, Input, Select, Option, Switch, Textarea } from "@mui/joy";
import theme from "../../theme";
import SectionSearchSelect from "./SectionSearchSelect";
import EntitySearchBox from "./EntitySearchBox";

const IncidentMetadataSection = ({
  incident,
  onFieldChange,
  refData,
  sections,
  validationErrors = {},
  patientSearch,
  patientConfirmed,
  onPatientConfirmedChange,
  onAddNewPatient,
  readOnlyPatient = false,
}) => {
  return (
    <Card sx={{ mb: 3, p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)", border: `1px solid ${theme.colors.primary}1A` }}>
      <Typography level="title-lg" sx={{ fontWeight: 700, mb: 2, color: theme.colors.primary }}>
        Incident Information (Shared Across All Cases)
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Row 1: incident date + received date + issuing dept + source */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <FormControl required sx={{ flex: 1, minWidth: 160 }}>
          <FormLabel sx={{ color: validationErrors.incident_date ? "danger.500" : undefined }}>Incident Date *</FormLabel>
          <Input
            type="date"
            value={incident.incident_date}
            onChange={(e) => onFieldChange("incident_date", e.target.value)}
            color={validationErrors.incident_date ? "danger" : "neutral"}
            slotProps={{ input: { lang: "en-GB" } }}
          />
        </FormControl>

        <FormControl required sx={{ flex: 1, minWidth: 160 }}>
          <FormLabel sx={{ color: validationErrors.feedback_received_date ? "danger.500" : undefined }}>Received Date *</FormLabel>
          <Input
            type="date"
            value={incident.feedback_received_date}
            onChange={(e) => onFieldChange("feedback_received_date", e.target.value)}
            color={validationErrors.feedback_received_date ? "danger" : "neutral"}
            slotProps={{ input: { lang: "en-GB" } }}
          />
        </FormControl>

        <FormControl required sx={{ flex: 1.5, minWidth: 200 }}>
          <FormLabel sx={{ color: validationErrors.issuing_department_id ? "danger.500" : undefined }}>Issuing Section *</FormLabel>
          <SectionSearchSelect
            sections={sections}
            value={incident.issuing_department_id}
            onChange={(v) => onFieldChange("issuing_department_id", v)}
            placeholder="Select issuing section…"
            error={!!validationErrors.issuing_department_id}
          />
        </FormControl>

        <FormControl required sx={{ flex: 1, minWidth: 140 }}>
          <FormLabel sx={{ color: validationErrors.source_id ? "danger.500" : undefined }}>Source *</FormLabel>
          <Select
            placeholder="Source…"
            value={incident.source_id ?? null}
            onChange={(_, v) => onFieldChange("source_id", v)}
            color={validationErrors.source_id ? "danger" : "neutral"}
            slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}
          >
            {refData.sources.map((s) => <Option key={s.id} value={s.id} sx={{ color: "#000" }}>{s.name || s.name_en}</Option>)}
          </Select>
        </FormControl>
      </Box>

      {/* Row 2: building + inpatient */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <FormControl required sx={{ flex: 1, minWidth: 140 }}>
          <FormLabel sx={{ color: validationErrors.building_id ? "danger.500" : undefined }}>Building *</FormLabel>
          <Select
            placeholder="Select building…"
            value={incident.building_id ?? null}
            onChange={(_, v) => onFieldChange("building_id", v)}
            color={validationErrors.building_id ? "danger" : "neutral"}
            slotProps={{ listbox: { sx: { zIndex: 1300, bgcolor: "#fff" } } }}
          >
            {(refData.buildings || []).map((b) => <Option key={b.id} value={b.id} sx={{ color: "#000" }}>{b.name_en || b.name || b.code}</Option>)}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 3 }}>
          <Switch
            checked={incident.is_inpatient}
            onChange={(e) => onFieldChange("is_inpatient", e.target.checked)}
          />
          <Typography level="body-sm">{incident.is_inpatient ? "Inpatient (داخلي)" : "Outpatient (خارجي)"}</Typography>
        </Box>
      </Box>

      {/* Row 3: Patient / Doctor / Employee search */}
      <Divider sx={{ my: 2 }} />
      {!readOnlyPatient && (
        <Box sx={{ mb: 1.5 }}>
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>Entities</Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        {readOnlyPatient ? (
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Patient Name</FormLabel>
            <Typography level="body-md" fontWeight={600}>{incident.patient_name || "—"}</Typography>
          </FormControl>
        ) : (
          <EntitySearchBox
            label="Patient Name *"
            placeholder={patientConfirmed ? "Selected — click × to change" : "Search patient…"}
            query={patientConfirmed ? "" : patientSearch.query}
            results={patientConfirmed ? [] : patientSearch.results}
            loading={patientSearch.loading}
            helperMessage={patientConfirmed ? null : patientSearch.message}
            searched={patientConfirmed ? true : patientSearch.searched}
            onQueryChange={(q) => {
              if (patientConfirmed) return; // locked while a patient is confirmed
              patientSearch.search(q);
              onFieldChange("patient_name", q);
            }}
            onSelect={(p) => {
              const name = p.full_name || p.name || p.patient_name || "";
              onFieldChange("patient_name", name);
              patientSearch.setQuery("");
              patientSearch.setResults([]);
              onPatientConfirmedChange(true);
            }}
            renderOption={(p) => (
              <Box>
                <Typography level="body-sm" fontWeight={600}>{p.full_name || p.name}</Typography>
                {p.document_number && <Typography level="body-xs" sx={{ color: "#888" }}>{p.document_number}</Typography>}
              </Box>
            )}
            selectedItems={patientConfirmed && incident.patient_name ? [{ label: incident.patient_name }] : []}
            onRemove={() => {
              onFieldChange("patient_name", "");
              onPatientConfirmedChange(false);
              patientSearch.search("");
            }}
            onAddNew={onAddNewPatient}
          />
        )}
      </Box>

      {/* Complaint summary — optional */}
      <FormControl>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <FormLabel>Complaint Summary <Typography component="span" level="body-xs" sx={{ color: "neutral.500", fontWeight: 400 }}>(Optional)</Typography></FormLabel>
        </Box>
        <Textarea
          minRows={3}
          placeholder="Enter the general complaint/feedback summary shared across all cases…"
          value={incident.complaint_summary}
          onChange={(e) => onFieldChange("complaint_summary", e.target.value)}
        />
        <Typography level="body-xs" sx={{ color: "#888", mt: 0.5 }}>
          Each case below has its own complaint text. This is the high-level summary for the incident record.
        </Typography>
      </FormControl>
    </Card>
  );
};

export default IncidentMetadataSection;
