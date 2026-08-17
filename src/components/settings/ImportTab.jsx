import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Alert, Card, CardContent,
  CircularProgress, Table, Chip,
} from "@mui/joy";

import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import FlagIcon from "@mui/icons-material/Flag";
import FolderIcon from "@mui/icons-material/Folder";
import RefreshIcon from "@mui/icons-material/Refresh";
import RateReviewIcon from "@mui/icons-material/RateReview";

import theme from "../../theme";
import ImportReviewGrid from "./ImportReviewGrid";

const BASE = "";  // same-origin via proxy

// Review-screen status -> {label, color, bucket}. Everything the backend
// calls "red" is actually a fixable field error (missing/invalid Severity,
// unrecognized doctor, etc.) -- editable right here in the grid, not a
// structural failure. Calling that "Rejected" reads far more alarming than
// it is, so it gets its own "Need Attention" bucket (amber, not danger-red);
// "Rejected" is reserved for what actually can't be fixed by editing --
// a duplicate of an already-imported group. green/yellow (both fully valid,
// yellow just flags a new-patient heads-up) bucket together as "Ready".
const STATUS_META = {
  green: { label: "Ready", color: "success", bucket: "ready" },
  yellow: { label: "New Patient", color: "success", bucket: "ready" },
  red: { label: "Need Attention", color: "warning", bucket: "need_attention" },
  duplicate: { label: "Rejected", color: "danger", bucket: "rejected" },
};

// Case, Incident, and Closed stay in English inside the Arabic text on
// purpose -- staff were trained on the app using these English terms.
const INSTRUCTIONS_AR = [
  "كل صف في الملف يمثل Case واحد وليس Incident. الصفوف التي لها نفس رقم \"الرقم\" (Incident Number في النظام القديم) تُدمج معًا تحت Incident واحد.",
  "بعد الرفع، ستظهر لك معاينة لكل مجموعة قبل الحفظ الفعلي — لا شيء يُحفظ في النظام إلا بعد الضغط على «إضافة».",
  "المجموعات الجاهزة تظهر باللون الأخضر، والمريض الجديد بالأصفر، والمرفوضة بالأحمر مع سبب واضح، والمكرّرة بلون مختلف.",
  "إذا رُفضت مجموعة، صحّح ملف الإكسل وأعد رفع الملف كاملاً — لا حاجة لحذف الصفوف التي نجحت سابقًا، فالنظام يتجاهلها تلقائيًا.",
  "جميع الـ Cases المستوردة تدخل النظام بحالة Closed مباشرة، ولا تمر عبر نظام الرسائل أو صندوق الوارد.",
];

