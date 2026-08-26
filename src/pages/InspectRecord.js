// src/pages/InspectRecord.js
// Read-only view of an entire incident — every case tab's base fields (same
// data EditRecord.js edits) plus workflow responses, HCAT decision, action
// items, and satisfaction (which EditRecord.js never shows). Built directly
// from EditRecord.js's own shell/styling so the two pages match exactly —
// every Card/Tabs/spacing value below is copied from EditRecord.js,
// IncidentMetadataSection.jsx, and CaseTabContent.jsx, not re-typed from
// memory. Where the content differs (plain text instead of form widgets, an
// extra Workflow & Outcomes section, a single Back button instead of
// Update/Reset/Cancel) that difference is real — Inspect has more content,
// no editing, different buttons where the action actually differs.
// URL: /inspect/:incidentId  (the real APP_Incident.incident_id)
import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, Divider, CircularProgress, Card, Button,
  Chip, FormControl, FormLabel, Tabs, TabList, Tab, TabPanel,
} from "@mui/joy";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import theme from "../theme";

import MainLayout from "../components/common/MainLayout";
import { getRecordById } from "../api/complaints";
import { getIncidentResponses } from "../api/workflowApi";
import { getCaseSatisfaction } from "../api/satisfactionApi";
import { statusBadgeStyle } from "../utils/caseStatusBadge";
import { WORKFLOW_STATUS_LABELS } from "../utils/workflowStatusLabels";
import { canEditRecord } from "../utils/roleGuards";
import { useAuth } from "../context/AuthContext";

