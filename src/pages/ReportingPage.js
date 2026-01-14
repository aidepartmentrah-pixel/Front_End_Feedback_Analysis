// src/pages/ReportingPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Card } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import { fetchDashboardHierarchy } from "../api/dashboard";
import {
  fetchMonthlyReport,
  fetchSeasonalReport,
  exportReport,
  downloadBlob
} from "../api/reports";

// Components
import ReportTypeSwitch from "../components/reports/ReportTypeSwitch";
import ReportFilters from "../components/reports/ReportFilters";
import ReportActions from "../components/reports/ReportActions";

const ReportingPage = () => {
  // Hierarchy state
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Date validation state
  const [isDateRangeInvalid, setIsDateRangeInvalid] = useState(false);

  // Report data state
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Fetch hierarchy on mount
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((error) => console.error("Failed to load hierarchy:", error))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // Report type: monthly or seasonal
  const [reportType, setReportType] = useState("monthly");

  // Report scope level (hospital, administration, department, section)
  const [reportScope, setReportScope] = useState({
    level: "hospital",            // "hospital" | "administration" | "department" | "section"
    administrationIds: [],        // selected administration IDs for navigation
    departmentIds: [],            // selected department IDs for navigation
    sectionIds: []                // selected section IDs (final target when level="section")
  });

  // Filters state (auto-synced with reportType via useEffect)
  const [filters, setFilters] = useState({
    dateMode: "month", // "range", "month" (for monthly), or "trimester" (for seasonal)
    fromDate: "",
    toDate: "",
    month: "1",
    trimester: "",
    year: new Date().getFullYear().toString(),
    mode: "detailed", // "detailed" or "numeric" for monthly reports
  });

  // Auto-sync time filter mode with report type
  useEffect(() => {
    if (reportType === "monthly") {
      // Force month mode for monthly reports (user can manually switch to range)
      setFilters(f => ({
        ...f,
        dateMode: "month",
        trimester: "",
      }));
    } else if (reportType === "seasonal") {
      // Force trimester mode for seasonal reports
      setFilters(f => ({
        ...f,
        dateMode: "trimester",
        month: "",
        fromDate: "",
        toDate: ""
      }));
    }
  }, [reportType]);

  // Initial filters for reset
  const initialFilters = {
    dateMode: "month",
    fromDate: "",
    toDate: "",
    month: "1",
    trimester: "",
    year: new Date().getFullYear().toString(),
    mode: "detailed",
  };

  // Compute whether Generate button should be disabled
  const isGenerateDisabled = React.useMemo(() => {
    if (reportType === "monthly") {
      // Month mode: check if month is valid
      if (filters.dateMode === "month") {
        const monthNum = parseInt(filters.month, 10);
        if (!filters.month || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          return true;
        }
      }
      
      // Range mode: check if dates are filled and valid
      if (filters.dateMode === "range") {
        if (!filters.fromDate || !filters.toDate) {
          return true;
        }
        if (isDateRangeInvalid) {
          return true;
        }
      }
    }
    
    // For seasonal reports, add any specific validation here if needed
    // Currently no validation needed for seasonal
    
    return false;
  }, [reportType, filters.dateMode, filters.month, filters.fromDate, filters.toDate, isDateRangeInvalid]);

  // Handle Generate Report
  const handleGenerateReport = async () => {
    // Validation for monthly reports
    if (reportType === "monthly") {
      // Check month mode validation
      if (filters.dateMode === "month") {
        const monthNum = parseInt(filters.month, 10);
        if (!filters.month || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          alert(
            "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
            "الرجاء تحديد شهر صحيح (1-12)\n" +
            "Please select a valid month (1-12)\n\n" +
            "الرجاء اختيار شهر من القائمة والمحاولة مرة أخرى."
          );
          return;
        }
      }
      
      // Check range mode validation
      if (filters.dateMode === "range") {
        if (!filters.fromDate || !filters.toDate) {
          alert(
            "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
            "الرجاء تحديد تاريخ البداية وتاريخ النهاية\n" +
            "Please specify both From Date and To Date\n\n" +
            "الرجاء ملء كلا التاريخين والمحاولة مرة أخرى."
          );
          return;
        }
        
        // Check if fromDate <= toDate (this is already tracked by isDateRangeInvalid)
        if (isDateRangeInvalid) {
          alert(
            "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
            "تاريخ البداية يجب أن يكون قبل تاريخ النهاية\n" +
            "From Date must be before To Date\n\n" +
            "الرجاء تصحيح نطاق التاريخ والمحاولة مرة أخرى."
          );
          return;
        }
      }
    }

    // Call API
    setLoadingReport(true);
    setReportError(null);
    setReportData(null);

    try {
      let data;

      if (reportType === "monthly") {
        // ========== MONTHLY REPORT ==========
        const params = {
          year: filters.year,
          mode: filters.mode,
        };

        // Add date parameters based on dateMode
        if (filters.dateMode === "month") {
          // Month/Year mode
          params.month = filters.month;
        } else if (filters.dateMode === "range") {
          // Date range mode
          params.start_date = filters.fromDate;
          params.end_date = filters.toDate;
        }

        // Add organization scope parameters
        if (reportScope.level !== "hospital") {
          params.scope = reportScope.level;
          
          if (reportScope.administrationIds.length > 0) {
            params.administration_ids = reportScope.administrationIds.join(",");
          }
          if (reportScope.departmentIds.length > 0) {
            params.department_ids = reportScope.departmentIds.join(",");
          }
          if (reportScope.sectionIds.length > 0) {
            params.section_ids = reportScope.sectionIds.join(",");
          }
        }

        console.log("📡 Generating monthly report with params:", params);
        data = await fetchMonthlyReport(params);
        console.log("✅ Monthly report generated:", data);

      } else if (reportType === "seasonal") {
        // ========== SEASONAL REPORT (NEW BACKEND CONTRACT) ==========

        // 1) Determine orgunit_id
        let orgunit_id = null;

        if (reportScope.level === "section" && reportScope.sectionIds.length > 0) {
          orgunit_id = reportScope.sectionIds[0];
        } else if (reportScope.level === "department" && reportScope.departmentIds.length > 0) {
          orgunit_id = reportScope.departmentIds[0];
        } else if (reportScope.level === "administration" && reportScope.administrationIds.length > 0) {
          orgunit_id = reportScope.administrationIds[0];
        }

        if (!orgunit_id) {
          alert("❌ Please select an Administration / Department / Section");
          throw new Error("No orgunit selected");
        }

        // 2) You MUST get season_id from somewhere:
        // TEMP SOLUTION: map trimester+year → season_id via backend or dropdown
        // For now, assume you already have it in filters.season_id

        if (!filters.season_id) {
          alert("❌ No season selected (season_id is missing)");
          throw new Error("season_id missing");
        }

        const params = {
          season_id: Number(filters.season_id),
          orgunit_id: Number(orgunit_id),
          user_id: 1, // or from auth later
        };

        console.log("📡 Generating seasonal report with params:", params);

        data = await fetchSeasonalReport(params);
      }


      setReportData(data);
      alert("✅ تم توليد التقرير بنجاح!\n\nReport generated successfully!");
    } catch (error) {
      console.error("❌ Error generating report:", error);
      setReportError(error.message);
      alert("❌ فشل توليد التقرير\n\nFailed to generate report: " + error.message);
    } finally {
      setLoadingReport(false);
    }
  };

  // Helper function to build export payload
  const buildExportPayload = () => {
    const payload = {
      reportType,
      filters: { ...filters },
      reportScope: { ...reportScope },
      timestamp: new Date().toISOString(),
    };

    // Add organization filters
    if (reportScope.level !== "hospital") {
      payload.filters.scope = reportScope.level;
      if (reportScope.administrationIds.length > 0) {
        payload.filters.administration_ids = reportScope.administrationIds.join(",");
      }
      if (reportScope.departmentIds.length > 0) {
        payload.filters.department_ids = reportScope.departmentIds.join(",");
      }
      if (reportScope.sectionIds.length > 0) {
        payload.filters.section_ids = reportScope.sectionIds.join(",");
      }
    }

    return payload;
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    // Check if report is loaded
    if (!reportData) {
      alert(
        "⚠️ لم يتم توليد التقرير (No Report Loaded)\n\n" +
        "الرجاء توليد التقرير أولاً قبل التصدير\n" +
        "Please generate a report first before exporting"
      );
      return;
    }

    // Check for date range validation errors (monthly only)
    if (reportType === "monthly" && isDateRangeInvalid) {
      alert(
        "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
        "تاريخ البداية يجب أن يكون قبل تاريخ النهاية\n" +
        "From Date must be before To Date\n\n" +
        "الرجاء تصحيح نطاق التاريخ والمحاولة مرة أخرى."
      );
      return;
    }

    // Export using centralized API
    try {
      // Get record count from reportData
      const recordCount = reportData?.data?.length || reportData?.records?.length || "unknown";
      const countText = recordCount !== "unknown" ? `${recordCount} records` : "this report";
      
      // Confirmation dialog
      const confirmed = window.confirm(
        `📄 PDF Export Confirmation\n\n` +
        `You are about to export ${countText}.\n\n` +
        `أنت على وشك تصدير ${recordCount !== "unknown" ? recordCount + " سجل" : "هذا التقرير"}.\n\n` +
        `Continue? هل تريد المتابعة؟`
      );
      
      if (!confirmed) {
        console.log("❌ PDF export cancelled by user");
        return;
      }
      
      const payload = buildExportPayload();
      const { blob, filename } = await exportReport({ 
        report_type: reportType, 
        format: "pdf", 
        filters: payload.filters 
      });
      downloadBlob(blob, filename);
      alert("✅ تم تصدير PDF بنجاح!\n\nPDF export successful!");
    } catch (error) {
      console.error("PDF export error:", error);
      alert("❌ فشل التصدير\n\nExport failed: " + error.message);
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    // Check if report is loaded
    if (!reportData) {
      alert(
        "⚠️ لم يتم توليد التقرير (No Report Loaded)\n\n" +
        "الرجاء توليد التقرير أولاً قبل التصدير\n" +
        "Please generate a report first before exporting"
      );
      return;
    }

    // Check for date range validation errors (monthly only)
    if (reportType === "monthly" && isDateRangeInvalid) {
      alert(
        "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
        "تاريخ البداية يجب أن يكون قبل تاريخ النهاية\n" +
        "From Date must be before To Date\n\n" +
        "الرجاء تصحيح نطاق التاريخ والمحاولة مرة أخرى."
      );
      return;
    }

    // Export using centralized API
    try {
      // Get record count from reportData
      const recordCount = reportData?.data?.length || reportData?.records?.length || "unknown";
      const countText = recordCount !== "unknown" ? `${recordCount} records` : "this report";
      
      // Confirmation dialog
      const confirmed = window.confirm(
        `📊 Excel Export Confirmation\n\n` +
        `You are about to export ${countText}.\n\n` +
        `أنت على وشك تصدير ${recordCount !== "unknown" ? recordCount + " سجل" : "هذا التقرير"}.\n\n` +
        `Continue? هل تريد المتابعة؟`
      );
      
      if (!confirmed) {
        console.log("❌ Excel export cancelled by user");
        return;
      }
      
      const payload = buildExportPayload();
      const { blob, filename } = await exportReport({ 
        report_type: reportType, 
        format: "xlsx", 
        filters: payload.filters 
      });
      downloadBlob(blob, filename);
      alert("✅ تم تصدير Excel بنجاح!\n\nExcel export successful!");
    } catch (error) {
      console.error("Excel export error:", error);
      alert("❌ فشل التصدير\n\nExport failed: " + error.message);
    }
  };

  // Handle Word export
  const handleExportWord = async () => {
    // Check if report is loaded
    if (!reportData) {
      alert(
        "⚠️ لم يتم توليد التقرير (No Report Loaded)\n\n" +
        "الرجاء توليد التقرير أولاً قبل التصدير\n" +
        "Please generate a report first before exporting"
      );
      return;
    }

    // Check for date range validation errors (monthly only)
    if (reportType === "monthly" && isDateRangeInvalid) {
      alert(
        "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
        "تاريخ البداية يجب أن يكون قبل تاريخ النهاية\n" +
        "From Date must be before To Date\n\n" +
        "الرجاء تصحيح نطاق التاريخ والمحاولة مرة أخرى."
      );
      return;
    }

    // Export using centralized API
    try {
      // Get record count from reportData
      const recordCount = reportData?.data?.length || reportData?.records?.length || "unknown";
      const countText = recordCount !== "unknown" ? `${recordCount} records` : "this report";
      
      // Confirmation dialog
      const confirmed = window.confirm(
        `📄 Word Export Confirmation\n\n` +
        `You are about to export ${countText}.\n\n` +
        `أنت على وشك تصدير ${recordCount !== "unknown" ? recordCount + " سجل" : "هذا التقرير"}.\n\n` +
        `Continue? هل تريد المتابعة؟`
      );
      
      if (!confirmed) {
        console.log("❌ Word export cancelled by user");
        return;
      }
      
      const payload = buildExportPayload();
      const { blob, filename } = await exportReport({ 
        report_type: reportType, 
        format: "docx", 
        filters: payload.filters 
      });
      downloadBlob(blob, filename);
      alert("✅ تم تصدير Word بنجاح!\n\nWord export successful!");
    } catch (error) {
      console.error("Word export error:", error);
      alert("❌ فشل التصدير\n\nExport failed: " + error.message);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            📊 مولد التقارير (Report Generator)
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            قم بإنشاء وتصدير تقارير شهرية وفصلية مخصصة
          </Typography>
        </Box>

        {/* Report Type Switch */}
        <ReportTypeSwitch reportType={reportType} setReportType={setReportType} />

        {/* Filters */}
        <ReportFilters 
          filters={filters} 
          setFilters={setFilters} 
          reportType={reportType}
          hierarchy={hierarchy}
          loadingHierarchy={loadingHierarchy}
          reportScope={reportScope}
          setReportScope={setReportScope}
          onValidationChange={setIsDateRangeInvalid}
        />

        {/* Report Generation Summary */}
        <Card
          sx={{
            mb: 3,
            p: 3,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
            border: "2px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
            📊 ملخص التقرير (Report Summary)
          </Typography>
          
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            {/* Report Type */}
            <Box>
              <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
                📄 نوع التقرير
              </Typography>
              <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea" }}>
                {reportType === "monthly" ? "📅 شهري (Monthly)" : "🍃 فصلي (Seasonal)"}
              </Typography>
            </Box>

            {/* Report Mode (Monthly only) */}
            {reportType === "monthly" && (
              <Box>
                <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
                  📊 الوضع
                </Typography>
                <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea" }}>
                  {filters.mode === "detailed" ? "📋 تفصيلي (Detailed)" : "🔢 رقمي (Numeric)"}
                </Typography>
              </Box>
            )}

            {/* Period */}
            <Box>
              <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
                📆 الفترة
              </Typography>
              <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea" }}>
                {filters.dateMode === "month" && filters.month && filters.year && (
                  `${filters.month}/${filters.year}`
                )}
                {filters.dateMode === "trimester" && filters.trimester && filters.year && (
                  `${filters.trimester} ${filters.year}`
                )}
                {filters.dateMode === "range" && filters.fromDate && filters.toDate && (
                  `${filters.fromDate} → ${filters.toDate}`
                )}
                {!((filters.dateMode === "month" && filters.month && filters.year) ||
                   (filters.dateMode === "trimester" && filters.trimester && filters.year) ||
                   (filters.dateMode === "range" && filters.fromDate && filters.toDate)) && "غير محدد"}
              </Typography>
            </Box>

            {/* Scope Level */}
            <Box>
              <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
                🏯 النطاق
              </Typography>
              <Typography level="title-md" sx={{ fontWeight: 700, color: "#667eea" }}>
                {reportScope.level === "hospital" && "🏥 المستشفى (Hospital)"}
                {reportScope.level === "administration" && `🏢 إدارة (${reportScope.administrationIds.length || "All"})`}
                {reportScope.level === "department" && `🏬 دائرة (${reportScope.departmentIds.length || "All"})`}
                {reportScope.level === "section" && `🧩 قسم (${reportScope.sectionIds.length || "All"})`}
              </Typography>
            </Box>
          </Box>

          {/* Generation Notice */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              background: "rgba(102, 126, 234, 0.05)",
              borderRadius: "8px",
              border: "1px dashed rgba(102, 126, 234, 0.3)",
            }}
          >
            <Typography level="body-sm" sx={{ color: "#667eea", fontWeight: 600 }}>
              ℹ️ هذه الصفحة لإنشاء التقارير فقط. لعرض التقارير المخزنة، انتقل إلى لوحة التقارير الفصلية.
            </Typography>
            <Typography level="body-xs" sx={{ color: "#999", mt: 0.5 }}>
              This page is for generating reports only. To view stored reports, go to Seasonal Reports Dashboard.
            </Typography>
          </Box>
        </Card>

        {/* Action Buttons */}
        <ReportActions
          onGenerate={handleGenerateReport}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onExportWord={handleExportWord}
          disableGenerate={isGenerateDisabled}
          disableExport={!reportData}
          loading={loadingReport}
        />

        {/* Report Data Display */}
        {reportData && (
          <Card
            sx={{
              mt: 3,
              p: 3,
              background: "linear-gradient(135deg, rgba(46, 213, 115, 0.08) 0%, rgba(0, 184, 148, 0.08) 100%)",
              border: "2px solid rgba(46, 213, 115, 0.3)",
            }}
          >
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#00b894" }}>
              ✅ تم توليد التقرير (Report Generated)
            </Typography>
            <Box
              sx={{
                p: 2,
                background: "white",
                borderRadius: "8px",
                maxHeight: "400px",
                overflow: "auto",
              }}
            >
              <pre style={{ margin: 0, fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </Box>
          </Card>
        )}

        {/* Report Error Display */}
        {reportError && (
          <Card
            sx={{
              mt: 3,
              p: 3,
              background: "rgba(245, 87, 108, 0.08)",
              border: "2px solid rgba(245, 87, 108, 0.3)",
            }}
          >
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#f5576c" }}>
              ❌ خطأ في توليد التقرير (Report Error)
            </Typography>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              {reportError}
            </Typography>
          </Card>
        )}

        {/* Info Footer */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderRadius: "8px",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea", mb: 1 }}>
            💡 وضع التطوير (Development Mode)
          </Typography>
          <Typography level="body-xs" sx={{ color: "#666" }}>
            النظام حالياً يستخدم <strong>بيانات وهمية</strong>. بعد الانتهاء من قاعدة البيانات، سيتم ربط جميع المكونات بواجهات برمجة التطبيقات الحقيقية.
          </Typography>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default ReportingPage;