export default function ImportTab() {
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [preview, setPreview] = useState(null);   // stage_upload result (not yet committed)
  const [report, setReport] = useState(null);      // confirm_import result (final)
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [resumingBatchId, setResumingBatchId] = useState(null);
  const fileRef = useRef(null);
  const reviewRef = useRef(null);

  const loadHistory = useCallback(async () => {
    try {
      const resp = await fetch(`${BASE}/api/import/batches`, { credentials: "include" });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.detail || "Failed to load batch history");
      setHistory(data);
      setHistoryError(null);
    } catch (e) {
      setHistoryError(e.message);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDownloadPastReport = (batchId) => {
    window.open(`${BASE}/api/import/${batchId}/report`, "_blank");
  };

  // ---- Resume reviewing a batch left PendingReview (e.g. after a refresh
  // lost the in-browser preview) ----
  const handleResumeReview = async (batchId) => {
    setResumingBatchId(batchId);
    setError(null);
    setReport(null);
    try {
      const resp = await fetch(`${BASE}/api/import/${batchId}/preview`, { credentials: "include" });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail || "Failed to resume review.");
        return;
      }
      setPreview(data);
      setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setResumingBatchId(null);
    }
  };

  // ---- Download template ----
  const handleDownloadTemplate = async () => {
    try {
      const resp = await fetch(`${BASE}/api/import/template`, { credentials: "include" });
      if (!resp.ok) throw new Error("Template download failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Failed to download template: " + e.message);
    }
  };

  // ---- Upload file (stage only — nothing committed yet) ----
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      setError("Only .xlsx files are accepted.");
      return;
    }

    setUploading(true);
    setError(null);
    setReport(null);
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch(`${BASE}/api/import/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail || "Upload failed.");
        return;
      }
      if (!data.import_batch_id) {
        // Blocked before staging (e.g. duplicate file, empty file) — the
        // reason is in warnings[0].message (see import_service._empty_report).
        setError(data?.warnings?.[0]?.message || "Upload could not be staged.");
        return;
      }
      setPreview(data);
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ---- Confirm staged upload (actually commits) ----
  const handleConfirm = async () => {
    if (!preview?.import_batch_id) return;
    setConfirming(true);
    setError(null);
    try {
      const resp = await fetch(`${BASE}/api/import/${preview.import_batch_id}/confirm`, {
        method: "POST",
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail || "Confirmation failed.");
        return;
      }
      setReport(data);
      setPreview(null);
      loadHistory();
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleDiscardBatch = async () => {
    if (!preview?.import_batch_id) return;
    setDiscarding(true);
    setError(null);
    try {
      const resp = await fetch(`${BASE}/api/import/${preview.import_batch_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.detail || "Failed to discard batch.");
        return;
      }
      setPreview(null);
      loadHistory();
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setDiscarding(false);
    }
  };

  const handleStartOver = () => {
    setPreview(null);
    setReport(null);
    setError(null);
  };

  // ---- Download rejected Excel ----
  const handleDownloadRejected = () => {
    if (!report?.rejected_excel_b64) return;
    const binary = atob(report.rejected_excel_b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rejected_groups.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = report?.summary;
  const committableCount = preview?.groups?.filter(g => g.status === "green" || g.status === "yellow").length || 0;

  const reviewSummary = preview ? {
    ready: preview.groups.filter(g => STATUS_META[g.status]?.bucket === "ready").length,
    needAttention: preview.groups.filter(g => STATUS_META[g.status]?.bucket === "need_attention").length,
    rejected: preview.groups.filter(g => STATUS_META[g.status]?.bucket === "rejected").length,
    totalRows: preview.total_rows,
  } : null;

  return (
    <Box sx={{ width: "100%", maxWidth: 1600, mx: "auto", fontFamily: theme.settings.fontFamily }}>{/* centered, stretches with the viewport instead of pinning to a fixed left-aligned width */}
      {/* Header */}
      <Typography level="h3" fontWeight={700} sx={{ mb: 0.5, fontFamily: theme.settings.fontFamily, color: theme.settings.headerColor }}>
        Data Import
      </Typography>
      <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2, fontFamily: theme.settings.fontFamily }}>
        Import complaint data from Excel into the workflow system. Download the template,
        fill it in, upload it, review what will happen, then confirm.
      </Typography>

      {/* Arabic instructions panel */}
      <Card variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.600", px: 2, py: 1.25 }}>
          <Typography level="title-sm" fontWeight={700} sx={{ color: "#fff", direction: "rtl", textAlign: "right" }}>
            تعليمات الاستخدام
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
          {INSTRUCTIONS_AR.map((line, i) => (
            <Box key={i} sx={{ display: "flex", flexDirection: "row-reverse", alignItems: "flex-start", gap: 1.25 }}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: 24, height: 24, borderRadius: "50%",
                  bgcolor: "primary.500", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "sm", fontWeight: 700,
                }}
              >
                {i + 1}
              </Box>
              <Typography level="body-sm" sx={{ direction: "rtl", textAlign: "right", flex: 1 }}>
                {line}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {error && (
        <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step 1 — Template */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography level="title-md" fontWeight={700} sx={{ mb: 1 }}>
            Step 1 — Download Template
          </Typography>
          <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2 }}>
            The template is generated live with current database dropdown values, including
            doctors/workers/departments. If it's been a while since your last download,
            get a fresh copy so the dropdowns are up to date.
          </Typography>
          <Button
            variant="solid"
            color="primary"
            onClick={handleDownloadTemplate}
            startDecorator={<DownloadIcon />}
          >
            Download Import Template (.xlsx)
          </Button>
        </CardContent>
      </Card>

      {/* Step 2 — Upload */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography level="title-md" fontWeight={700} sx={{ mb: 1 }}>
            Step 2 — Upload Filled Template
          </Typography>
          <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2 }}>
            Only <strong>.xlsx</strong> files are accepted. Nothing is saved yet — you'll get a
            preview to review first, grouped by Incident Number (الرقم).
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              component="label"
              disabled={uploading}
              loading={uploading}
              startDecorator={<UploadFileIcon />}
            >
              {uploading ? "Checking..." : "Choose & Upload File"}
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx"
                style={{ display: "none" }}
                onChange={handleUpload}
              />
            </Button>
            {uploading && (
              <Typography level="body-sm" sx={{ color: theme.colors.textTertiary }}>
                Parsing and validating...
              </Typography>
            )}
            {(preview || report) && !uploading && (
              <Button size="sm" variant="plain" color="neutral" onClick={handleStartOver}>
                Start over
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Step 3 — Review (preview, not yet committed) */}
      {preview && (
        <Card variant="outlined" sx={{ mb: 3 }} ref={reviewRef}>
          <CardContent>
            <Typography level="title-md" fontWeight={700} sx={{ mb: 1 }}>
              Step 3 — Review Before Importing
            </Typography>
            <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 2 }}>
              {preview.groups?.length || 0} incidents found and grouped by Incident Number (الرقم).
              Nothing is saved until you confirm. Click Review on any incident to fix issues in
              place — text and dates edit directly, doctor/worker search the live directory,
              other lookups pick from the current list.
            </Typography>

            {reviewSummary && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1.5, mb: 2.5 }}>
                {[
                  { label: "Ready", value: reviewSummary.ready, color: "success" },
                  { label: "Need Attention", value: reviewSummary.needAttention, color: "warning" },
                  { label: "Rejected", value: reviewSummary.rejected, color: "danger" },
                  { label: "Total Rows", value: reviewSummary.totalRows, color: "neutral" },
                ].map(({ label, value, color }) => (
                  <Card key={label} variant="soft" color={color} sx={{ p: 1.5, textAlign: "center" }}>
                    <Typography level="h3" fontWeight={800}>{value}</Typography>
                    <Typography level="body-xs">{label}</Typography>
                  </Card>
                ))}
              </Box>
            )}

            <ImportReviewGrid
              batchId={preview.import_batch_id}
              groups={preview.groups || []}
              statusMeta={STATUS_META}
              onRefresh={(updated) => setPreview(updated)}
              onError={(msg) => setError(msg)}
            />

            {preview.warnings?.length > 0 && (
              <Alert color="warning" variant="soft" sx={{ mt: 2, mb: 2 }}>
                {preview.warnings.length} non-blocking warning(s) (e.g. an optional field like doctor
                or severity wasn't found and will be left empty) — see the final report after confirming.
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="solid"
                color="success"
                onClick={handleConfirm}
                disabled={committableCount === 0}
                loading={confirming}
                startDecorator={<CheckCircleIcon />}
              >
                {committableCount === 0
                  ? "Nothing ready to import"
                  : `Add (${committableCount} incident${committableCount === 1 ? "" : "s"})`}
              </Button>
              <Button
                variant="outlined"
                color="danger"
                loading={discarding}
                onClick={handleDiscardBatch}
                startDecorator={<DeleteIcon />}
              >
                Discard batch
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Final report (after confirm) */}
      {report && (
        <Card variant="outlined">
          <CardContent>
            <Typography level="title-md" fontWeight={700} sx={{ mb: 2 }}>
              Import Report
            </Typography>

            {/* Summary cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 2,
                mb: 3,
              }}
            >
              {[
                { label: "Total Groups", value: s.total_groups, color: "neutral" },
                { label: "Imported", value: s.imported_groups, color: "success" },
                { label: "Rejected", value: s.rejected_groups, color: s.rejected_groups > 0 ? "danger" : "neutral" },
                { label: "Rows In", value: s.total_rows, color: "neutral" },
                { label: "Rows Saved", value: s.imported_rows, color: "success" },
                { label: "New Patients", value: s.new_patients_created, color: "primary" },
                { label: "Warnings", value: s.warnings_count, color: s.warnings_count > 0 ? "warning" : "neutral" },
              ].map(({ label, value, color }) => (
                <Card key={label} variant="soft" color={color} sx={{ textAlign: "center", p: 1.5 }}>
                  <Typography level="h3" fontWeight={800}>{value}</Typography>
                  <Typography level="body-xs">{label}</Typography>
                </Card>
              ))}
            </Box>

            {/* Imported groups */}
            {report.imported?.length > 0 && (
              <>
                <Typography level="title-sm" fontWeight={700} sx={{ mb: 1 }}>
                  Imported Groups
                </Typography>
                <Card variant="outlined" sx={{ mb: 2, overflow: "auto" }}>
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Group Key</th>
                        <th>Incident ID</th>
                        <th>Cases</th>
                        <th>Subcases (DRAFT)</th>
                        <th>New Patient</th>
                        <th>Red Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.imported.map((g) => (
                        <tr key={g.group_key}>
                          <td><Typography level="body-sm" fontWeight={600}>{g.group_key}</Typography></td>
                          <td><Chip size="sm" color="primary">{g.incident_id}</Chip></td>
                          <td>{g.rows_imported}</td>
                          <td>{g.subcases_created}</td>
                          <td>{g.new_patient ? <Chip size="sm" color="warning">Created</Chip> : "—"}</td>
                          <td>{g.has_flagged_risk ? <Chip size="sm" color="danger" startDecorator={<FlagIcon sx={{ fontSize: 14 }} />}>Flagged</Chip> : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card>
              </>
            )}

            {/* Rejected groups */}
            {report.rejected?.length > 0 && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography level="title-sm" fontWeight={700} color="danger">
                    Rejected Groups
                  </Typography>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="danger"
                    onClick={handleDownloadRejected}
                    startDecorator={<DownloadIcon />}
                  >
                    Download Rejected (.xlsx)
                  </Button>
                </Box>
                <Card variant="outlined" sx={{ mb: 2, overflow: "auto" }}>
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Group Key</th>
                        <th>Status</th>
                        <th>Rejection Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rejected.map((r) => {
                        const meta = STATUS_META[r.status] || { label: r.status, color: "danger" };
                        return (
                          <tr key={r.group_key}>
                            <td><Typography level="body-sm" fontWeight={600}>{r.group_key}</Typography></td>
                            <td><Chip size="sm" color={meta.color}>{meta.label}</Chip></td>
                            <td><Typography level="body-sm" color="danger">{r.reason}</Typography></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card>
              </>
            )}

            {/* Warnings */}
            {report.warnings?.length > 0 && (
              <>
                <Typography level="title-sm" fontWeight={700} sx={{ mb: 1 }} color="warning">
                  Warnings (imported with missing optional links)
                </Typography>
                <Card variant="outlined" sx={{ overflow: "auto" }}>
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Group Key</th>
                        <th>Warning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.warnings.map((w, i) => (
                        <tr key={i}>
                          <td><Typography level="body-sm" fontWeight={600}>{w.group_key}</Typography></td>
                          <td><Typography level="body-sm">{w.message}</Typography></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch history */}
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography level="title-md" fontWeight={700} startDecorator={<FolderIcon />}>
              Import Batch History
            </Typography>
            <Button size="sm" variant="plain" color="neutral" onClick={loadHistory} startDecorator={<RefreshIcon />}>
              Refresh
            </Button>
          </Box>

          {historyError && <Alert color="danger" sx={{ mb: 2 }}>{historyError}</Alert>}

          {!history && !historyError && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size="sm" />
              <Typography level="body-sm">Loading...</Typography>
            </Box>
          )}

          {history && history.length === 0 && (
            <Typography level="body-sm" sx={{ color: theme.colors.textSecondary }}>
              No imports yet.
            </Typography>
          )}

          {history && history.length > 0 && (
            <Card variant="outlined" sx={{ overflow: "auto" }}>
              <Table size="sm">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Uploaded At</th>
                    <th>Status</th>
                    <th>Total Rows</th>
                    <th>Accepted</th>
                    <th>Rejected</th>
                    <th>Cases Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => {
                    const statusColor =
                      b.Status === "Completed" ? "success" :
                      b.Status === "PendingReview" ? "warning" : "neutral";
                    return (
                      <tr key={b.ImportBatchID}>
                        <td>#{b.ImportBatchID}</td>
                        <td>
                          <Typography level="body-sm">
                            {b.UploadedAt ? new Date(b.UploadedAt).toLocaleString() : "—"}
                          </Typography>
                        </td>
                        <td><Chip size="sm" color={statusColor}>{b.Status}</Chip></td>
                        <td>{b.TotalRows ?? "—"}</td>
                        <td>{b.AcceptedRows ?? "—"}</td>
                        <td>{b.RejectedRows ?? "—"}</td>
                        <td>{b.CreatedCaseCount ?? "—"}</td>
                        <td>
                          {b.Status === "Completed" && (
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={() => handleDownloadPastReport(b.ImportBatchID)}
                              startDecorator={<DownloadIcon />}
                            >
                              Report
                            </Button>
                          )}
                          {b.Status === "PendingReview" && (
                            <Button
                              size="sm"
                              variant="solid"
                              color="warning"
                              loading={resumingBatchId === b.ImportBatchID}
                              onClick={() => handleResumeReview(b.ImportBatchID)}
                              startDecorator={<RateReviewIcon />}
                            >
                              Review
                            </Button>
                          )}
                          {b.Status !== "Completed" && b.Status !== "PendingReview" && "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
