// src/pages/InvestigationPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Select,
  Option,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import IncidentCountTree from "../components/investigation/IncidentCountTree";
import { fetchDashboardHierarchy } from "../api/dashboard";
import { fetchInvestigationTree, fetchSeasons } from "../api/investigation";

const InvestigationPage = () => {
  // Season selection state - now uses season_id from API
  const [selectedSeason, setSelectedSeason] = useState("");
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  
  // Other filters
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTreeType, setSelectedTreeType] = useState("incident_count");

  // Hierarchy state
  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // Investigation tree data state
  const [treeData, setTreeData] = useState(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState(null);

  // Fetch seasons on mount
  useEffect(() => {
    console.log("🔄 Fetching available seasons...");
    fetchSeasons()
      .then((data) => {
        setAvailableSeasons(data.seasons || []);
        // Set current season as default
        if (data.current_season) {
          setSelectedSeason(data.current_season);
          console.log("✅ Default season set to:", data.current_season);
        }
      })
      .catch((error) => {
        console.error("❌ Failed to load seasons:", error);
        // Fallback to empty - user will need to select manually
      })
      .finally(() => setLoadingSeasons(false));
  }, []);

  // Fetch hierarchy on mount
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => setHierarchy(data))
      .catch((error) => console.error("Failed to load hierarchy:", error))
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // Fetch investigation tree when filters change
  useEffect(() => {
    console.log("=== INVESTIGATION PAGE STATE ===");
    console.log("🔄 Filter state changed:", {
      selectedSeason,
      selectedAdmin,
      selectedDept,
      selectedSection,
      selectedTreeType,
    });
    
    // Validate required fields before fetching
    if (!selectedSeason || !selectedTreeType) {
      console.warn("⚠️ Missing required fields (season or tree type), skipping fetch");
      if (!selectedSeason) {
        setTreeError("Please select a season");
      }
      return;
    }

    console.log("🔄 Fetching investigation tree data...");
    setLoadingTree(true);
    setTreeError(null);

    // Use season_id directly from the API
    const seasonId = selectedSeason;
    console.log("📅 Using season ID:", seasonId);

    // Convert empty strings to null for optional IDs
    const administrationId = selectedAdmin && selectedAdmin !== "" ? selectedAdmin : null;
    const departmentId = selectedDept && selectedDept !== "" ? selectedDept : null;
    const sectionId = selectedSection && selectedSection !== "" ? selectedSection : null;

    console.log("📦 Prepared parameters for API call:", {
      season: seasonId,
      tree_type: selectedTreeType,
      administration_id: administrationId,
      department_id: departmentId,
      section_id: sectionId,
    });

    fetchInvestigationTree({
      season: seasonId,
      tree_type: selectedTreeType,
      administration_id: administrationId,
      department_id: departmentId,
      section_id: sectionId,
    })
      .then((data) => {
        console.log("✅ Investigation tree loaded successfully:", data);
        setTreeData(data);
      })
      .catch((error) => {
        console.error("❌ Failed to load investigation tree:", error);
        setTreeError(error.message);
      })
      .finally(() => {
        setLoadingTree(false);
        console.log("=================================");
      });
  }, [selectedSeason, selectedAdmin, selectedDept, selectedSection, selectedTreeType]);

  // Tree type options (updated to match API naming)
  const treeTypes = [
    { value: "incident_count", label: "Number of Incidents" },
    { value: "domain_distribution_numbers", label: "Domain Distribution (Numbers)" },
    { value: "domain_distribution_percentage", label: "Domain Distribution (Percentage)" },
    { value: "severity_distribution_numbers", label: "Severity Distribution (Numbers)" },
    { value: "severity_distribution_percentage", label: "Severity Distribution (Percentage)" },
    { value: "red_flag_incidents", label: "Red Flag Incident" },
    { value: "never_event_incidents", label: "Never Event Incident" },
  ];

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
            🔍 Root Cause Investigation
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Exploratory analysis tool to understand why departments crossed policy
            thresholds. Analyze incident patterns and concentrations across the organizational structure.
          </Typography>
        </Box>

        {/* Top Controls */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🎯 Investigation Scope
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Season Selector - Dynamic from API */}
            <FormControl>
              <FormLabel sx={{ fontWeight: 600 }}>📅 Season</FormLabel>
              <Select
                value={selectedSeason}
                onChange={(e, newValue) => setSelectedSeason(newValue)}
                size="lg"
                disabled={loadingSeasons}
                placeholder={loadingSeasons ? "Loading seasons..." : "Select Season"}
              >
                {availableSeasons.map((season) => (
                  <Option key={season.season_id} value={season.season_id}>
                    {season.season_label}
                    {season.is_current && " (Current)"}
                  </Option>
                ))}
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
                disabled={loadingHierarchy}
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
                📍 Section
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

        {/* Tree Type Selector */}
        <Card variant="soft" sx={{ p: 3, mb: 4 }}>
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 700 }}>
            🌳 Visualization Type
          </Typography>
          <FormControl>
            <Select
              value={selectedTreeType}
              onChange={(e, newValue) => setSelectedTreeType(newValue)}
              size="lg"
            >
              {treeTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Card>

        {/* Investigation Tree */}
        {loadingTree && (
          <Card sx={{ p: 4, textAlign: "center", mb: 3 }}>
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ mt: 2 }}>
              Loading investigation tree...
            </Typography>
          </Card>
        )}

        {treeError && (
          <Card sx={{ p: 3, mb: 3, bgcolor: "danger.softBg" }}>
            <Typography color="danger" sx={{ fontWeight: 600, mb: 1 }}>
              ❌ Error loading investigation tree
            </Typography>
            <Typography level="body-sm" color="danger" sx={{ mb: 2 }}>
              {treeError}
            </Typography>
            {treeError.includes("not found") && (
              <Typography level="body-xs" sx={{ color: "#991b1b", fontStyle: "italic" }}>
                💡 Tip: The selected season may not have data in the database. Try selecting a different season or year that has recorded incidents.
              </Typography>
            )}
          </Card>
        )}

        {!loadingTree && !treeError && treeData && (
          <IncidentCountTree 
            data={treeData}
            selectedAdmin={selectedAdmin} 
            selectedDept={selectedDept}
            selectedSection={selectedSection}
            treeType={selectedTreeType}
          />
        )}

        {/* Footer Note */}
        <Card variant="soft" sx={{ mt: 4, p: 3, bgcolor: "#fef3c7" }}>
          <Typography level="body-sm" sx={{ color: "#92400e", textAlign: "center" }}>
            💡 <strong>Note:</strong> This page is for exploratory analysis only.
            For acceptance decisions and formal reporting, please refer to the
            Seasonal Reports page.
          </Typography>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default InvestigationPage;
