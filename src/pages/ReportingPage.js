// src/pages/ReportingPage.js
import React, { useState, useMemo } from "react";
import { Box, Typography, Alert } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";

// Components
import ReportTypeSwitch from "../components/reports/ReportTypeSwitch";
import ReportFilters from "../components/reports/ReportFilters";
import ThresholdInput from "../components/reports/ThresholdInput";
import MonthlyDetailedTable from "../components/reports/MonthlyDetailedTable";
import MonthlyNumericTable from "../components/reports/MonthlyNumericTable";
import SeasonalSummary from "../components/reports/SeasonalSummary";
import SeasonalOpenRecordsHCATTable from "../components/reports/SeasonalOpenRecordsHCATTable";
import ReportActions from "../components/reports/ReportActions";

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
  // Report type: monthly or seasonal
  const [reportType, setReportType] = useState("monthly");

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

        {/* Filters */}
        <ReportFilters filters={filters} setFilters={setFilters} reportType={reportType} />

        {/* Threshold Settings - Only for Seasonal Reports */}
        {reportType === "seasonal" && (
          <ThresholdInput
            threshold={threshold}
            setThreshold={setThreshold}
          />
        )}

        {/* Data Summary */}
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

        {/* Monthly Reports */}
        {reportType === "monthly" && (
          <>
            {filters.mode === "detailed" && (
              <MonthlyDetailedTable complaints={filteredComplaints} />
            )}
            {filters.mode === "numeric" && (
              <MonthlyNumericTable stats={monthlyStats} />
            )}
          </>
        )}

        {/* Seasonal Reports */}
        {reportType === "seasonal" && (
          <>
            {/* Seasonal Summary */}
            <SeasonalSummary stats={seasonalStats} threshold={threshold} filters={filters} />

            {/* HCAT-Structured Preview Table */}
            <SeasonalOpenRecordsHCATTable groupedData={seasonalGroupedData} />
          </>
        )}

        {/* Action Buttons */}
        <ReportActions
          onRefresh={handleRefresh}
          onResetFilters={handleResetFilters}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
        />

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
