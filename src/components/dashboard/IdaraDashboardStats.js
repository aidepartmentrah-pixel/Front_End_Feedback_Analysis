// src/components/dashboard/IdaraDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Modal, ModalDialog, Typography, Sheet } from "@mui/joy";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import Top5ClassificationChart from "./Top5ClassificationChart";
import StageHistogram from "./StageHistogram";
import IssuingDeptBarGraph from "./IssuingDeptBarGraph";
import RecentActivityFeed from "./RecentActivityFeed";

const IdaraDashboardStats = ({ idara, stats, loading }) => {
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

  const recentActivity = stats?.recentActivity || [];

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
                <Top5ClassificationChart 
                  data={charts.top5Classification}
                  onBarClick={(item) => handleChartClick("classification", item)}
                />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Stage Histogram">
                <StageHistogram 
                  data={charts.stageHistogram}
                  onBarClick={(item) => handleChartClick("stage", item)}
                />
              </ChartCard>
            </Grid>
            <Grid xs={12} md={4}>
              <ChartCard title="Issuing Department">
                <IssuingDeptBarGraph 
                  data={charts.issuingDept}
                  onBarClick={(item) => handleChartClick("department", item)}
                />
              </ChartCard>
            </Grid>
          </Grid>

          {/* Recent Activity Feed */}
          <RecentActivityFeed incidents={recentActivity} />
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
