// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { fetchDashboardHierarchy, fetchDashboardStats } from "../api/dashboard";

import { Box, Card, Typography } from "@mui/joy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Components
import MainLayout from "../components/common/MainLayout";
import DepartmentSelector from "../components/dashboard/DepartmentSelector";
import DashboardTitle from "../components/dashboard/DashboardTitle";
import GlobalDashboardStats from "../components/dashboard/GlobalDashboardStats";
import IdaraDashboardStats from "../components/dashboard/IdaraDashboardStats";
import DayraDashboardStats from "../components/dashboard/DayraDashboardStats";
import QismDashboardStats from "../components/dashboard/QismDashboardStats";
import DashboardActions from "../components/dashboard/DashboardActions";

const DashboardPage = () => {
// ============================
  // STATE
  // ============================
  const [scope, setScope] = useState("hospital");
  const [selectedAdministration, setSelectedAdministration] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);
  
  // Date range for stats (defaults to last 30 days)
  const [dateRange, setDateRange] = useState({
    start_date: null, // Will default to 30 days ago on backend
    end_date: null,   // Will default to today on backend
  });

  // Chart mode selections
  const [chartModes, setChartModes] = useState({
    classification_mode: "top5", // top5, bottom5, all, byDomain
    stage_mode: "histogram",     // histogram, bySeverity, byDomain, byStatus
    department_mode: "issuing"   // issuing, responsible, patient, caseManager
  });

  // Chart visualization types
  const [chartTypes, setChartTypes] = useState({
    classification: "bar",  // bar, pie, donut, line
    stage: "bar",           // bar, pie, donut, line
    department: "bar"       // bar, pie, donut, line
  });


useEffect(() => {
  fetch("/api/dashboard/hierarchy")
    .catch((error) => {
      alert(`Failed to load department hierarchy: ${error.message}`);
    })
    .finally(() => setLoadingHierarchy(false));
}, []);

  // ============================
  // FETCH DASHBOARD STATS
  // ============================
  useEffect(() => {
    // Build params based on current scope
    const params = {
      scope,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      // Add chart modes
      classification_mode: chartModes.classification_mode,
      stage_mode: chartModes.stage_mode,
      department_mode: chartModes.department_mode,
    };

    // Add IDs based on scope
    if (scope === "administration" || scope === "department" || scope === "section") {
      if (selectedAdministration) {
        // Ensure we're sending the ID as a number if it's numeric
        const adminId = selectedAdministration.id;
        params.administration_id = isNaN(adminId) ? adminId : Number(adminId);
        console.log("📍 Selected Administration:", selectedAdministration, "ID:", params.administration_id);
      } else {
        return; // Wait for administration selection
      }
    }

    if (scope === "department" || scope === "section") {
      if (selectedDepartment) {
        // Ensure we're sending the ID as a number if it's numeric
        const deptId = selectedDepartment.id;
        params.department_id = isNaN(deptId) ? deptId : Number(deptId);
        console.log("📍 Selected Department:", selectedDepartment, "ID:", params.department_id);
      } else {
        return; // Wait for department selection
      }
    }

    if (scope === "section") {
      if (selectedSection) {
        // Ensure we're sending the ID as a number if it's numeric
        const sectionId = selectedSection.id;
        params.section_id = isNaN(sectionId) ? sectionId : Number(sectionId);
        console.log("📍 Selected Section:", selectedSection, "ID:", params.section_id);
      } else {
        return; // Wait for section selection
      }
    }

    console.log("🔄 Fetching dashboard stats with params:", params);
    setLoadingStats(true);
    setStatsError(null);

    fetchDashboardStats(params)
      .then((data) => {
        console.log("✅ Dashboard stats loaded successfully:", data);
        setDashboardStats(data);
      })
      .catch((error) => {
        console.error("❌ Failed to load dashboard stats:", error);
        console.error("❌ Error details - Scope:", scope, "Selected:", {
          administration: selectedAdministration,
          department: selectedDepartment,
          section: selectedSection
        });
        setStatsError(error.message);
      })
      .finally(() => setLoadingStats(false));
  }, [scope, selectedAdministration, selectedDepartment, selectedSection, dateRange, chartModes]);

  // ============================
  // VIEW FLAGS
  // ============================
  const isGlobalView = scope === "hospital";
  const isIdaraView = scope === "administration" && selectedAdministration;
  const isDayraView = scope === "department" && selectedDepartment;
  const isQismView = scope === "section" && selectedSection;

  return (
    <MainLayout>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Loading states */}
        {loadingHierarchy && (
          <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
            <Typography>Loading department hierarchy...</Typography>
          </Card>
        )}

        {loadingStats && !loadingHierarchy && (
          <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
            <Typography>Loading dashboard statistics...</Typography>
          </Card>
        )}

        {statsError && (
          <Card sx={{ p: 3, mb: 3, textAlign: "center", bgcolor: "danger.softBg" }}>
            <Typography color="danger">Error loading stats: {statsError}</Typography>
          </Card>
        )}

        {/* Simplified Cascading Selector */}
        <DepartmentSelector
          scope={scope}
          setScope={setScope}
          selectedAdministration={selectedAdministration}
          setSelectedAdministration={setSelectedAdministration}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          hierarchy={hierarchy} // 👈 Pass real hierarchy data
        />

        {/* Simplified Dashboard Title */}
        <DashboardTitle
          scope={scope}
          selectedAdministration={selectedAdministration}
          selectedDepartment={selectedDepartment}
          selectedSection={selectedSection}
          hierarchy={hierarchy} // 👈 Pass real hierarchy data
        />

        {/* Conditional Dashboard Views */}
        {isGlobalView && <GlobalDashboardStats stats={dashboardStats} loading={loadingStats} chartModes={chartModes} setChartModes={setChartModes} chartTypes={chartTypes} setChartTypes={setChartTypes} />}
        {isIdaraView && <IdaraDashboardStats idara={selectedAdministration} stats={dashboardStats} loading={loadingStats} />}
        {isDayraView && <DayraDashboardStats dayra={selectedDepartment} stats={dashboardStats} loading={loadingStats} />}
        {isQismView && <QismDashboardStats qism={selectedSection} stats={dashboardStats} loading={loadingStats} />}

        {/* Dashboard Actions */}
        <Box sx={{ mt: 3 }}>
          <DashboardActions />
        </Box>

        {/* Trend Monitoring Link */}
        <Box sx={{ mt: 3 }}>
          <Card
            sx={{
              p: 2.5,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              border: "2px solid rgba(102, 126, 234, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.2)",
              },
            }}
            onClick={() => window.location.href = "/trend-monitoring"}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea", mb: 0.5 }}>
                  📊 عرض تحليل الاتجاهات (View Trend Analysis)
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666" }}>
                  تتبع الاتجاهات الشهرية لاكتشاف أنماط التدهور والتحسين
                </Typography>
              </Box>
              <ArrowForwardIcon sx={{ fontSize: "32px", color: "#667eea" }} />
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
