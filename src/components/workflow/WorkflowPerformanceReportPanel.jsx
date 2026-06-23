/**
 * WorkflowPerformanceReportPanel — Workflow Page report launcher
 * HCAT Reporting Refactor — Session 1
 *
 * This is NOT a report viewer. It only provides filters + an export button.
 * The unified Workflow Performance Report (Response Performance + Current
 * Delay) is generated server-side as a single DOCX file — nothing is
 * rendered on screen here, by design (see Session 1 spec).
 *
 * Date range is the primary filter. The quarter dropdown is a shortcut that
 * fills the date range from the existing hospital season data (same source
 * the Reporting Page's seasonal reports use) — it does not introduce a
 * second, competing time-filter system on the backend.
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Grid,
  Button,
  IconButton,
} from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionIcon from "@mui/icons-material/Description";
import { exportWorkflowPerformanceReport, downloadBlob } from "../../api/reports";
import { getAvailableQuarters } from "../../api/seasonalReports";

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDefaultDateFrom = () => {
  const now = new Date();
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const getDefaultDateTo = () => formatDate(new Date());

const WorkflowPerformanceReportPanel = ({ hierarchy, loadingHierarchy }) => {
  const [expanded, setExpanded] = useState(false);

  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState(getDefaultDateTo());
  const [quarterId, setQuarterId] = useState(""); // "" = custom date range
  const [level, setLevel] = useState("All");
  const [targetUnitId, setTargetUnitId] = useState("");

  const [availableQuarters, setAvailableQuarters] = useState([]);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    getAvailableQuarters(1, 0)
      .then((quarters) => setAvailableQuarters(Array.isArray(quarters) ? quarters : []))
      .catch((err) => console.error("Failed to load available quarters:", err));
  }, []);

  const unitOptions = useMemo(() => {
    if (!hierarchy) return [];
    const options = [];
    const seen = new Set();
    const addUnit = (unit, unitType) => {
      if (!unit || seen.has(unit.id)) return;
      seen.add(unit.id);
      options.push({ id: unit.id, nameAr: unit.nameAr, nameEn: unit.nameEn, unitType });
    };
    (hierarchy.Administration || []).forEach((u) => addUnit(u, "Administration"));
    Object.values(hierarchy.Department || {}).forEach((depts) =>
      depts.forEach((u) => addUnit(u, "Department"))
    );
    Object.values(hierarchy.Section || {}).forEach((sections) =>
      sections.forEach((u) => addUnit(u, "Section"))
    );
    return options;
  }, [hierarchy]);

  const handleQuarterChange = (seasonId) => {
    setQuarterId(seasonId);
    if (!seasonId) return; // "Custom Date Range" selected — leave dateFrom/dateTo as-is
    const season = availableQuarters.find(
      (q) => String(q.season_id || q.SeasonID) === String(seasonId)
    );
    if (season) {
      setDateFrom(season.start_date || season.StartDate);
      setDateTo(season.end_date || season.EndDate);
    }
  };

  // Manually editing a date falls back to "Custom Date Range"
  const handleDateFromChange = (value) => {
    setDateFrom(value);
    setQuarterId("");
  };
  const handleDateToChange = (value) => {
    setDateTo(value);
    setQuarterId("");
  };

  const handleExport = async () => {
    if (!dateFrom || !dateTo) {
      alert("⚠️ الرجاء تحديد نطاق التاريخ\n\nPlease select a date range (From Date and To Date).");
      return;
    }
    if (dateFrom > dateTo) {
      alert("⚠️ تاريخ البداية يجب أن يكون قبل تاريخ النهاية\n\nFrom Date must be before To Date.");
      return;
    }

    const confirmed = window.confirm(
      "📄 تصدير تقرير أداء سير العمل\n\nExport Workflow Performance Report?\n\nهل تريد المتابعة؟"
    );
    if (!confirmed) return;

    setExporting(true);
    setExportError(null);
    try {
      const { blob, filename } = await exportWorkflowPerformanceReport({
        date_from: dateFrom,
        date_to: dateTo,
        level,
        target_unit_id: targetUnitId || null,
      });
      downloadBlob(blob, filename);
      alert("✅ تم تصدير التقرير بنجاح!\n\nReport exported successfully!");
    } catch (err) {
      console.error("Workflow performance export error:", err);
      setExportError(err.message || "فشل التصدير / Export failed");
      alert("❌ فشل التصدير\n\nExport failed: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card sx={{ mb: 2, p: 0, overflow: "hidden" }}>
      <Box
        sx={{
          px: 2.5, py: 1.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer",
          backgroundColor: "#f0fbfc",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <DescriptionIcon sx={{ color: "#2BBCC4" }} />
          <Box>
            <Typography level="title-md" sx={{ fontWeight: 700, color: "#2BBCC4" }}>
              تقرير أداء سير العمل (Workflow Performance Report)
            </Typography>
            <Typography level="body-xs" sx={{ color: "#999" }}>
              تقرير يوضح أداء الردود والتأخير الحالي ضمن سير معالجة الشكاوى.
            </Typography>
          </Box>
        </Box>
        <IconButton size="sm" variant="plain">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {expanded && (
        <Box sx={{ p: 2.5, pt: 2, borderTop: "1px solid #e0e0e0" }}>
          <Grid container spacing={1.5}>
            <Grid xs={12} sm={6} md={2.4}>
              <FormControl size="sm">
                <FormLabel>من تاريخ (From)</FormLabel>
                <Input
                  type="date"
                  size="sm"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={2.4}>
              <FormControl size="sm">
                <FormLabel>إلى تاريخ (To)</FormLabel>
                <Input
                  type="date"
                  size="sm"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={2.4}>
              <FormControl size="sm">
                <FormLabel>الفصل (Quarter)</FormLabel>
                <Select
                  size="sm"
                  value={quarterId}
                  onChange={(e, value) => handleQuarterChange(value)}
                  placeholder="نطاق مخصص (Custom)"
                >
                  <Option value="">نطاق مخصص (Custom Date Range)</Option>
                  {availableQuarters.map((q) => {
                    const id = q.season_id || q.SeasonID;
                    const name = q.name || q.SeasonName || `Season ${id}`;
                    return (
                      <Option key={id} value={String(id)}>
                        {name}
                      </Option>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={2.4}>
              <FormControl size="sm">
                <FormLabel>المستوى (Level)</FormLabel>
                <Select size="sm" value={level} onChange={(e, value) => setLevel(value)}>
                  <Option value="All">الكل (All)</Option>
                  <Option value="Administration">إدارة (Administration)</Option>
                  <Option value="Department">دائرة (Department)</Option>
                  <Option value="Section">قسم (Section)</Option>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={2.4}>
              <FormControl size="sm">
                <FormLabel>الوحدة المستهدفة (Unit)</FormLabel>
                <Select
                  size="sm"
                  value={targetUnitId}
                  onChange={(e, value) => setTargetUnitId(value)}
                  disabled={loadingHierarchy}
                  placeholder="الكل (All)"
                >
                  <Option value="">الكل (All units in scope)</Option>
                  {unitOptions.map((u) => (
                    <Option key={u.id} value={u.id}>
                      {`${u.nameAr} (${u.nameEn})`}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              onClick={handleExport}
              loading={exporting}
              size="sm"
              startDecorator={<DescriptionIcon />}
              sx={{
                background: "linear-gradient(135deg, #2BBCC4 0%, #64A70B 100%)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              تصدير تقرير أداء سير العمل (Export Workflow Performance Report)
            </Button>
          </Box>

          {exportError && (
            <Typography level="body-xs" sx={{ color: "#f5576c", mt: 1, textAlign: "right" }}>
              {exportError}
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
};

export default WorkflowPerformanceReportPanel;
