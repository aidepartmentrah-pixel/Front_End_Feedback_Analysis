// src/pages/ReportingPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Card } from "@mui/joy";
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import { fetchDashboardHierarchy } from "../api/dashboard";
import {
  fetchMonthlyReport,
  fetchSeasonalReport,
  exportReport,
  downloadBlob
} from "../api/reports";
import {
  getAvailableQuarters,
  viewSeasonalReport,
  exportSingleSeasonalReport,
  generate2QuarterComparison,
  generate3QuarterComparison,
  generate4QuarterComparison,
} from "../api/seasonalReports";

// Components
import ReportTypeSwitch from "../components/reports/ReportTypeSwitch";
import ReportFilters from "../components/reports/ReportFilters";
import ReportActions from "../components/reports/ReportActions";

const ReportingPage = () => {
  // Hierarchy state
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Available quarters from backend
  const [availableQuarters, setAvailableQuarters] = useState([]);
  const [loadingQuarters, setLoadingQuarters] = useState(true);

  // Comparison state for seasonal reports
  const [comparisonType, setComparisonType] = useState("single"); // "single", "compare-2", "compare-3", "compare-4"
  const [selectedSeasons, setSelectedSeasons] = useState([]);

  // Date validation state
  const [isDateRangeInvalid, setIsDateRangeInvalid] = useState(false);

  // Report data state
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Fetch hierarchy and available quarters on mount
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((hierarchyData) => {
        setHierarchy(hierarchyData);
        
        // Fetch available quarters for hospital level (default)
        const hospitalId = hierarchyData?.hospital_id || 1;
        return getAvailableQuarters(hospitalId, 0); // 0 = Hospital level
      })
      .then((quartersData) => {
        setAvailableQuarters(quartersData);
        
        // Auto-select the most recent quarter
        if (quartersData && quartersData.length > 0) {
          const firstQuarter = quartersData[0];
          const seasonId = firstQuarter.season_id || firstQuarter.SeasonID;
          setSelectedSeasons([seasonId]);
        }
      })
      .catch((error) => console.error("Failed to load data:", error))
      .finally(() => {
        setLoadingHierarchy(false);
        setLoadingQuarters(false);
      });
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

  // Handle comparison type changes
  useEffect(() => {
    if (reportType === "seasonal" && comparisonType !== "single") {
      const requiredSeasons = getRequiredSeasonCount();
      
      // Auto-select consecutive quarters based on comparison type (only for comparison modes)
      if (availableQuarters.length > 0) {
        // Handle both season_id (backend new) and SeasonID (old format)
        const seasons = availableQuarters.slice(0, requiredSeasons).map(q => q.season_id || q.SeasonID);
        setSelectedSeasons(seasons);
      }
    } else if (reportType === "seasonal" && comparisonType === "single") {
      // For single mode, clear chip selections (we use dropdowns instead)
      setSelectedSeasons([]);
    }
  }, [comparisonType, reportType, availableQuarters]);

  // Get required number of seasons based on comparison type
  const getRequiredSeasonCount = () => {
    switch (comparisonType) {
      case "single":
        return 1;
      case "compare-2":
        return 2;
      case "compare-3":
        return 3;
      case "compare-4":
        return 4;
      default:
        return 1;
    }
  };

  // Get selected quarter names
  const getSelectedQuarterNames = () => {
    return selectedSeasons
      .map(seasonId => {
        const quarter = availableQuarters.find(q => (q.season_id || q.SeasonID) === seasonId);
        return quarter ? (quarter.name || quarter.SeasonName) : `Season ${seasonId}`;
      })
      .join(", ");
  };

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
    
    // For seasonal reports
    if (reportType === "seasonal") {
      if (comparisonType === "single") {
        // Single mode: require year and trimester from dropdowns
        if (!filters.trimester || !filters.year) {
          return true;
        }
      } else {
        // Comparison mode: require correct number of seasons selected
        const requiredCount = getRequiredSeasonCount();
        if (!selectedSeasons || selectedSeasons.length !== requiredCount) {
          return true;
        }
      }
    }
    
    return false;
  }, [reportType, filters.dateMode, filters.month, filters.fromDate, filters.toDate, filters.trimester, filters.year, isDateRangeInvalid, comparisonType, selectedSeasons]);

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

    // Validation for seasonal reports
    if (reportType === "seasonal") {
      if (comparisonType === "single") {
        // Single mode: validate year and trimester dropdowns
        if (!filters.trimester || !filters.year) {
          alert(
            "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
            "الرجاء تحديد الفصل والسنة\n" +
            "Please select both Trimester and Year\n\n" +
            "الرجاء اختيار الفصل والسنة والمحاولة مرة أخرى."
          );
          return;
        }
      } else {
        // Comparison mode: validate correct number of quarters selected
        const requiredCount = getRequiredSeasonCount();
        if (!selectedSeasons || selectedSeasons.length !== requiredCount) {
          alert(
            "⚠️ خطأ في التحقق من البيانات (Validation Error)\n\n" +
            `الرجاء تحديد ${requiredCount} فصول بالضبط\n` +
            `Please select exactly ${requiredCount} quarters\n\n` +
            "الرجاء اختيار الفصول المطلوبة والمحاولة مرة أخرى."
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
        // ========== SEASONAL REPORT (BACKEND V2 API) ==========

        // 1) Determine orgunit_id and orgunit_type based on scope level
        let orgunit_id = null;
        let orgunit_type;

        if (reportScope.level === "hospital") {
          // Hospital level - always allowed
          orgunit_id = hierarchy?.hospital_id || 1;
          orgunit_type = 0;
        } else if (reportScope.level === "administration") {
          // Administration level
          if (reportScope.administrationIds.length > 0) {
            // Specific administration(s) selected
            orgunit_id = reportScope.administrationIds[0];
          } else {
            // "All administrations" - use hospital_id as base
            orgunit_id = hierarchy?.hospital_id || 1;
          }
          orgunit_type = 1;
        } else if (reportScope.level === "department") {
          // Department level
          if (reportScope.departmentIds.length > 0) {
            // Specific department(s) selected
            orgunit_id = reportScope.departmentIds[0];
          } else {
            // "All departments" - use hospital_id as base
            orgunit_id = hierarchy?.hospital_id || 1;
          }
          orgunit_type = 2;
        } else if (reportScope.level === "section") {
          // Section level
          if (reportScope.sectionIds.length > 0) {
            // Specific section(s) selected
            orgunit_id = reportScope.sectionIds[0];
          } else {
            // "All sections" - use hospital_id as base
            orgunit_id = hierarchy?.hospital_id || 1;
          }
          orgunit_type = 3;
        } else {
          throw new Error("Invalid scope level");
        }

        // Validate orgunit_id exists (should always be set now)
        if (!orgunit_id) {
          alert(
            "❌ خطأ في التحقق من البيانات (Validation Error)\n\n" +
            "فشل تحديد معرف الوحدة التنظيمية\n" +
            "Failed to determine organizational unit ID\n\n" +
            "الرجاء التحقق من إعدادات التسلسل الهرمي."
          );
          throw new Error("No orgunit_id could be determined");
        }

        // 3) Build params based on comparison type
        if (comparisonType === "single") {
          // Single seasonal report using year/trimester from dropdowns
          const params = {
            year: parseInt(filters.year),
            trimester: filters.trimester, // "Q1", "Q2", "Q3", "Q4"
            orgunit_id: Number(orgunit_id),
            orgunit_type: orgunit_type,
            user_id: 1 // TODO: Get from auth context
          };
          
          console.log("📡 Generating single seasonal report with params:", params);
          data = await viewSeasonalReport(params);
          console.log("✅ Single seasonal report generated:", data);
        } else {
          // Comparison reports
          const params = {
            season_ids: selectedSeasons,
            orgunit_id: Number(orgunit_id),
            orgunit_type: orgunit_type,
            format: "json"
          };
          
          console.log("📡 Generating " + comparisonType + " comparison with params:", params);
          
          switch (comparisonType) {
            case "compare-2":
              data = await generate2QuarterComparison(params);
              break;
            case "compare-3":
              data = await generate3QuarterComparison(params);
              break;
            case "compare-4":
              data = await generate4QuarterComparison(params);
              break;
            default:
              throw new Error("Invalid comparison type");
          }
          
          console.log("✅ Comparison report generated:", data);
        }
      }


      setReportData(data);
      alert("✅ تم توليد التقرير بنجاح!\n\nReport generated successfully!");
    } catch (error) {
      console.error("❌ Error generating report:", error);
      
      // Enhanced error logging for seasonal reports
      if (reportType === "seasonal") {
        console.error("❌ SEASONAL REPORT ERROR DETAILS:", {
          message: error.message,
          stack: error.stack,
          filters: filters,
          reportScope: reportScope
        });
      }
      
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

    // Add organization filters for monthly reports
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

    // Add orgunit_id and orgunit_type for seasonal reports (Backend V2 format)
    if (reportType === "seasonal") {
      let orgunit_id = null;
      let orgunit_type;

      if (reportScope.level === "hospital") {
        orgunit_id = hierarchy?.hospital_id || 1;
        orgunit_type = 0;
      } else if (reportScope.level === "administration") {
        if (reportScope.administrationIds.length > 0) {
          orgunit_id = reportScope.administrationIds[0];
        } else {
          orgunit_id = hierarchy?.hospital_id || 1;
        }
        orgunit_type = 1;
      } else if (reportScope.level === "department") {
        if (reportScope.departmentIds.length > 0) {
          orgunit_id = reportScope.departmentIds[0];
        } else {
          orgunit_id = hierarchy?.hospital_id || 1;
        }
        orgunit_type = 2;
      } else if (reportScope.level === "section") {
        if (reportScope.sectionIds.length > 0) {
          orgunit_id = reportScope.sectionIds[0];
        } else {
          orgunit_id = hierarchy?.hospital_id || 1;
        }
        orgunit_type = 3;
      }

      payload.filters.orgunit_id = orgunit_id;
      payload.filters.orgunit_type = orgunit_type;
    }

    return payload;
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
      const result = await exportReport({ 
        report_type: reportType, 
        format: "docx", 
        filters: payload.filters 
      });
      
      downloadBlob(result.blob, result.filename);
      
      if (result.isZip) {
        alert(
          `تم تصدير التقرير بنجاح!\n\nReport export successful!\n\n` +
          `File: ${result.filename}\n\n` +
          `ZIP Contents:\n`  +
          `- Regular seasonal report\n` +
          `- Comparison report with charts\n` +
          `${reportScope.level !== 'hospital' && reportScope.level !== 'section' ? '- Summary report (multi-unit)\n' : ''}\n` +
          `Extract the ZIP file to view all documents.`
        );
      } else if (result.isMultiExport) {
        alert(`تم تصدير Word بنجاح!\n\nMulti-file Word export successful!\n\nFile: ${result.filename}`);
      } else {
        alert("تم تصدير Word بنجاح!\n\nWord export successful!");
      }
    } catch (error) {
      console.error("Word export error:", error);
      alert("فشل التصدير\n\nExport failed: " + error.message);
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
              background: theme.gradients.primary,
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
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
          selectedSeasons={selectedSeasons}
          setSelectedSeasons={setSelectedSeasons}
          availableQuarters={availableQuarters}
          getRequiredSeasonCount={getRequiredSeasonCount}
          getSelectedQuarterNames={getSelectedQuarterNames}
        />

        {/* Report Generation Summary */}
        <Card
          sx={{
            mb: 3,
            p: 3,
            background: "linear-gradient(135deg, rgba(43, 188, 196, 0.08) 0%, rgba(100, 167, 11, 0.08) 100%)",
            border: "2px solid rgba(43, 188, 196, 0.2)",
          }}
        >
          <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: theme.colors.primary }}>
            📊 ملخص التقرير (Report Summary)
          </Typography>
          
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            {/* Report Type */}
            <Box>
              <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
                📄 نوع التقرير
              </Typography>
              <Typography level="title-md" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                {reportType === "monthly" ? "📅 شهري (Monthly)" : "🍃 فصلي (Seasonal)"}
              </Typography>
            </Box>

            {/* Report Mode (Monthly only) */}
            {reportType === "monthly" && (
              <Box>
                <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
                  📊 الوضع
                </Typography>
                <Typography level="title-md" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                  {filters.mode === "detailed" ? "📋 تفصيلي (Detailed)" : "🔢 رقمي (Numeric)"}
                </Typography>
              </Box>
            )}

            {/* Period */}
            <Box>
              <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
                📆 الفترة
              </Typography>
              <Typography level="title-md" sx={{ fontWeight: 700, color: theme.colors.primary }}>
                {filters.dateMode === "month" && filters.month && filters.year && (
                  `${filters.month}/${filters.year}`
                )}
                {filters.dateMode === "trimester" && filters.trimester && filters.year && (
                  <>
                    {filters.trimester === "Q1" && "الفصل الأول - Q1"}
                    {filters.trimester === "Q2" && "الفصل الثاني - Q2"}
                    {filters.trimester === "Q3" && "الفصل الثالث - Q3"}
                    {filters.trimester === "Q4" && "الفصل الرابع - Q4"}
                    {" "}
                    {filters.year}
                  </>
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
              <Typography level="title-md" sx={{ fontWeight: 700, color: theme.colors.primary }}>
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
              background: "rgba(43, 188, 196, 0.05)",
              borderRadius: "8px",
              border: "1px dashed rgba(43, 188, 196, 0.3)",
            }}
          >
            <Typography level="body-sm" sx={{ color: theme.colors.primary, fontWeight: 600 }}>
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
            background: "linear-gradient(135deg, rgba(43, 188, 196, 0.05) 0%, rgba(100, 167, 11, 0.05) 100%)",
            borderRadius: "8px",
            border: "1px solid rgba(43, 188, 196, 0.2)",
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700, color: theme.colors.primary, mb: 1 }}>
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
