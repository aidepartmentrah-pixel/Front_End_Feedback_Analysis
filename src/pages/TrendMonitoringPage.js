// src/pages/TrendMonitoringPage.js
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Divider, Button, Card, CircularProgress, Select, Option, FormControl, FormLabel } from "@mui/joy";
import theme from '../theme';
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MainLayout from "../components/common/MainLayout";
import DomainTrendChart from "../components/trendMonitoring/DomainTrendChart";
import DomainTrendTable from "../components/trendMonitoring/DomainTrendTable";
import CategoryTrendChart from "../components/trendMonitoring/CategoryTrendChart";
import CategoryTrendTable from "../components/trendMonitoring/CategoryTrendTable";
import { fetchTrendsByScope } from "../api/trends";
import { fetchDashboardHierarchy } from "../api/dashboard";
import { fetchReferenceData } from "../api/insertRecord";

const TrendMonitoringPage = () => {
  const navigate = useNavigate();
  
  // Scope selection
  const [scope, setScope] = useState("hospital");
  
  // Hierarchy state - copied from InvestigationPage
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  
  // Trends data
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reference data for category names
  const [referenceData, setReferenceData] = useState(null);

  // ============================
  // LOAD HIERARCHY - copied from InvestigationPage
  // ============================
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((error) => console.error("Failed to load hierarchy:", error))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // ============================
  // LOAD REFERENCE DATA FOR CATEGORY NAMES
  // ============================
  useEffect(() => {
    const loadAllCategories = async () => {
      try {
        const refData = await fetchReferenceData();
        console.log("✅ Reference data loaded:", refData);
        
        // Fetch all categories from all domains
        const allCategories = [];
        if (refData.domains && Array.isArray(refData.domains)) {
          for (const domain of refData.domains) {
            try {
              const { fetchCategories } = await import("../api/insertRecord");
              const categories = await fetchCategories(domain.id);
              allCategories.push(...categories);
            } catch (err) {
              console.warn(`Could not load categories for domain ${domain.id}:`, err);
            }
          }
        }
        
        console.log("✅ All categories loaded:", allCategories);
        setReferenceData({
          ...refData,
          allCategories
        });
      } catch (error) {
        console.error("❌ Failed to load reference data:", error);
      }
    };
    
    loadAllCategories();
  }, []);

  // ============================
  // HELPER FUNCTIONS - copied from InvestigationPage
  // ============================
  const getDepartments = () => {
    if (!selectedAdmin || !hierarchy) {
      return [];
    }
    return hierarchy.Department?.[selectedAdmin] || [];
  };

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
  // FETCH TRENDS BY SCOPE
  // ============================
  useEffect(() => {
    console.log("🔄 Fetching trends for scope:", scope);
    setLoading(true);
    setError(null);

    // Build params with hierarchy IDs - copied from InvestigationPage
    const params = { scope };
    
    if (scope === "administration" || scope === "department" || scope === "section") {
      if (selectedAdmin && selectedAdmin !== "") {
        params.administration_id = selectedAdmin;
      } else {
        setLoading(false);
        return; // Wait for administration selection
      }
    }

    if (scope === "department" || scope === "section") {
      if (selectedDept && selectedDept !== "") {
        params.department_id = selectedDept;
      } else {
        setLoading(false);
        return; // Wait for department selection
      }
    }

    if (scope === "section") {
      if (selectedSection && selectedSection !== "") {
        params.section_id = selectedSection;
      } else {
        setLoading(false);
        return; // Wait for section selection
      }
    }

    fetchTrendsByScope(params)
      .then((data) => {
        console.log("✅ Trends loaded successfully:", data);
        console.log("✅ Category trend data:", data.category);
        setTrendsData(data);
      })
      .catch((err) => {
        console.error("❌ Failed to load trends:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [scope, selectedAdmin, selectedDept, selectedSection]);



  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Header */}
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
            📊 Trend Monitoring
          </Typography>
        </Box>

        {/* Hierarchy Selection - copied from InvestigationPage */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Trend Monitoring Scope
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
              <FormLabel sx={{ fontWeight: 600 }}>Scope Level</FormLabel>
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
                <Option value="administration">📋 الإدارة</Option>
                <Option value="department">🏢 الدائرة</Option>
                <Option value="section">📌 القسم</Option>
              </Select>
            </FormControl>

            {/* Administration Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📋 الإدارة
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
                    {admin.nameEn}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Department Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                🏢 الدائرة
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
                    {dept.nameEn}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Section Selector */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>
                📌 القسم
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
                    {section.nameEn}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Display time range if data is loaded */}
        {trendsData?.time_range && (
          <Typography level="body-sm" sx={{ color: "#999", mb: 3 }}>
            📅 {trendsData.time_range.start} to {trendsData.time_range.end}
          </Typography>
        )}

        {/* Loading State */}
        {loading && (
          <Card sx={{ p: 4, textAlign: "center", mb: 3 }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>
              Loading trend data...
            </Typography>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "danger.softBg" }}>
            <Typography color="danger">
              ❌ Error loading trends: {error}
            </Typography>
          </Card>
        )}

        {/* Domain Trends Section */}
        {!loading && !error && trendsData?.domain && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: theme.colors.primary, fontWeight: 700 }}>
              🔬 Domain Trends (Clinical, Management, Relational)
            </Typography>
            <DomainTrendChart data={trendsData.domain} />
            <DomainTrendTable data={trendsData.domain} />
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Category Trends Section */}
        {!loading && !error && trendsData?.category && (
          <Box sx={{ mb: 5 }}>
            <Typography level="h4" sx={{ mb: 2, color: theme.colors.primary, fontWeight: 700 }}>
              📑 Category Trends
            </Typography>
            <CategoryTrendChart data={trendsData.category} referenceData={referenceData} />
            <CategoryTrendTable data={trendsData.category} referenceData={referenceData} />
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default TrendMonitoringPage;
