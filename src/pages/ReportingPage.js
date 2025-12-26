// src/pages/ReportingPage.js
import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography, Alert } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import { fetchDashboardHierarchy } from "../api/dashboard";

// Components
import ReportTypeSwitch from "../components/reports/ReportTypeSwitch";
import ExportScopeToggle from "../components/reports/ExportScopeToggle";
import ReportFilters from "../components/reports/ReportFilters";
import ThresholdInput from "../components/reports/ThresholdInput";
import MonthlyDetailedTable from "../components/reports/MonthlyDetailedTable";
import MonthlyNumericTable from "../components/reports/MonthlyNumericTable";
import SeasonalDetailedView from "../components/reports/SeasonalDetailedView";
import ReportActions from "../components/reports/ReportActions";
import BulkExportTable from "../components/reports/BulkExportTable";

// Data and helpers
import { mockComplaints } from "../data/mockReportData";
import {
  filterComplaintsByDate,
  filterComplaintsByDepartment,
  calculateMonthlyStats,
  calculateSeasonalStats,
  groupByHCATStructure,
} from "../utils/reportHelpers";

const ReportingPage = () => {
  // Hierarchy state
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Fetch hierarchy on mount
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((error) => console.error("Failed to load hierarchy:", error))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // Report type: monthly or seasonal
  const [reportType, setReportType] = useState("monthly");

  // Export scope: single or bulk
  const [exportScope, setExportScope] = useState("single");

  // Filters state
  const [filters, setFilters] = useState({
    dateMode: "month", // "range", "month", or "trimester"
    fromDate: "",
    toDate: "",
    month: "1",
    trimester: "",
    year: "2025",
    building: "",
    idara: "",
    dayra: "",
    qism: "",
    mode: "detailed", // "detailed" or "numeric" for monthly reports
  });

  // Threshold setting for seasonal reports (always "all domains")
  const [threshold, setThreshold] = useState("10");

  // Mock department counts for bulk export
  const mockDepartmentCounts = [
    { id: 1, name: "Cardiac 1", nameAr: "قسم القلب 1", count: 45 },
    { id: 2, name: "Cardiac 2", nameAr: "قسم القلب 2", count: 32 },
    { id: 3, name: "ICU", nameAr: "وحدة العناية المركزة", count: 23 },
    { id: 4, name: "Emergency", nameAr: "قسم الطوارئ", count: 67 },
    { id: 5, name: "Radiology", nameAr: "قسم الأشعة", count: 12 },
    { id: 6, name: "Laboratory", nameAr: "قسم المختبر", count: 8 },
    { id: 7, name: "Pharmacy", nameAr: "قسم الصيدلية", count: 5 },
    { id: 8, name: "Neurology", nameAr: "قسم الأعصاب", count: 0 },
    { id: 9, name: "Orthopedics", nameAr: "قسم العظام", count: 18 },
    { id: 10, name: "Pediatrics", nameAr: "قسم الأطفال", count: 0 },
  ];

  // Initial filters for reset
  const initialFilters = {
    dateMode: "month",
    fromDate: "",
    toDate: "",
    month: "1",
    trimester: "",
    year: "2025",
    building: "",
    idara: "",
    dayra: "",
    qism: "",
    mode: "detailed",
  };

  // Filter complaints based on current filters
  const filteredComplaints = useMemo(() => {
    let filtered = [...mockComplaints];
    
    // Apply date filters
    filtered = filterComplaintsByDate(filtered, filters);
    
    // Apply department filters
    filtered = filterComplaintsByDepartment(filtered, filters);
    
    return filtered;
  }, [filters]);

  // Calculate statistics for monthly reports
  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(filteredComplaints);
  }, [filteredComplaints]);

  // Calculate seasonal statistics (open records and clinical threshold)
  const seasonalStats = useMemo(() => {
    if (reportType !== "seasonal") return { totalOpen: 0, clinicalCount: 0, clinicalPercentage: 0, openRecords: [] };
    return calculateSeasonalStats(filteredComplaints);
  }, [reportType, filteredComplaints]);

  // Group data by HCAT structure for seasonal preview table
  const seasonalGroupedData = useMemo(() => {
    if (reportType !== "seasonal") return [];
    return groupByHCATStructure(filteredComplaints);
  }, [reportType, filteredComplaints]);

  // Handle refresh
  const handleRefresh = () => {
    alert("🔄 تم تحديث البيانات!\n\nفي النظام الحقيقي، سيتم جلب البيانات من الخادم.");
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setThreshold("10");
    alert("✅ تم إعادة تعيين الفلاتر إلى القيم الافتراضية.");
  };

  // Handle PDF export
  const handleExportPDF = () => {
    alert("📄 تصدير PDF\n\nسيتم توليد تقرير PDF باللغة العربية مع جميع النماذج المطلوبة.");
  };

  // Handle CSV export
  const handleExportCSV = () => {
    alert("📊 تصدير CSV\n\nسيتم تصدير البيانات إلى ملف CSV.");
  };

  // Get current period label for bulk export
  const getCurrentPeriod = () => {
    if (reportType === "monthly") {
      const months = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
      const monthIndex = parseInt(filters.month) - 1;
      return `${months[monthIndex]} ${filters.year}`;
    } else {
      // Seasonal
      if (filters.dateMode === "trimester" && filters.trimester) {
        return `${filters.trimester} ${filters.year}`;
      }
      return `Q4 ${filters.year}`; // default
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
            📊 نظام التقارير (Hospital Reporting System)
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            تقارير شهرية تفصيلية/رقمية وتحليل HCAT الفصلي مع تتبع العتبات
          </Typography>
        </Box>

        {/* Report Type Switch */}
        <ReportTypeSwitch reportType={reportType} setReportType={setReportType} />

        {/* Export Scope Toggle */}
        <ExportScopeToggle scope={exportScope} setScope={setExportScope} />

        {/* Filters - Only show if Single Report */}
        {exportScope === "single" && (
          <>
            <ReportFilters 
              filters={filters} 
              setFilters={setFilters} 
              reportType={reportType}
              hierarchy={hierarchy}
              loadingHierarchy={loadingHierarchy}
            />

            {/* Threshold Settings - Only for Seasonal Reports */}
            {reportType === "seasonal" && (
              <ThresholdInput
                threshold={threshold}
                setThreshold={setThreshold}
              />
            )}
          </>
        )}

        {/* Data Summary - Only for Single Report */}
        {exportScope === "single" && (
          <Alert
            sx={{
              mb: 3,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              borderColor: "rgba(102, 126, 234, 0.3)",
              color: "#667eea",
            }}
          >
            📊 تم العثور على <strong>{filteredComplaints.length}</strong> شكوى تطابق الفلاتر المحددة
          </Alert>
        )}

        {/* Single Report Mode */}
        {exportScope === "single" && (
          <Box sx={{ minHeight: "700px" }}>
            {/* Monthly Reports */}
            {reportType === "monthly" && (
              <Box sx={{ minHeight: "700px", maxWidth: "100%", overflow: "hidden" }}>
                {filters.mode === "detailed" && (
                  <MonthlyDetailedTable complaints={filteredComplaints} />
                )}
                {filters.mode === "numeric" && (
                  <MonthlyNumericTable stats={monthlyStats} />
                )}
              </Box>
            )}

            {/* Seasonal Reports */}
            {reportType === "seasonal" && (
              <Box sx={{ minHeight: "700px", maxWidth: "100%", overflow: "hidden" }}>
                <SeasonalDetailedView 
                  complaints={filteredComplaints} 
                  threshold={threshold}
                  filters={filters}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Bulk Export Mode */}
        {exportScope === "bulk" && (
          <Box sx={{ minHeight: "700px" }}>
            <BulkExportTable 
              reportType={reportType} 
              period={getCurrentPeriod()} 
              departmentCounts={mockDepartmentCounts}
            />
          </Box>
        )}

        {/* Action Buttons - Always visible for consistency */}
        {exportScope === "single" && (
          <ReportActions
            onRefresh={handleRefresh}
            onResetFilters={handleResetFilters}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
          />
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
