// src/components/trendMonitoring/DomainTrendCharts.js
import React from "react";
import { Card, Typography, Box, Grid } from "@mui/joy";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { monthlyDomainData, domainLimits } from "../../data/trendMonitoringData";

const DomainTrendCharts = () => {
  // Prepare data for clinical chart
  const clinicalData = monthlyDomainData.map((item, index) => ({
    month: item.month,
    value: item.clinical,
    monthIndex: index,
  }));

  // Prepare data for management chart
  const managementData = monthlyDomainData.map((item, index) => ({
    month: item.month,
    value: item.management,
    monthIndex: index,
  }));

  // Prepare data for relational chart
  const relationalData = monthlyDomainData.map((item, index) => ({
    month: item.month,
    value: item.relational,
    monthIndex: index,
  }));

  // Custom component for vertical lines at season boundaries (every 4 months)
  const SeasonSeparators = () => {
    return (
      <>
        <ReferenceLine x={3} stroke="#999" strokeWidth={2} strokeDasharray="5 5" label="Q2" />
        <ReferenceLine x={7} stroke="#999" strokeWidth={2} strokeDasharray="5 5" label="Q3" />
        <ReferenceLine x={11} stroke="#999" strokeWidth={2} strokeDasharray="5 5" label="Q4" />
      </>
    );
  };

  return (
    <Box>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        📈 رسوم بيانية للمجالات (Domain Trend Charts)
      </Typography>

      <Grid container spacing={3}>
        {/* Clinical Chart */}
        <Grid xs={12} lg={4}>
          <Card sx={{ p: 2.5 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#ff4757" }}>
              سريري (Clinical)
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clinicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "2px solid #ff4757",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                  
                  {/* Season separators */}
                  <ReferenceLine x={3} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  <ReferenceLine x={7} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  <ReferenceLine x={11} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  
                  {/* Threshold line */}
                  <ReferenceLine
                    y={domainLimits.clinical}
                    stroke="#ff4757"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `حد: ${domainLimits.clinical}`, position: "right", fill: "#ff4757", fontSize: 11 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ff4757"
                    strokeWidth={3}
                    dot={{ fill: "#ff4757", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="حوادث سريرية"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Management Chart */}
        <Grid xs={12} lg={4}>
          <Card sx={{ p: 2.5 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#ffa502" }}>
              إداري (Management)
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={managementData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "2px solid #ffa502",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                  
                  {/* Season separators */}
                  <ReferenceLine x={3} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  <ReferenceLine x={7} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  <ReferenceLine x={11} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  
                  {/* Threshold line */}
                  <ReferenceLine
                    y={domainLimits.management}
                    stroke="#ffa502"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `حد: ${domainLimits.management}`, position: "right", fill: "#ffa502", fontSize: 11 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ffa502"
                    strokeWidth={3}
                    dot={{ fill: "#ffa502", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="حوادث إدارية"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Relational Chart */}
        <Grid xs={12} lg={4}>
          <Card sx={{ p: 2.5 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#2ed573" }}>
              علائقي (Relational)
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={relationalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "2px solid #2ed573",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                  
                  {/* Season separators */}
                  <ReferenceLine x={3} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  <ReferenceLine x={7} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  <ReferenceLine x={11} stroke="#999" strokeWidth={1.5} strokeDasharray="5 5" />
                  
                  {/* Threshold line */}
                  <ReferenceLine
                    y={domainLimits.relational}
                    stroke="#2ed573"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `حد: ${domainLimits.relational}`, position: "right", fill: "#2ed573", fontSize: 11 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2ed573"
                    strokeWidth={3}
                    dot={{ fill: "#2ed573", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="حوادث علائقية"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DomainTrendCharts;