const InspectRecord = () => {
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [cases, setCases] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load: getIncidentResponses() is the authorization boundary (per-case
  // scope filtering already lives there — see workflow_router.py). Only
  // cases it returns get their full record fetched, so a viewer never sees
  // details for a case outside their scope. ──
  useEffect(() => {
    if (!incidentId) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const responses = await getIncidentResponses(incidentId);

        const merged = await Promise.all(
          responses.cases.map(async (workflowCase) => {
            const [recRes, satisfaction] = await Promise.all([
              getRecordById(workflowCase.caseId),
              getCaseSatisfaction(workflowCase.caseId).catch(() => null),
            ]);
            const record = recRes.record;
            record.case_status_name = record.case_status_name || record.status_name || null;
            return {
              ...workflowCase,
              record,
              satisfaction: satisfaction?.exists === false ? null : satisfaction,
            };
          })
        );

        setCases(merged);

        const requestedCaseId = searchParams.get("case");
        const tabIdx = requestedCaseId
          ? merged.findIndex((c) => String(c.caseId) === requestedCaseId)
          : -1;
        setActiveTab(tabIdx >= 0 ? tabIdx : 0);
      } catch (e) {
        setError(`Failed to load record: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  const canEdit = canEditRecord(user);

  // ── Tab label — target unit name (already resolved by getIncidentResponses) ──
  const tabLabel = (c, i) => c.targetOrgUnitName || `Case ${i + 1}`;

  const primaryRecord = cases[0]?.record || null;

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>

        {/* ── Header ── */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography level="h2" sx={{ fontWeight: 800, background: theme.gradients.primary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              🔎 Inspect Incident
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666", mt: 0.5 }}>
              {primaryRecord?.incident_number && (
                <span style={{ color: "#1F6F73", fontWeight: 700 }}>
                  {primaryRecord.incident_number}
                </span>
              )}
              {primaryRecord?.incident_number && cases.length > 0 && (
                <span style={{ marginLeft: 10, color: "#888" }}>
                  — {cases.length} case{cases.length !== 1 ? "s" : ""}
                </span>
              )}
            </Typography>
          </Box>
        </Box>

        {/* ── Loading ── */}
        {loading && !primaryRecord && (
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

        {/* ── Content ── */}
        {primaryRecord && !loading && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* Incident-level shared fields — same Card as IncidentMetadataSection */}
            <Card sx={{ mb: 3, p: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)", border: `1px solid ${theme.colors.primary}1A` }}>
              <Typography level="title-lg" sx={{ fontWeight: 700, mb: 2, color: theme.colors.primary }}>
                Incident Information (Shared Across All Cases)
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1, minWidth: 160 }}>
                  <FormLabel>Incident Date</FormLabel>
                  <Typography level="body-md">{primaryRecord.incident_date || "—"}</Typography>
                </FormControl>
                <FormControl sx={{ flex: 1, minWidth: 160 }}>
                  <FormLabel>Received Date</FormLabel>
                  <Typography level="body-md">{primaryRecord.received_date || "—"}</Typography>
                </FormControl>
                <FormControl sx={{ flex: 1.5, minWidth: 200 }}>
                  <FormLabel>Issuing Unit</FormLabel>
                  <Typography level="body-md">{primaryRecord.issuing_org_unit_name || "—"}</Typography>
                </FormControl>
                <FormControl sx={{ flex: 1, minWidth: 140 }}>
                  <FormLabel>Source</FormLabel>
                  <Typography level="body-md">{primaryRecord.source_name || "—"}</Typography>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1, minWidth: 140 }}>
                  <FormLabel>Building</FormLabel>
                  <Typography level="body-md">{primaryRecord.building_name || "—"}</Typography>
                </FormControl>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 3 }}>
                  <Typography level="body-sm">{primaryRecord.is_inpatient ? "Inpatient (داخلي)" : "Outpatient (خارجي)"}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Patient Name</FormLabel>
                  <Typography level="body-md" fontWeight={600}>{primaryRecord.patient_name || "—"}</Typography>
                </FormControl>
              </Box>

              <FormControl>
                <FormLabel>Complaint Summary <Typography component="span" level="body-xs" sx={{ color: "neutral.500", fontWeight: 400 }}>(Optional)</Typography></FormLabel>
                <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{primaryRecord.incident_summary || "—"}</Typography>
                <Typography level="body-xs" sx={{ color: "#888", mt: 0.5 }}>
                  Each case below has its own complaint text. This is the high-level summary for the incident record.
                </Typography>
              </FormControl>
            </Card>

            {/* Cases card with tabs — same Card as EditRecord's Cases wrapper */}
            <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)", border: `1px solid ${theme.colors.primary}1A` }}>
              <Box sx={{ p: 2, pb: 0 }}>
                <Typography level="title-lg" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                  Cases — One per Target Unit
                </Typography>
              </Box>
              <Typography level="body-xs" sx={{ px: 2, pb: 1, color: "#888" }}>
                Each tab is one case targeting exactly one organizational unit — read-only.
              </Typography>

              {cases.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography level="body-sm" sx={{ color: "#999" }}>No cases in scope for this incident.</Typography>
                </Box>
              ) : (
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  sx={{ borderTop: "1px solid", borderColor: "divider" }}
                >
                  <TabList sx={{ overflowX: "auto", flexShrink: 0 }}>
                    {cases.map((c, i) => {
                      const badge = statusBadgeStyle(c.record.case_status_name);
                      return (
                        <Tab key={c.caseId} value={i} sx={{ minWidth: 150, position: "relative" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "nowrap" }}>
                            <Typography level="body-sm" noWrap sx={{ maxWidth: 130 }}>
                              {tabLabel(c, i)}
                            </Typography>
                            {c.record.case_status_name && (
                              <Box sx={{
                                px: 0.8, py: 0.2, borderRadius: 10, fontSize: "0.68rem", fontWeight: 700,
                                bgcolor: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                                whiteSpace: "nowrap",
                              }}>
                                {c.record.case_status_name}
                              </Box>
                            )}
                          </Box>
                        </Tab>
                      );
                    })}
                  </TabList>

                  {cases.map((c, i) => (
                    <TabPanel key={c.caseId} value={i} sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>

                        {/* Workflow status + Edit link */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                          <Chip size="sm" variant="soft" color="neutral">
                            {c.status ? (WORKFLOW_STATUS_LABELS[c.status] || c.status) : "Not published"}
                          </Chip>
                          {canEdit && c.subcaseId && (
                            <Button size="sm" variant="soft" color="primary" onClick={() => navigate(`/manual-fill/${c.subcaseId}`)}>
                              Edit
                            </Button>
                          )}
                        </Box>

                        {/* Target Unit */}
                        <Card variant="soft" color="primary" sx={{ p: 2 }}>
                          <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>Target Unit</Typography>
                          <Typography level="body-md" fontWeight={600}>{c.targetOrgUnitName || "—"}</Typography>
                        </Card>

                        {/* Feedback Intent + Morbidity */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end" }}>
                          <FormControl sx={{ flex: 1.5, minWidth: 200 }}>
                            <FormLabel>Feedback Intent</FormLabel>
                            <Typography level="body-md">{c.record.feedback_intent_type_name || "—"}</Typography>
                          </FormControl>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 0.5 }}>
                            <Typography level="body-sm">{c.record.is_morbidity ? "Morbidity" : "No Morbidity"}</Typography>
                          </Box>
                        </Box>

                        {/* Doctors + Employees */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                          <FormControl sx={{ flex: 1, minWidth: 200 }}>
                            <FormLabel>Doctor(s)</FormLabel>
                            <Typography level="body-md">
                              {(c.record.doctors || []).map((d) => d.doctor_name || d.name).filter(Boolean).join(", ") || "—"}
                            </Typography>
                          </FormControl>
                          <FormControl sx={{ flex: 1, minWidth: 200 }}>
                            <FormLabel>Employee(s)</FormLabel>
                            <Typography level="body-md">
                              {(c.record.employees || []).map((e) => e.full_name || e.name).filter(Boolean).join(", ") || "—"}
                            </Typography>
                          </FormControl>
                        </Box>

                        {/* Case-specific text */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          <FormControl>
                            <FormLabel>Complaint / Feedback Description</FormLabel>
                            <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{c.record.complaint_text || "—"}</Typography>
                          </FormControl>
                          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                            <FormControl sx={{ flex: 1, minWidth: 200 }}>
                              <FormLabel>Immediate Action</FormLabel>
                              <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{c.record.immediate_action || "—"}</Typography>
                            </FormControl>
                            <FormControl sx={{ flex: 1, minWidth: 200 }}>
                              <FormLabel>Action Given by Section</FormLabel>
                              <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{c.record.taken_action || "—"}</Typography>
                            </FormControl>
                          </Box>
                        </Box>

                        {/* Classification */}
                        <Box>
                          <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>Classification</Typography>
                          <Typography level="body-md">
                            {[c.record.domain_name, c.record.category_name, c.record.subcategory_name, c.record.classification_name]
                              .filter(Boolean).join(" / ") || "—"}
                          </Typography>
                        </Box>

                        {/* Severity / Stage / Harm / Clinical Risk */}
                        <Box>
                          <Typography level="title-sm" sx={{ mb: 1, fontWeight: 700 }}>Risk &amp; Severity</Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                            <FormControl sx={{ flex: 1, minWidth: 140 }}>
                              <FormLabel>Severity</FormLabel>
                              <Typography level="body-md">{c.record.severity_name || "—"}</Typography>
                            </FormControl>
                            <FormControl sx={{ flex: 1, minWidth: 140 }}>
                              <FormLabel>Care Stage</FormLabel>
                              <Typography level="body-md">{c.record.stage_name || "—"}</Typography>
                            </FormControl>
                            <FormControl sx={{ flex: 1, minWidth: 140 }}>
                              <FormLabel>Harm Level</FormLabel>
                              <Typography level="body-md">{c.record.harm_level || "—"}</Typography>
                            </FormControl>
                            <FormControl sx={{ flex: 1, minWidth: 160 }}>
                              <FormLabel>Clinical Risk Type</FormLabel>
                              <Typography level="body-md">{c.record.clinical_risk_type_name || "—"}</Typography>
                            </FormControl>
                          </Box>
                        </Box>

                        {/* ── Workflow & Outcomes — new content Edit doesn't have,
                             styled with the same design language as everything above ── */}
                        <Divider sx={{ my: 2 }}>
                          <Typography level="body-xs" sx={{ fontWeight: 700, color: theme.colors.primary, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Workflow &amp; Outcomes
                          </Typography>
                        </Divider>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <FormControl>
                            <FormLabel>Section Response</FormLabel>
                            <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{c.sectionExplanation || "—"}</Typography>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Department Response</FormLabel>
                            <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{c.departmentExplanation || "—"}</Typography>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Administration Response</FormLabel>
                            <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{c.administrationExplanation || "—"}</Typography>
                          </FormControl>
                          <FormControl>
                            <FormLabel>HCAT Decision (Patient Services)</FormLabel>
                            <Typography level="body-md" sx={{ whiteSpace: "pre-wrap" }}>{c.patientServicesDecision || "—"}</Typography>
                          </FormControl>
                        </Box>

                        <Box>
                          <Typography level="title-sm" sx={{ fontWeight: 700, mb: 1 }}>
                            Action Items {c.actionItems.length > 0 && `(${c.actionItems.length})`}
                          </Typography>
                          {c.actionItems.length === 0 ? (
                            <Typography level="body-md" sx={{ color: "#999" }}>None recorded.</Typography>
                          ) : (
                            <Box>
                              {c.actionItems.map((item, idx) => (
                                <Box key={idx} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                                  <Chip size="sm" variant="soft" color="neutral">{item.status || "—"}</Chip>
                                  <Box>
                                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                                    {item.description && <Typography level="body-xs" sx={{ color: "#666" }}>{item.description}</Typography>}
                                    {item.dueDate && <Typography level="body-xs" sx={{ color: "#999" }}>Due: {item.dueDate}</Typography>}
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>

                        <Box>
                          <Typography level="title-sm" sx={{ fontWeight: 700, mb: 1 }}>Satisfaction</Typography>
                          {c.satisfaction ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                              <Chip size="sm" variant="soft" color={c.satisfaction.satisfaction_status_name_en === "Satisfied" ? "success" : "neutral"}>
                                {c.satisfaction.satisfaction_status_name_en}
                              </Chip>
                              {c.satisfaction.feedback_datetime && (
                                <Typography level="body-xs" sx={{ color: "#999" }}>Follow-up: {c.satisfaction.feedback_datetime}</Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography level="body-md" sx={{ color: "#999" }}>Not recorded.</Typography>
                          )}
                        </Box>
                      </Box>
                    </TabPanel>
                  ))}
                </Tabs>
              )}
            </Card>

            {/* ── Bottom bar — same container as EditActionButtons, single Back button ── */}
            <Box sx={{
              p: 3, borderRadius: "8px", background: "#2e7d32",
              display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", alignItems: "center",
            }}>
              <Button
                size="lg"
                variant="solid"
                startDecorator={<CancelIcon />}
                onClick={() => navigate("/table-view")}
                sx={{
                  flex: 1, minWidth: "150px", fontWeight: 700,
                  backgroundColor: "#546e7a", color: "white",
                  "&:hover": { backgroundColor: "#455a64" },
                }}
              >
                Back to Table View
              </Button>
            </Box>
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && !primaryRecord && !error && (
          <Box sx={{
            p: 4, textAlign: "center", borderRadius: "8px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "2px dashed rgba(102, 126, 234, 0.2)",
          }}>
            <Typography level="h3" sx={{ color: "#667eea", mb: 1 }}>🔍 No Data</Typography>
            <Typography level="body-sm" sx={{ color: "#999" }}>No record data available</Typography>
          </Box>
        )}

      </Container>
    </MainLayout>
  );
};

export default InspectRecord;
