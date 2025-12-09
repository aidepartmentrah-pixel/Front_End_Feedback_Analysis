// src/components/patientHistory/PatientHistoryCharts.js
import React from "react";
import { Box, Card, Typography, Grid } from "@mui/joy";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  high: "#ff4757",
  medium: "#ffa502",
  low: "#2ed573",
  pie: ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b"],
};

const PatientHistoryCharts = ({ data }) => {
  return (
    <Box>
      <Typography level="h4" sx={{ mb: 3, color: "#667eea", fontWeight: 700 }}>
        📊 Analytics & Trends
      </Typography>

      <Grid container spacing={3}>
        {/* Severity Over Time - Line Chart */}
        <Grid xs={12} lg={6}>
          <Card
            sx={{
              p: 3,
              border: "1px solid rgba(102, 126, 234, 0.2)",
              height: "100%",
            }}
          >
            <Typography
              level="body-md"
              sx={{ mb: 2, fontWeight: 700, color: "#333" }}
            >
              Severity Trends Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.severityOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke={COLORS.high}
                  strokeWidth={2}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke={COLORS.medium}
                  strokeWidth={2}
                  name="Medium"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke={COLORS.low}
                  strokeWidth={2}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Incidents Per Department - Bar Chart */}
        <Grid xs={12} lg={6}>
          <Card
            sx={{
              p: 3,
              border: "1px solid rgba(102, 126, 234, 0.2)",
              height: "100%",
            }}
          >
            <Typography
              level="body-md"
              sx={{ mb: 2, fontWeight: 700, color: "#333" }}
            >
              Incidents by Department
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.incidentsPerDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Category Distribution - Pie Chart */}
        <Grid xs={12}>
          <Card
            sx={{
              p: 3,
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          >
            <Typography
              level="body-md"
              sx={{ mb: 2, fontWeight: 700, color: "#333" }}
            >
              Feedback Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.pie[index % COLORS.pie.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientHistoryCharts;
