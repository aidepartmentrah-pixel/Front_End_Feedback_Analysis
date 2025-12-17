// src/components/dashboard/GlobalDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Modal, ModalDialog, Typography, Sheet } from "@mui/joy";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import Top5ClassificationChart from "./Top5ClassificationChart";
import StageHistogram from "./StageHistogram";
import IssuingDeptBarGraph from "./IssuingDeptBarGraph";
import RecentActivityFeed from "./RecentActivityFeed";

// Mock data for global view
const mockGlobalData = {
  metrics: {
    totalIncidents: 124,
    uniquePatients: 89,
    openClosed: { open: 32, closed: 92, forciblyClosed: 12 },
    severityBreakdown: { high: 15, medium: 50, low: 59 },
    domainBreakdown: { clinical: 65, management: 35, relational: 24 },
    redFlags: 8
  },
  trends: {
    incidentsPatients: { value: 12, direction: "up" },
    openClosed: { value: 5, direction: "down" },
    severity: { value: 8, direction: "up" },
    domain: { value: 3, direction: "up" },
    redFlags: { value: 15, direction: "down" }
  },
  charts: {
    top5Classification: [
      { classification: "Neglect - General", count: 30 },
      { classification: "Absent Communication", count: 25 },
      { classification: "Accommodation", count: 20 },
      { classification: "Bureaucracy", count: 15 },
      { classification: "Clinical Delay", count: 10 }
    ],
    stageHistogram: [
      { stage: "Admission", count: 40 },
      { stage: "Care", count: 60 },
      { stage: "Discharge", count: 24 }
    ],
    issuingDept: [
      { department: "ER", count: 50 },
      { department: "ICU", count: 30 },
      { department: "Ward 1", count: 20 },
      { department: "Ward 2", count: 24 }
    ]
  },
  recentActivity: [
    {
      timestamp: new Date(Date.now() - 5 * 60000),
      description: "Patient fall incident in Ward 3 - Neglect reported",
      severity: "High",
      status: "Open"
    },
    {
      timestamp: new Date(Date.now() - 15 * 60000),
      description: "Medication delay in ICU - Clinical process issue",
      severity: "Medium",
      status: "Pending"
    },
    {
      timestamp: new Date(Date.now() - 45 * 60000),
      description: "Communication gap during shift handover",
      severity: "Low",
      status: "Closed"
    },
    {
      timestamp: new Date(Date.now() - 120 * 60000),
      description: "Equipment malfunction in ER - Urgent attention needed",
      severity: "High",
      status: "Open"
    },
    {
      timestamp: new Date(Date.now() - 180 * 60000),
      description: "Administrative delay in patient discharge process",
      severity: "Medium",
      status: "Closed"
    }
  ]
};

const GlobalDashboardStats = () => {
  const { metrics, trends, charts, recentActivity } = mockGlobalData;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", data: [] });

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
