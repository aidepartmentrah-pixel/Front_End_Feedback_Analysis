// src/components/dashboard/DayraDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Modal, ModalDialog, Typography, Sheet } from "@mui/joy";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import Top5ClassificationChart from "./Top5ClassificationChart";
import StageHistogram from "./StageHistogram";
import RecentActivityFeed from "./RecentActivityFeed";

const DayraDashboardStats = ({ dayra, stats, loading }) => {
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
    stageHistogram: []
  };

  const recentActivity = stats?.recentActivity || [];

  // Skip the old mock data object
const _oldMockData = {
  emergency_nursing: {
    metrics: {
      totalIncidents: 28,
      uniquePatients: 22,
      openClosed: { open: 8, closed: 20, forciblyClosed: 3 },
      severityBreakdown: { high: 4, medium: 12, low: 12 },
      domainBreakdown: { clinical: 18, management: 6, relational: 4 },
      redFlags: 2
    },
    trends: {
      incidentsPatients: { value: 10, direction: "up" },
      openClosed: { value: 8, direction: "down" },
      severity: { value: 4, direction: "up" },
      domain: { value: 2, direction: "up" },
      redFlags: { value: 33, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Triage Delay", count: 8 },
        { classification: "Patient Fall", count: 6 },
        { classification: "Medication Error", count: 5 },
        { classification: "Communication Gap", count: 4 },
        { classification: "Documentation Issue", count: 3 }
      ],
      stageHistogram: [
        { stage: "Admission", count: 18 },
        { stage: "Care", count: 8 },
        { stage: "Discharge", count: 2 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 8 * 60000),
        description: "Triage delay - Multiple patients waiting assessment",
        severity: "High",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 35 * 60000),
        description: "Patient fall in ER corridor - Elderly patient",
        severity: "Medium",
        status: "Pending"
      }
    ]
  },
  icu_nursing: {
    metrics: {
      totalIncidents: 20,
      uniquePatients: 18,
      openClosed: { open: 5, closed: 15, forciblyClosed: 2 },
      severityBreakdown: { high: 3, medium: 9, low: 8 },
      domainBreakdown: { clinical: 14, management: 4, relational: 2 },
      redFlags: 1
    },
    trends: {
      incidentsPatients: { value: 5, direction: "down" },
      openClosed: { value: 15, direction: "down" },
      severity: { value: 2, direction: "down" },
      domain: { value: 1, direction: "down" },
      redFlags: { value: 50, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Ventilator Issue", count: 6 },
        { classification: "Medication Error", count: 5 },
        { classification: "Equipment Failure", count: 4 },
        { classification: "Documentation Gap", count: 3 },
        { classification: "Communication Issue", count: 2 }
      ],
      stageHistogram: [
        { stage: "Admission", count: 4 },
        { stage: "Care", count: 14 },
        { stage: "Discharge", count: 2 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 18 * 60000),
        description: "Ventilator alarm response delayed - Bed 4",
        severity: "High",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 95 * 60000),
        description: "Equipment failure resolved - Monitor replaced",
        severity: "Medium",
        status: "Closed"
      }
    ]
  },
  ward_nursing: {
    metrics: {
      totalIncidents: 20,
      uniquePatients: 17,
      openClosed: { open: 5, closed: 15, forciblyClosed: 2 },
      severityBreakdown: { high: 1, medium: 7, low: 12 },
      domainBreakdown: { clinical: 13, management: 5, relational: 2 },
      redFlags: 1
    },
    trends: {
      incidentsPatients: { value: 7, direction: "up" },
      openClosed: { value: 10, direction: "down" },
      severity: { value: 3, direction: "down" },
      domain: { value: 1, direction: "up" },
      redFlags: { value: 0, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Patient Fall", count: 6 },
        { classification: "Medication Delay", count: 5 },
        { classification: "Call Bell Response", count: 4 },
        { classification: "Hygiene Issue", count: 3 },
        { classification: "Food Quality", count: 2 }
      ],
      stageHistogram: [
        { stage: "Admission", count: 2 },
        { stage: "Care", count: 15 },
        { stage: "Discharge", count: 3 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 12 * 60000),
        description: "Patient fall in bathroom - Ward 3 Room 205",
        severity: "Medium",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 70 * 60000),
        description: "Call bell response time improved after shift change",
        severity: "Low",
        status: "Closed"
      }
    ]
  }
};

  const handleChartClick = (chartType, item) => {
    let title = "";
    let data = [];

    if (chartType === "classification") {
      title = `Incidents: ${item.classification}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Trend", value: "Stable" },
        { label: "Avg. Severity", value: "Medium" },
        { label: "Resolution Rate", value: "75%" }
      ];
    } else if (chartType === "stage") {
      title = `Stage Analysis: ${item.stage}`;
      data = [
        { label: "Total Count", value: item.count },
        { label: "Most Common Issue", value: "Workflow Gap" },
        { label: "Pending", value: Math.floor(item.count * 0.2) },
        { label: "Avg. Response Time", value: "2.5 hours" }
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
        <Grid xs={12} md={6}>
          <ChartCard title="Top 5 Classifications">
            <Top5ClassificationChart 
              data={charts.top5Classification}
              onBarClick={(item) => handleChartClick("classification", item)}
            />
          </ChartCard>
        </Grid>
        <Grid xs={12} md={6}>
          <ChartCard title="Stage Histogram">
            <StageHistogram 
              data={charts.stageHistogram}
              onBarClick={(item) => handleChartClick("stage", item)}
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

export default DayraDashboardStats;
