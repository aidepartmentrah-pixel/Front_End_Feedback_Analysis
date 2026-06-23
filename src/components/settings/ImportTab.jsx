import React, { useState, useRef } from "react";
import {
  Box, Typography, Button, Alert, Card, CardContent,
  Divider, CircularProgress, Table, Chip,
} from "@mui/joy";

import theme from "../../theme";

const BASE = "";  // same-origin via proxy

export default function ImportTab() {
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

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

  // ---- Upload file ----
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
      setReport(data);
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-uploaded
      if (fileRef.current) fileRef.current.value = "";
    }
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

  return (
    <Box sx={{ maxWidth: 900, fontFamily: theme.settings.fontFamily }}>
      {/* Header */}
      <Typography level="h3" fontWeight={700} sx={{ mb: 0.5, fontFamily: theme.settings.fontFamily, color: theme.settings.headerColor }}>
        Data Import
      </Typography>
      <Typography level="body-sm" sx={{ color: theme.colors.textSecondary, mb: 3, fontFamily: theme.settings.fontFamily }}>
        Import complaint data from Excel into the workflow system. Download the template,
        fill it in, then upload it here. Only valid incident groups will be imported.
      </Typography>

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
            The template is generated live with current database dropdown values.
            Fill it using the dropdowns to avoid validation errors.
          </Typography>
          <Button
            variant="solid"
            color="primary"
            onClick={handleDownloadTemplate}
            startDecorator={<span>⬇️</span>}
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
            Only <strong>.xlsx</strong> files are accepted. Rows are grouped by
            &quot;Incident Group Key&quot; — all rows sharing the same key form one Incident.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              component="label"
              disabled={uploading}
              startDecorator={uploading ? <CircularProgress size="sm" /> : <span>📂</span>}
            >
              {uploading ? "Processing..." : "Choose & Upload File"}
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
                Validating and importing data...
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Step 3 — Report */}
      {report && (
        <Card variant="outlined">
          <CardContent>
            <Typography level="title-md" fontWeight={700} sx={{ mb: 2 }}>
              Step 3 — Import Report
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
                    startDecorator={<span>⬇️</span>}
                  >
                    Download Rejected (.xlsx)
                  </Button>
                </Box>
                <Card variant="outlined" sx={{ mb: 2, overflow: "auto" }}>
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Group Key</th>
                        <th>Rejection Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rejected.map((r) => (
                        <tr key={r.group_key}>
                          <td><Typography level="body-sm" fontWeight={600}>{r.group_key}</Typography></td>
                          <td><Typography level="body-sm" color="danger">{r.reason}</Typography></td>
                        </tr>
                      ))}
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
    </Box>
  );
}
