// src/components/dashboard/IdaraDashboardStats.js
import React, { useState } from "react";
import { Grid, Box, Modal, ModalDialog, Typography, Sheet } from "@mui/joy";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import Top5ClassificationChart from "./Top5ClassificationChart";
import StageHistogram from "./StageHistogram";
import IssuingDeptBarGraph from "./IssuingDeptBarGraph";
import RecentActivityFeed from "./RecentActivityFeed";

// Mock data for administration-level view
const mockIdaraData = {
  nursing: {
    metrics: {
      totalIncidents: 68,
      uniquePatients: 52,
      openClosed: { open: 18, closed: 50, forciblyClosed: 6 },
      severityBreakdown: { high: 8, medium: 28, low: 32 },
      domainBreakdown: { clinical: 45, management: 15, relational: 8 },
      redFlags: 4
    },
    trends: {
      incidentsPatients: { value: 8, direction: "up" },
      openClosed: { value: 12, direction: "down" },
      severity: { value: 5, direction: "up" },
      domain: { value: 2, direction: "down" },
      redFlags: { value: 20, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Medication Error", count: 18 },
        { classification: "Patient Fall", count: 14 },
        { classification: "Communication Gap", count: 12 },
        { classification: "Delay in Care", count: 10 },
        { classification: "Documentation Issue", count: 8 }
      ],
      stageHistogram: [
        { stage: "Admission", count: 22 },
        { stage: "Care", count: 35 },
        { stage: "Discharge", count: 11 }
      ],
      issuingDept: [
        { department: "ER Nursing", count: 28 },
        { department: "ICU Nursing", count: 20 },
        { department: "Ward Nursing", count: 20 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 10 * 60000),
        description: "Medication administration error - ICU Nursing",
        severity: "High",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 30 * 60000),
        description: "Patient fall in Ward 2 - Immediate response needed",
        severity: "High",
        status: "Pending"
      },
      {
        timestamp: new Date(Date.now() - 90 * 60000),
        description: "Communication gap during handover - ER",
        severity: "Medium",
        status: "Closed"
      }
    ]
  },
  medical: {
    metrics: {
      totalIncidents: 42,
      uniquePatients: 35,
      openClosed: { open: 10, closed: 32, forciblyClosed: 4 },
      severityBreakdown: { high: 5, medium: 18, low: 19 },
      domainBreakdown: { clinical: 30, management: 8, relational: 4 },
      redFlags: 3
    },
    trends: {
      incidentsPatients: { value: 6, direction: "down" },
      openClosed: { value: 10, direction: "down" },
      severity: { value: 3, direction: "up" },
      domain: { value: 1, direction: "down" },
      redFlags: { value: 25, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Diagnostic Delay", count: 12 },
        { classification: "Treatment Error", count: 10 },
        { classification: "Consultation Delay", count: 8 },
        { classification: "Lab Error", count: 6 },
        { classification: "Prescription Issue", count: 6 }
      ],
      stageHistogram: [
        { stage: "Admission", count: 12 },
        { stage: "Care", count: 20 },
        { stage: "Discharge", count: 10 }
      ],
      issuingDept: [
        { department: "Surgery", count: 18 },
        { department: "Internal Med", count: 14 },
        { department: "Pediatrics", count: 10 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 20 * 60000),
        description: "Diagnostic delay in Surgery - X-ray pending",
        severity: "Medium",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 60 * 60000),
        description: "Treatment protocol deviation - Internal Med",
        severity: "High",
        status: "Pending"
      },
      {
        timestamp: new Date(Date.now() - 150 * 60000),
        description: "Consultation delay resolved - Pediatrics",
        severity: "Low",
        status: "Closed"
      }
    ]
  },
  support: {
    metrics: {
      totalIncidents: 14,
      openClosed: { open: 4, closed: 10 },
      severityBreakdown: { high: 2, medium: 4, low: 8 },
      domainBreakdown: { clinical: 6, management: 5, relational: 3 },
      redFlags: 1
    },
    trends: {
      totalIncidents: { value: 15, direction: "down" },
      openClosed: { value: 5, direction: "down" },
      severity: { value: 2, direction: "down" },
      domain: { value: 1, direction: "up" },
      redFlags: { value: 50, direction: "down" }
    },
    charts: {
      top5Classification: [
        { classification: "Lab Delay", count: 5 },
        { classification: "Radiology Wait", count: 4 },
        { classification: "Pharmacy Error", count: 3 },
        { classification: "Equipment Issue", count: 1 },
        { classification: "Transport Delay", count: 1 }
      ],
      stageHistogram: [
        { stage: "Admission", count: 6 },
        { stage: "Care", count: 5 },
        { stage: "Discharge", count: 3 }
      ],
      issuingDept: [
        { department: "Laboratory", count: 6 },
        { department: "Radiology", count: 5 },
        { department: "Pharmacy", count: 3 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 25 * 60000),
        description: "Lab result delay - Chemistry panel pending",
        severity: "Medium",
        status: "Open"
      },
      {
        timestamp: new Date(Date.now() - 80 * 60000),
        description: "Radiology waiting time exceeded threshold",
        severity: "Low",
        status: "Closed"
      }
    ]
  }
};

const IdaraDashboardStats = ({ idara }) => {
  const data = mockIdaraData[idara] || mockIdaraData.nursing;
  const { metrics, trends, charts, recentActivity } = data;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", data: [] });

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

export default IdaraDashboardStats;
