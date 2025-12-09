// src/components/TableView/ExportSection.js
import React, { useState } from "react";
import { Box, Card, Typography, Input, Button, FormControl, FormLabel, Grid, Checkbox, RadioGroup, Radio, Divider } from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const ExportSection = ({ filteredRecordCount, allRecords }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportLimit, setExportLimit] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  const [selectedColumns, setSelectedColumns] = useState({
    recordId: true,
    date: true,
    patientName: true,
    issuingDept: true,
    targetDept: true,
    source: true,
    feedbackType: true,
    domain: true,
    category: true,
    subCategory: true,
    severity: true,
    status: true,
    harmLevel: true,
    stage: true,
    complaintText: true,
    immediateAction: true,
    takenAction: true,
  });

  const [format, setFormat] = useState("excel");
  const [textDirection, setTextDirection] = useState("ltr");

  const columnOptions = [
    { key: "recordId", label: "Record ID" },
    { key: "date", label: "Feedback Received Date" },
    { key: "patientName", label: "Patient Name" },
    { key: "issuingDept", label: "Issuing Department" },
    { key: "targetDept", label: "Target Department" },
    { key: "source", label: "Source" },
    { key: "feedbackType", label: "Feedback Type" },
    { key: "domain", label: "Domain" },
    { key: "category", label: "Category" },
    { key: "subCategory", label: "Sub-Category" },
    { key: "severity", label: "Severity Level" },
    { key: "status", label: "Status" },
    { key: "harmLevel", label: "Harm Level" },
    { key: "stage", label: "Stage" },
    { key: "complaintText", label: "Complaint Text" },
    { key: "immediateAction", label: "Immediate Action" },
    { key: "takenAction", label: "Taken Action" },
  ];

  const handleColumnToggle = (key) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedColumns).every((v) => v);
    const newState = {};
    columnOptions.forEach((col) => {
      newState[col.key] = !allSelected;
    });
    setSelectedColumns(newState);
  };

  const selectedCount = Object.values(selectedColumns).filter((v) => v).length;
  const recordsToExport = exportLimit ? Math.min(parseInt(exportLimit) || filteredRecordCount, filteredRecordCount) : filteredRecordCount;

  const handleExport = () => {
    // Placeholder for actual export logic
    console.log("Export configuration:", {
      columns: selectedColumns,
      format,
      textDirection,
      recordsToExport,
    });

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <Card
      sx={{
        mt: 4,
        mb: 3,
        p: 3,
        background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
        border: "2px solid #4caf50",
        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.1)",
      }}
    >
      {/* Main Export Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
        {/* Left: Title and Info */}
        <Box sx={{ flex: 1, minWidth: "250px" }}>
          <Typography level="h4" sx={{ color: "#2d5016", fontWeight: 700, mb: 1 }}>
            📊 Export Filtered Records
          </Typography>
          <Typography level="body-sm" sx={{ color: "#558b2f" }}>
            {filteredRecordCount} record(s) match your filters
            {exportLimit && ` • Exporting max ${recordsToExport} record(s)`}
          </Typography>
        </Box>

        {/* Right: Limit Input and Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end", flexWrap: "wrap" }}>
          {/* Limit Input */}
          <FormControl sx={{ minWidth: "140px" }}>
            <FormLabel sx={{ fontSize: "12px", fontWeight: 600, mb: 0.5 }}>
              ⚙️ Limit (Optional)
            </FormLabel>
            <Input
              type="number"
              placeholder="e.g., 50"
              min="1"
              value={exportLimit}
              onChange={(e) => setExportLimit(e.target.value)}
              slotProps={{
                input: {
                  style: {
                    borderRadius: "6px",
                    fontSize: "13px",
                  },
                },
              }}
              sx={{
                "--Input-focusedHighlight": "rgba(76, 175, 80, 0.2)",
              }}
            />
          </FormControl>

          {/* Show/Hide Advanced */}
          <Button
            size="md"
            variant="outlined"
            onClick={() => setShowAdvanced(!showAdvanced)}
            startDecorator={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              color: "#2d5016",
              borderColor: "#4caf50",
              fontWeight: 600,
            }}
          >
            {showAdvanced ? "Hide Options" : "Show Options"}
          </Button>

          {/* Export Button */}
          <Button
            size="lg"
            variant="solid"
            color="success"
            startDecorator={<DownloadIcon />}
            onClick={handleExport}
            disabled={filteredRecordCount === 0}
            sx={{
              fontWeight: 700,
              minWidth: "140px",
            }}
          >
            📥 Export
          </Button>
        </Box>
      </Box>

      {/* Success Message */}
      {exportSuccess && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: "6px",
            background: "rgba(76, 175, 80, 0.1)",
            border: "1px solid #4caf50",
            color: "#2d5016",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          ✅ Export downloaded successfully!
        </Box>
      )}

      {/* Advanced Options (Hidden by default) */}
      {showAdvanced && (
        <>
          <Divider sx={{ my: 2, borderColor: "rgba(76, 175, 80, 0.3)" }} />

          <Grid container spacing={3}>
            {/* Columns Selection */}
            <Grid xs={12} md={6}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography level="body-sm" sx={{ fontWeight: 700, color: "#2d5016" }}>
                    📋 Select Columns ({selectedCount}/{columnOptions.length})
                  </Typography>
                  <Button
                    size="sm"
                    variant="plain"
                    onClick={handleSelectAll}
                    sx={{ color: "#4caf50", fontWeight: 600, fontSize: "12px" }}
                  >
                    {Object.values(selectedColumns).every((v) => v) ? "Deselect All" : "Select All"}
                  </Button>
                </Box>

                <Grid container spacing={1}>
                  {columnOptions.map((col) => (
                    <Grid xs={12} sm={6} key={col.key}>
                      <Checkbox
                        label={col.label}
                        checked={selectedColumns[col.key]}
                        onChange={() => handleColumnToggle(col.key)}
                        size="sm"
                        sx={{ fontSize: "13px" }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Format & Direction */}
            <Grid xs={12} md={6}>
              <Box>
                {/* Format Selection */}
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-sm" sx={{ fontWeight: 700, color: "#2d5016", mb: 1.5 }}>
                    💾 Export Format
                  </Typography>
                  <RadioGroup value={format} onChange={(e) => setFormat(e.target.value)}>
                    <Radio value="excel" label="📈 Excel (.xlsx)" />
                    <Radio value="csv" label="📄 CSV (.csv)" />
                  </RadioGroup>
                </Box>

                {/* Text Direction */}
                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 700, color: "#2d5016", mb: 1.5 }}>
                    🔤 Text Direction
                  </Typography>
                  <RadioGroup value={textDirection} onChange={(e) => setTextDirection(e.target.value)}>
                    <Radio value="ltr" label="Left to Right (LTR)" />
                    <Radio value="rtl" label="Right to Left (RTL)" />
                  </RadioGroup>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </>
      )}

      <Typography level="body-xs" sx={{ mt: 2, color: "#558b2f", fontStyle: "italic" }}>
        💡 Tip: Leave "Limit" empty to export all filtered records. Click "Show Options" to customize columns, format, and text direction.
      </Typography>
    </Card>
  );
};

export default ExportSection;
