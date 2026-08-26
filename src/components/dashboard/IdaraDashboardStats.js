// src/components/dashboard/IdaraDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Modal, ModalDialog, Typography, Sheet } from "@mui/joy";
import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import ChartCard from "./ChartCard";
import Top5ClassificationChart from "./Top5ClassificationChart";
import StageHistogram from "./StageHistogram";
import IssuingDeptBarGraph from "./IssuingDeptBarGraph";
import UniversalChart from "./UniversalChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useAuth } from "../../context/AuthContext";

const IdaraDashboardStats = ({ idara, stats, loading, operationalSummary = null }) => {
  const { hasRole } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", data: [] });

  // Use real API data if available, otherwise use default empty data
  const metrics = stats?.metrics || {
    totalIncidents: 0,
    uniquePatients: 0,
    openClosed: { open: 0, closed: 0, forciblyClosed: 0 },
    severityBreakdown: { high: 0, medium: 0, low: 0 },
    domainBreakdown: { clinical: 0, management: 0, relational: 0 },
    redFlags: 0
  };

  const trends = stats?.trends || {
    incidentsPatients: { value: 0, direction: "neutral" },
    openClosed: { value: 0, direction: "neutral" },
    severity: { value: 0, direction: "neutral" },
    domain: { value: 0, direction: "neutral" },
    redFlags: { value: 0, direction: "neutral" }
  };

  const charts = stats?.charts || {
    top5Classification: [],
    stageHistogram: [],
    issuingDept: []
  };

  // Distribution histograms (Session 5) - read directly off the backend response
  const distributionCharts = {
    severity: stats?.charts?.severity?.data || [],
    harm: stats?.charts?.harm?.data || [],
    category: stats?.charts?.category?.data || [],
    subcategory: stats?.charts?.subcategory?.data || [],
  };

  // Domain and clinical risk type breakdowns are metrics-only from the API;
  // shape them into chart-ready {name, count} arrays here.
  const domainChartData = [
    { name: "Clinical", count: metrics.domainBreakdown?.clinical || 0 },
    { name: "Management", count: metrics.domainBreakdown?.management || 0 },
    { name: "Relational", count: metrics.domainBreakdown?.relational || 0 },
  ];
  const riskTypeChartData = [
    { name: "Ordinary", count: metrics.ordinary || 0 },
    { name: "Red Flag", count: metrics.redFlags || 0 },
    { name: "Never Event", count: metrics.neverEvents || 0 },
  ];

  const handleChartClick = (chartType, item) => {
    let title = "";
    let data = [];

    if (chartType === "classification") {
      title = `Incidents: ${item.classification}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Department", value: "Multiple" },
        { label: "Avg. Severity", value: "Medium" },
        { label: "Status", value: "35% Open, 65% Closed" }
      ];
    } else if (chartType === "stage") {
      title = `Stage Analysis: ${item.stage}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Most Common Issue", value: "Process Gap" },
        { label: "Red Flags", value: "1" },
        { label: "Avg. Resolution Time", value: "3.2 days" }
      ];
    } else if (chartType === "department") {
      title = `Department Details: ${item.department}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Most Common", value: "Workflow Issue" },
        { label: "Open Cases", value: Math.floor(item.count * 0.25) },
        { label: "High Severity", value: Math.floor(item.count * 0.15) }
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
          {/* ── Section 1: Operational Overview ── */}
          <DashboardSection title="Operational Overview" icon={<BarChartIcon />} accentColor="#667eea">
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <MetricCard title="Total Incidents / Patients" value={`${metrics.totalIncidents} / ${metrics.uniquePatients}`} color="#667eea" subtitle="All cases" />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Open Cases" value={operationalSummary?.open_cases ?? 0} color="#2ed573" subtitle="Active cases" />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Closed Cases" value={operationalSummary?.closed_cases ?? 0} color="#667eea" subtitle="Resolved cases" />
              </Grid>
            </Grid>
          </DashboardSection>

          {/* ── Section 2: Quality Indicators ── */}
          <DashboardSection title="Quality Indicators" icon={<HealthAndSafetyIcon />} accentColor="#a29bfe">
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <MetricCard title="Severity" color="#ffa502" rows={[
                  { label: "High",   value: metrics.severityBreakdown?.high   ?? 0, color: "#ff4757" },
                  { label: "Medium", value: metrics.severityBreakdown?.medium ?? 0, color: "#ffa502" },
                  { label: "Low",    value: metrics.severityBreakdown?.low    ?? 0, color: "#2ed573" },
                ]} />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Domain" color="#2ed573" rows={[
                  { label: "Clinical",   value: metrics.domainBreakdown?.clinical   ?? 0, color: "#667eea" },
                  { label: "Management", value: metrics.domainBreakdown?.management ?? 0, color: "#a29bfe" },
                  { label: "Relational", value: metrics.domainBreakdown?.relational ?? 0, color: "#00cec9" },
                ]} />
              </Grid>
              <Grid xs={12} sm={4}>
                <MetricCard title="Ordinary / Red Flag / Never Event" color="#ff4757" rows={[
                  { label: "Ordinary",    value: metrics.ordinary    ?? 0, color: "#2ed573" },
                  { label: "Red Flag",    value: metrics.redFlags    ?? 0, color: "#ff4757" },
                  { label: "Never Event", value: metrics.neverEvents ?? 0, color: "#ff4757" },
                ]} />
              </Grid>
            </Grid>
          </DashboardSection>

          {/* ── Section 3: Workflow Health ── */}
          {(() => {
            const forceClosed  = operationalSummary?.force_closed_cases ?? 0;
            const overdueCount = operationalSummary?.currently_overdue  ?? 0;
            const forcePct     = metrics.totalIncidents > 0 ? Math.round((forceClosed / metrics.totalIncidents) * 100) : 0;
            return (
              <DashboardSection title="Workflow Health" icon={<MonitorHeartIcon />} accentColor="#fd79a8">
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {[
                    <MetricCard key="late"    title="Late Replies"       value={operationalSummary?.late_replies ?? 0} color="#ffa502" subtitle="Cases awaiting response" />,
                    <MetricCard key="force"   title="Force Closed"       value={forceClosed}  color="#ff4757" subtitle={`${forcePct}% of total cases`} badge={forceClosed > 0 ? "Requires review" : null} />,
                    <MetricCard key="overdue" title="Currently Overdue"  value={overdueCount} color={overdueCount > 0 ? "#ff4757" : "#2ed573"} subtitle={overdueCount > 0 ? "Past due cases" : "On track"} />,
                    <MetricCard key="extra"   title="Extra Time Granted" value={operationalSummary?.extra_time_granted ?? 0} color="#2ed573" subtitle="Cases with extended time" />,
                    <MetricCard key="notices" title="Notices"            value={metrics?.noticeCount ?? 0} color="#00cec9" subtitle="System notices" />,
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
              <ChartCard title="Top 5 Classifications">
                <Top5ClassificationChart
                  data={stats?.charts?.classification?.data || []}
                  onBarClick={(item) => handleChartClick("classification", item)}
                  total={metrics.totalIncidents}
                />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Stage Histogram">
                <StageHistogram
                  data={charts.stageHistogram}
                  onBarClick={(item) => handleChartClick("stage", item)}
                  total={metrics.totalIncidents}
                />
              </ChartCard>
            </Grid>
            {!hasRole("SECTION_ADMIN") && (
              <Grid xs={12} md={4}>
                <ChartCard title="Issuing Department">
                  <IssuingDeptBarGraph
                    data={charts.issuingDept}
                    onBarClick={(item) => handleChartClick("department", item)}
                    total={metrics.totalIncidents}
                  />
                </ChartCard>
              </Grid>
            )}
            <Grid xs={12} md={4}>
              <ChartCard title="Severity Distribution">
                <UniversalChart data={distributionCharts.severity} type="donut" height={350} />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Harm Distribution">
                <UniversalChart data={distributionCharts.harm} type="donut" height={350} />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Category Distribution">
                <UniversalChart data={distributionCharts.category} type="line" height={350} />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Subcategory Distribution">
                <UniversalChart data={distributionCharts.subcategory} type="bar" height={350} layout="horizontal" total={metrics.totalIncidents} />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Domain Distribution">
                <UniversalChart data={domainChartData} type="bar" height={350} layout="horizontal" total={metrics.totalIncidents} />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Ordinary / Red Flag / Never Event">
                <UniversalChart data={riskTypeChartData} type="bar" height={350} layout="horizontal" total={metrics.totalIncidents} />
              </ChartCard>
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

export default IdaraDashboardStats;
