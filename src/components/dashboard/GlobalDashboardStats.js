// src/components/dashboard/GlobalDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Modal, ModalDialog, Typography, Sheet, Button, Select, Option, IconButton, Menu, MenuItem } from "@mui/joy";
import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import ChartCard from "./ChartCard";
import UniversalChart from "./UniversalChart";
import TuneIcon from "@mui/icons-material/Tune";
import BarChartIcon from "@mui/icons-material/BarChart";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useAuth } from "../../context/AuthContext";

const GlobalDashboardStats = ({ stats, loading, operationalSummary = null, chartModes = {}, setChartModes = () => {}, chartTypes = {}, setChartTypes = () => {} }) => {
  const { hasRole } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", data: [] });
  const [chartMenuAnchor, setChartMenuAnchor] = useState({
    classification: null,
    stage: null,
    department: null,
    severity: null,
    harm: null,
    category: null,
    subcategory: null,
    domain: null,
    riskType: null,
  });

  // Default chart modes
  const modes = {
    classification_mode: chartModes.classification_mode || "top5",
    stage_mode: chartModes.stage_mode || "histogram",
    department_mode: chartModes.department_mode || "issuing"
  };

  // Default chart types - distributed across bar/line/donut so the dashboard
  // doesn't look monotonous; still user-switchable via the per-chart menu.
  const types = {
    classification: chartTypes.classification || "bar",
    stage: chartTypes.stage || "line",
    department: chartTypes.department || "bar",
    severity: chartTypes.severity || "donut",
    harm: chartTypes.harm || "donut",
    category: chartTypes.category || "line",
    subcategory: chartTypes.subcategory || "bar",
    domain: chartTypes.domain || "bar",
    riskType: chartTypes.riskType || "bar",
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
    neverEvents: stats?.metrics?.neverEvents || stats?.neverEvents || 0,
    ordinary: stats?.metrics?.ordinary || stats?.ordinary || 0,
    noticeCount: stats?.metrics?.noticeCount || 0,
  };

  // Trends may be partial from API, provide defaults
  const trends = {
    incidentsPatients: stats?.trends?.incidentsPatients || { value: 0, direction: "neutral" },
    openClosed: stats?.trends?.openClosed || { value: 0, direction: "neutral" },
    severity: stats?.trends?.severity || { value: 0, direction: "neutral" },
    domain: stats?.trends?.domain || { value: 0, direction: "neutral" },
    redFlags: stats?.trends?.redFlags || { value: 0, direction: "neutral" },
    neverEvents: stats?.trends?.neverEvents || { value: 0, direction: "neutral" },
    ordinary: stats?.trends?.ordinary || { value: 0, direction: "neutral" },
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
    severity: [...(stats?.charts?.severity?.data || [])],
    harm: [...(stats?.charts?.harm?.data || [])],
    category: [...(stats?.charts?.category?.data || [])],
    subcategory: [...(stats?.charts?.subcategory?.data || [])],
    domain: [
      { name: "Clinical", count: metrics.domainBreakdown?.clinical || 0 },
      { name: "Management", count: metrics.domainBreakdown?.management || 0 },
      { name: "Relational", count: metrics.domainBreakdown?.relational || 0 },
    ],
    riskType: [
      { name: "Ordinary", count: metrics.ordinary || 0 },
      { name: "Red Flag", count: metrics.redFlags || 0 },
      { name: "Never Event", count: metrics.neverEvents || 0 },
    ],
  };

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

  // Reusable chart card: title + type-switcher menu (bar/pie/donut/line) + UniversalChart
  const renderChartCard = (key, title, data, onBarClick) => (
    <ChartCard title={title}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <IconButton
          size="sm"
          onClick={(e) => setChartMenuAnchor(prev => ({ ...prev, [key]: e.currentTarget }))}
          sx={{ bgcolor: "transparent", border: "1px solid #ddd", borderRadius: "4px" }}
        >
          <TuneIcon sx={{ fontSize: "20px" }} />
        </IconButton>
        <Menu
          anchorEl={chartMenuAnchor[key]}
          open={Boolean(chartMenuAnchor[key])}
          onClose={() => setChartMenuAnchor(prev => ({ ...prev, [key]: null }))}
          placement="bottom-end"
        >
          {["bar", "pie", "donut", "line"].map(type => (
            <MenuItem
              key={type}
              selected={types[key] === type}
              onClick={() => {
                handleTypeChange(key, type);
                setChartMenuAnchor(prev => ({ ...prev, [key]: null }));
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <UniversalChart
        data={data}
        type={types[key]}
        height={450}
        layout={types[key] === "bar" ? "horizontal" : "vertical"}
        onBarClick={onBarClick}
        total={metrics.totalIncidents}
      />
    </ChartCard>
  );

  return (
    <Box>
      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>Loading statistics...</Typography>
        </Box>
      )}

      {!loading && (
        <>
          {/* ── Section 1: Operational Overview ── */}
          <DashboardSection title="Operational Overview" icon={<BarChartIcon />} accentColor="#667eea">
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <MetricCard
                  title="Total Incidents / Patients"
                  value={`${metrics.totalIncidents} / ${metrics.uniquePatients}`}
                  color="#667eea"
                  subtitle="All cases"
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard
                  title="Open Cases"
                  value={operationalSummary?.open_cases ?? 0}
                  color="#2ed573"
                  subtitle="Active cases"
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard
                  title="Closed Cases"
                  value={operationalSummary?.closed_cases ?? 0}
                  color="#667eea"
                  subtitle="Resolved cases"
                />
              </Grid>
            </Grid>
          </DashboardSection>

          {/* ── Section 2: Quality Indicators ── */}
          <DashboardSection title="Quality Indicators" icon={<HealthAndSafetyIcon />} accentColor="#a29bfe">
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <MetricCard
                  title="Severity"
                  color="#ffa502"
                  rows={[
                    { label: "High",   value: metrics.severityBreakdown.high,   color: "#ff4757" },
                    { label: "Medium", value: metrics.severityBreakdown.medium, color: "#ffa502" },
                    { label: "Low",    value: metrics.severityBreakdown.low,    color: "#2ed573" },
                  ]}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard
                  title="Domain"
                  color="#2ed573"
                  rows={[
                    { label: "Clinical",    value: metrics.domainBreakdown.clinical,    color: "#667eea" },
                    { label: "Management",  value: metrics.domainBreakdown.management,  color: "#a29bfe" },
                    { label: "Relational",  value: metrics.domainBreakdown.relational,  color: "#00cec9" },
                  ]}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard
                  title="Ordinary / Red Flag / Never Event"
                  color="#ff4757"
                  rows={[
                    { label: "Ordinary",     value: metrics.ordinary,    color: "#2ed573" },
                    { label: "Red Flag",     value: metrics.redFlags,    color: "#ff4757" },
                    { label: "Never Event",  value: metrics.neverEvents, color: "#ff4757" },
                  ]}
                />
              </Grid>
            </Grid>
          </DashboardSection>

          {/* ── Section 3: Workflow Health ── */}
          {(() => {
            const forceClosed  = operationalSummary?.force_closed_cases ?? 0;
            const overdueCount = operationalSummary?.currently_overdue  ?? 0;
            const forcePct     = metrics.totalIncidents > 0
              ? Math.round((forceClosed / metrics.totalIncidents) * 100)
              : 0;
            return (
              <DashboardSection title="Workflow Health" icon={<MonitorHeartIcon />} accentColor="#fd79a8">
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {[
                    <MetricCard key="late"    title="Late Replies"       value={operationalSummary?.late_replies ?? 0}  color="#ffa502" subtitle="Cases awaiting response" />,
                    <MetricCard key="force"   title="Force Closed"       value={forceClosed}  color="#ff4757" subtitle={`${forcePct}% of total cases`} badge={forceClosed > 0 ? "Requires review" : null} />,
                    <MetricCard key="overdue" title="Currently Overdue"  value={overdueCount} color={overdueCount > 0 ? "#ff4757" : "#2ed573"} subtitle={overdueCount > 0 ? "Past due cases" : "On track"} />,
                    <MetricCard key="extra"   title="Extra Time Granted" value={operationalSummary?.extra_time_granted ?? 0} color="#2ed573" subtitle="Cases with extended time" />,
                    <MetricCard key="notices" title="Notices"            value={metrics.noticeCount} color="#00cec9" subtitle="System notices" />,
                  ].map((card, i) => (
                    <Box key={i} sx={{ flex: "1 1 160px", minWidth: 0 }}>{card}</Box>
                  ))}
                </Box>
              </DashboardSection>
            );
          })()}

          {/* Charts Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} md={4}>
              {renderChartCard("classification", "Top 5 Classifications", charts.top5Classification, (item) => handleChartClick("classification", item))}
            </Grid>
            <Grid xs={12} md={4}>
              {renderChartCard("stage", "Stage Histogram", charts.stageHistogram, (item) => handleChartClick("stage", item))}
            </Grid>
            {!hasRole("SECTION_ADMIN") && (
              <Grid xs={12} md={4}>
                {renderChartCard("department", "Issuing Department", charts.issuingDept, (item) => handleChartClick("department", item))}
              </Grid>
            )}
            <Grid xs={12} md={4}>
              {renderChartCard("severity", "Severity Distribution", charts.severity)}
            </Grid>
            <Grid xs={12} md={4}>
              {renderChartCard("harm", "Harm Distribution", charts.harm)}
            </Grid>
            <Grid xs={12} md={4}>
              {renderChartCard("category", "Category Distribution", charts.category)}
            </Grid>
            <Grid xs={12} md={4}>
              {renderChartCard("subcategory", "Subcategory Distribution", charts.subcategory)}
            </Grid>
            <Grid xs={12} md={4}>
              {renderChartCard("domain", "Domain Distribution", charts.domain)}
            </Grid>
            <Grid xs={12} md={4}>
              {renderChartCard("riskType", "Ordinary / Red Flag / Never Event", charts.riskType)}
            </Grid>
          </Grid>

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
