// src/components/dashboard/GlobalDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Modal, ModalDialog, Typography, Sheet, Button, Select, Option, IconButton, Menu, MenuItem } from "@mui/joy";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import UniversalChart from "./UniversalChart";
import RecentActivityFeed from "./RecentActivityFeed";
import TuneIcon from "@mui/icons-material/Tune";

const GlobalDashboardStats = ({ stats, loading, chartModes = {}, setChartModes = () => {}, chartTypes = {}, setChartTypes = () => {} }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", data: [] });
  const [chartMenuAnchor, setChartMenuAnchor] = useState({
    classification: null,
    stage: null,
    department: null
  });

  // Default chart modes
  const modes = {
    classification_mode: chartModes.classification_mode || "top5",
    stage_mode: chartModes.stage_mode || "histogram",
    department_mode: chartModes.department_mode || "issuing"
  };

  // Default chart types
  const types = {
    classification: chartTypes.classification || "bar",
    stage: chartTypes.stage || "bar",
    department: chartTypes.department || "bar"
  };

  const handleModeChange = (key, value) => {
    setChartModes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTypeChange = (key, value) => {
    setChartTypes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Debug logging to understand response structure
  React.useEffect(() => {
    if (stats) {
      console.log("🔍 GlobalDashboardStats received stats:", stats);
      console.log("🔍 Stats structure:", {
        hasMetrics: !!stats.metrics,
        hasTrends: !!stats.trends,
        hasCharts: !!stats.charts,
        hasRecentActivity: !!stats.recentActivity,
        metricsKeys: stats.metrics ? Object.keys(stats.metrics) : [],
        trendsKeys: stats.trends ? Object.keys(stats.trends) : [],
        chartsKeys: stats.charts ? Object.keys(stats.charts) : [],
      });
    }
  }, [stats]);

  // Use real API data if available, otherwise use mock data
  // Map new API response structure to component expectations
  // API returns FLAT metrics structure: {totalIncidents, uniquePatients, openClosed: {open, closed, forciblyClosed}, severityBreakdown, domainBreakdown, redFlags}
  const metrics = {
    totalIncidents: stats?.metrics?.totalIncidents || stats?.totalIncidents || 0,
    uniquePatients: stats?.metrics?.uniquePatients || stats?.uniquePatients || 0,
    openClosed: {
      open: stats?.metrics?.openClosed?.open || stats?.openClosed?.open || 0,
      closed: stats?.metrics?.openClosed?.closed || stats?.openClosed?.closed || 0,
      forciblyClosed: stats?.metrics?.openClosed?.forciblyClosed || stats?.openClosed?.forciblyClosed || 0,
    },
    severityBreakdown: stats?.metrics?.severityBreakdown || stats?.severityBreakdown || { high: 0, medium: 0, low: 0 },
    domainBreakdown: stats?.metrics?.domainBreakdown || stats?.domainBreakdown || { clinical: 0, management: 0, relational: 0 },
    redFlags: stats?.metrics?.redFlags || stats?.redFlags || 0,
  };

  // Trends may be partial from API, provide defaults
  const trends = {
    incidentsPatients: stats?.trends?.incidentsPatients || { value: 0, direction: "neutral" },
    openClosed: stats?.trends?.openClosed || { value: 0, direction: "neutral" },
    severity: stats?.trends?.severity || { value: 0, direction: "neutral" },
    domain: stats?.trends?.domain || { value: 0, direction: "neutral" },
    redFlags: stats?.trends?.redFlags || { value: 0, direction: "neutral" },
  };

  const charts = {
    top5Classification: (() => {
      const classifData = stats?.charts?.classification;
      // Handle both array and object with data property
      const dataArray = Array.isArray(classifData) ? classifData : (classifData?.data || []);
      // Spread to avoid mutating original data
      return [...(dataArray || [])]
        .filter(item => {
          const name = item.name || item.classification || "";
          return !name.toLowerCase().includes("unknown");
        });
    })(),
    stageHistogram: (() => {
      const stageData = stats?.charts?.stage;
      // Handle both array and object with data property
      const dataArray = Array.isArray(stageData) ? stageData : (stageData?.data || []);
      // Spread to avoid mutating original data
      return [...(dataArray || [])];
    })(),
    issuingDept: (() => {
      const deptData = stats?.charts?.department;
      // Handle both array and object with data property
      const dataArray = Array.isArray(deptData) ? deptData : (deptData?.data || []);
      // Spread to avoid mutating original data, then sort
      return [...(dataArray || [])]
        .sort((a, b) => (b.count || 0) - (a.count || 0)); // Sort from highest to lowest
    })(),
  };

  // recentActivity uses timestamp (not date) and numeric severity/status
  const recentActivity = (stats?.recentActivity || []).map(item => ({
    ...item,
    date: item.timestamp || item.date, // Add date field for RecentActivityFeed compatibility
    caseID: item.caseID || item.id || "N/A",
  }));

  console.log("📊 Mapped metrics:", metrics);
  console.log("📈 Mapped trends:", trends);
  console.log("📉 Mapped charts:", charts);

  const handleChartClick = (chartType, item) => {
    let title = "";
    let data = [];

    if (chartType === "classification") {
      title = `Incidents: ${item.classification}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Department", value: "ER, ICU, Ward 1" },
        { label: "Avg. Severity", value: "Medium" },
        { label: "Status", value: "32% Open, 68% Closed" }
      ];
    } else if (chartType === "stage") {
      title = `Stage Analysis: ${item.stage}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Most Common Issue", value: "Communication Gap" },
        { label: "Red Flags", value: "2" },
        { label: "Avg. Resolution Time", value: "4.5 days" }
      ];
    } else if (chartType === "department") {
      title = `Department Details: ${item.department}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Most Common", value: "Clinical Delay" },
        { label: "Open Cases", value: Math.floor(item.count * 0.3) },
        { label: "High Severity", value: Math.floor(item.count * 0.2) }
      ];
    }

    setModalContent({ title, data });
    setModalOpen(true);
  };

  return (
    <Box>
      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>Loading statistics...</Typography>
        </Box>
      )}

      {!loading && (
        <>
          {/* Metrics Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6} md={2.4}>
              <MetricCard 
                title="Total Incidents / Patients" 
                value={`${metrics.totalIncidents} / ${metrics.uniquePatients}`} 
                color="#667eea"
                trend={trends.incidentsPatients}
              />
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Open / Closed / Forcibly Closed"
                value={`${metrics.openClosed.open} / ${metrics.openClosed.closed} / ${metrics.openClosed.forciblyClosed}`}
                color="#ff4757"
                trend={trends.openClosed}
              />
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Severity"
                value={`H:${metrics.severityBreakdown.high} M:${metrics.severityBreakdown.medium} L:${metrics.severityBreakdown.low}`}
                color="#ffa502"
                trend={trends.severity}
              />
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Domain"
                value={`C:${metrics.domainBreakdown.clinical} M:${metrics.domainBreakdown.management} R:${metrics.domainBreakdown.relational}`}
                color="#2ed573"
                trend={trends.domain}
              />
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Red Flags"
                value={metrics.redFlags}
                color="#ff4757"
                trend={trends.redFlags}
              />
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} md={4}>
              <ChartCard title="Top 5 Classifications">
                <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    size="sm"
                    onClick={(e) => setChartMenuAnchor(prev => ({ ...prev, classification: e.currentTarget }))}
                    sx={{ bgcolor: "transparent", border: "1px solid #ddd", borderRadius: "4px" }}
                  >
                    <TuneIcon sx={{ fontSize: "20px" }} />
                  </IconButton>
                  <Menu
                    anchorEl={chartMenuAnchor.classification}
                    open={Boolean(chartMenuAnchor.classification)}
                    onClose={() => setChartMenuAnchor(prev => ({ ...prev, classification: null }))}
                    placement="bottom-end"
                  >
                    {["bar", "pie", "donut", "line"].map(type => (
                      <MenuItem
                        key={type}
                        selected={types.classification === type}
                        onClick={() => {
                          handleTypeChange("classification", type);
                          setChartMenuAnchor(prev => ({ ...prev, classification: null }));
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
                <UniversalChart 
                  data={charts.top5Classification}
                  type={types.classification}
                  height={450}
                  layout={types.classification === "bar" ? "horizontal" : "vertical"}
                  onBarClick={(item) => handleChartClick("classification", item)}
                />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Stage Histogram">
                <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    size="sm"
                    onClick={(e) => setChartMenuAnchor(prev => ({ ...prev, stage: e.currentTarget }))}
                    sx={{ bgcolor: "transparent", border: "1px solid #ddd", borderRadius: "4px" }}
                  >
                    <TuneIcon sx={{ fontSize: "20px" }} />
                  </IconButton>
                  <Menu
                    anchorEl={chartMenuAnchor.stage}
                    open={Boolean(chartMenuAnchor.stage)}
                    onClose={() => setChartMenuAnchor(prev => ({ ...prev, stage: null }))}
                    placement="bottom-end"
                  >
                    {["bar", "pie", "donut", "line"].map(type => (
                      <MenuItem
                        key={type}
                        selected={types.stage === type}
                        onClick={() => {
                          handleTypeChange("stage", type);
                          setChartMenuAnchor(prev => ({ ...prev, stage: null }));
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
                <UniversalChart 
                  data={charts.stageHistogram}
                  type={types.stage}
                  height={450}
                  layout={types.stage === "bar" ? "horizontal" : "vertical"}
                  onBarClick={(item) => handleChartClick("stage", item)}
                />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Issuing Department">
                <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    size="sm"
                    onClick={(e) => setChartMenuAnchor(prev => ({ ...prev, department: e.currentTarget }))}
                    sx={{ bgcolor: "transparent", border: "1px solid #ddd", borderRadius: "4px" }}
                  >
                    <TuneIcon sx={{ fontSize: "20px" }} />
                  </IconButton>
                  <Menu
                    anchorEl={chartMenuAnchor.department}
                    open={Boolean(chartMenuAnchor.department)}
                    onClose={() => setChartMenuAnchor(prev => ({ ...prev, department: null }))}
                    placement="bottom-end"
                  >
                    {["bar", "pie", "donut", "line"].map(type => (
                      <MenuItem
                        key={type}
                        selected={types.department === type}
                        onClick={() => {
                          handleTypeChange("department", type);
                          setChartMenuAnchor(prev => ({ ...prev, department: null }));
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
                <UniversalChart 
                  data={charts.issuingDept}
                  type={types.department}
                  height={450}
                  layout={types.department === "bar" ? "horizontal" : "vertical"}
                  onBarClick={(item) => handleChartClick("department", item)}
                />
              </ChartCard>
            </Grid>
          </Grid>

          {/* Recent Activity Feed */}
          <RecentActivityFeed recentActivity={recentActivity} />
        </>
      )}

      {/* Modal for Chart Details */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: 500,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
            {modalContent.title}
          </Typography>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: "sm",
              p: 2,
            }}
          >
            {modalContent.data.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 1.5,
                  borderBottom: index < modalContent.data.length - 1 ? "1px solid #eee" : "none",
                }}
              >
                <Typography level="body-sm" sx={{ fontWeight: 600, color: "#555" }}>
                  {item.label}:
                </Typography>
                <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Sheet>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default GlobalDashboardStats;
