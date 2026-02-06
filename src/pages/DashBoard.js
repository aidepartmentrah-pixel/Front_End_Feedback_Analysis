// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { fetchDashboardHierarchy, fetchDashboardStats } from "../api/dashboard";
import theme from '../theme';

import { Box, Card, Typography, Select, Option, FormControl, FormLabel } from "@mui/joy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Components
import MainLayout from "../components/common/MainLayout";
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
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

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


// Fetch hierarchy on mount - copied from InvestigationPage
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((error) => console.error("Failed to load hierarchy:", error))
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

    // Add IDs based on scope - using IDs directly like InvestigationPage
    if (scope === "administration" || scope === "department" || scope === "section") {
      if (selectedAdmin && selectedAdmin !== "") {
        params.administration_id = selectedAdmin;
        console.log("📍 Selected Administration ID:", params.administration_id);
      } else {
        return; // Wait for administration selection
      }
    }

    if (scope === "department" || scope === "section") {
      if (selectedDept && selectedDept !== "") {
        params.department_id = selectedDept;
        console.log("📍 Selected Department ID:", params.department_id);
      } else {
        return; // Wait for department selection
      }
    }

    if (scope === "section") {
      if (selectedSection && selectedSection !== "") {
        params.section_id = selectedSection;
        console.log("📍 Selected Section ID:", params.section_id);
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
          administration: selectedAdmin,
          department: selectedDept,
          section: selectedSection
        });
        setStatsError(error.message);
      })
      .finally(() => setLoadingStats(false));
  }, [scope, selectedAdmin, selectedDept, selectedSection, dateRange, chartModes]);

  // ============================
  // HELPER FUNCTIONS - copied from InvestigationPage
  // ============================
  // Department options (filtered by selected administration)
  const getDepartments = () => {
    if (!selectedAdmin || !hierarchy) {
      return [];
    }
    return hierarchy.Department?.[selectedAdmin] || [];
  };

  // Section options (filtered by selected department)
  const getSections = () => {
    if (!selectedDept || !hierarchy) {
      return [];
    }
    return hierarchy.Section?.[selectedDept] || [];
  };

  const handleAdminChange = (event, newValue) => {
    setSelectedAdmin(newValue);
    setSelectedDept("");
    setSelectedSection("");
  };

  const handleDeptChange = (event, newValue) => {
    setSelectedDept(newValue);
    setSelectedSection("");
  };

  // ============================
  // VIEW FLAGS
  // ============================
  const isGlobalView = scope === "hospital";
  const isIdaraView = scope === "administration" && selectedAdmin;
  const isDayraView = scope === "department" && selectedDept;
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

        {/* Hierarchy Selection - copied from InvestigationPage */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Dashboard Scope
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Scope Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>Dashboard Level</FormLabel>
              <Select
                value={scope}
                onChange={(e, newValue) => {
                  setScope(newValue);
                  setSelectedAdmin("");
                  setSelectedDept("");
                  setSelectedSection("");
                }}
                size="lg"
              >
                <Option value="hospital">🏥 Hospital</Option>
                <Option value="administration">📋 Administration</Option>
                <Option value="department">🏢 Department</Option>
                <Option value="section">📌 Section</Option>
              </Select>
            </FormControl>

            {/* Administration Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📋 Administration
              </FormLabel>
              <Select
                value={selectedAdmin}
                onChange={handleAdminChange}
                size="lg"
                disabled={loadingHierarchy || scope === "hospital"}
              >
                <Option value="">All Administrations</Option>
                {(hierarchy?.Administration || []).map((admin) => (
                  <Option key={admin.id} value={admin.id}>
                    {admin.nameAr} ({admin.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Department Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                🏢 Department
              </FormLabel>
              <Select
                value={selectedDept}
                onChange={handleDeptChange}
                size="lg"
                disabled={!selectedAdmin || loadingHierarchy}
              >
                <Option value="">All Departments</Option>
                {getDepartments().map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.nameAr} ({dept.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Section Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📌 Section
              </FormLabel>
              <Select
                value={selectedSection}
                onChange={(e, newValue) => setSelectedSection(newValue)}
                size="lg"
                disabled={!selectedDept || loadingHierarchy}
              >
                <Option value="">All Sections</Option>
                {getSections().map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.nameAr} ({section.nameEn})
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Dashboard Title */}
        <DashboardTitle
          scope={scope}
          selectedAdministration={selectedAdmin ? hierarchy?.Administration?.find(a => a.id === selectedAdmin) : null}
          selectedDepartment={selectedDept ? getDepartments().find(d => d.id === selectedDept) : null}
          selectedSection={selectedSection ? getSections().find(s => s.id === selectedSection) : null}
          hierarchy={hierarchy}
        />

        {/* Conditional Dashboard Views */}
        {isGlobalView && <GlobalDashboardStats stats={dashboardStats} loading={loadingStats} chartModes={chartModes} setChartModes={setChartModes} chartTypes={chartTypes} setChartTypes={setChartTypes} />}
        {isIdaraView && <IdaraDashboardStats idara={hierarchy?.Administration?.find(a => a.id === selectedAdmin)} stats={dashboardStats} loading={loadingStats} />}
        {isDayraView && <DayraDashboardStats dayra={getDepartments().find(d => d.id === selectedDept)} stats={dashboardStats} loading={loadingStats} />}
        {isQismView && <QismDashboardStats qism={getSections().find(s => s.id === selectedSection)} stats={dashboardStats} loading={loadingStats} />}

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
                <Typography level="h5" sx={{ fontWeight: 700, color: theme.colors.primary, mb: 0.5 }}>
                  📊 عرض تحليل الاتجاهات (View Trend Analysis)
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666" }}>
                  تتبع الاتجاهات الشهرية لاكتشاف أنماط التدهور والتحسين
                </Typography>
              </Box>
              <ArrowForwardIcon sx={{ fontSize: "32px", color: theme.colors.primary }} />
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
