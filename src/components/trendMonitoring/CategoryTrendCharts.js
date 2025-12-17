// src/components/trendMonitoring/CategoryTrendCharts.js
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
import { monthlyCategoryData, categoryLimits } from "../../data/trendMonitoringData";

const CategoryTrendCharts = () => {
  // Prepare data for each category
  const medicalErrorsData = monthlyCategoryData.map((item) => ({
    month: item.month,
    value: item.medicalErrors,
  }));

  const lackOfCareData = monthlyCategoryData.map((item) => ({
    month: item.month,
    value: item.lackOfCare,
  }));

  const communicationData = monthlyCategoryData.map((item) => ({
    month: item.month,
    value: item.communication,
  }));

  const administrativeData = monthlyCategoryData.map((item) => ({
    month: item.month,
    value: item.administrative,
  }));

  return (
    <Box>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        📈 رسوم بيانية للفئات (Category Trend Charts)
      </Typography>

      <Grid container spacing={3}>
        {/* Medical Errors Chart */}
        <Grid xs={12} lg={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#ff4757" }}>
              أخطاء طبية (Medical Errors)
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={medicalErrorsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                    y={categoryLimits.medicalErrors}
                    stroke="#ff4757"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `حد: ${categoryLimits.medicalErrors}`, position: "right", fill: "#ff4757", fontSize: 11 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ff4757"
                    strokeWidth={3}
                    dot={{ fill: "#ff4757", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="أخطاء طبية"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Lack of Care Chart */}
        <Grid xs={12} lg={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#ffa502" }}>
              نقص الرعاية (Lack of Care)
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lackOfCareData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                    y={categoryLimits.lackOfCare}
                    stroke="#ffa502"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `حد: ${categoryLimits.lackOfCare}`, position: "right", fill: "#ffa502", fontSize: 11 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ffa502"
                    strokeWidth={3}
                    dot={{ fill: "#ffa502", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="نقص الرعاية"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Communication Chart */}
        <Grid xs={12} lg={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
              التواصل (Communication)
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={communicationData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                      border: "2px solid #667eea",
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
                    y={categoryLimits.communication}
                    stroke="#667eea"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `حد: ${categoryLimits.communication}`, position: "right", fill: "#667eea", fontSize: 11 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={{ fill: "#667eea", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="التواصل"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Administrative Chart */}
        <Grid xs={12} lg={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#5f27cd" }}>
              إدارية (Administrative)
            </Typography>
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={administrativeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                      border: "2px solid #5f27cd",
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
                    y={categoryLimits.administrative}
                    stroke="#5f27cd"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `حد: ${categoryLimits.administrative}`, position: "right", fill: "#5f27cd", fontSize: 11 }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#5f27cd"
                    strokeWidth={3}
                    dot={{ fill: "#5f27cd", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="إدارية"
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

export default CategoryTrendCharts;
