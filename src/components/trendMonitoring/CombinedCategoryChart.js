// src/components/trendMonitoring/CombinedCategoryChart.js
import React from "react";
import { Card, Typography, Box } from "@mui/joy";
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

const CombinedCategoryChart = () => {
  // Prepare combined data
  const combinedData = monthlyCategoryData.map((item, index) => ({
    month: item.month,
    medicalErrors: item.medicalErrors,
    lackOfCare: item.lackOfCare,
    communication: item.communication,
    administrative: item.administrative,
    monthIndex: index,
  }));

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        📈 اتجاه الفئات (Category Trends with Limits)
      </Typography>
      
      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="month"
              stroke="#666"
              style={{ fontSize: "12px", fontWeight: 600 }}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: "12px", fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "2px solid #667eea",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            />
            <Legend wrapperStyle={{ fontSize: "13px", fontWeight: 600 }} />
            
            {/* Season separators - every 4 months */}
            <ReferenceLine x={3} stroke="#999" strokeWidth={2} strokeDasharray="5 5" label={{ value: "Q2", position: "top", fill: "#999" }} />
            <ReferenceLine x={7} stroke="#999" strokeWidth={2} strokeDasharray="5 5" label={{ value: "Q3", position: "top", fill: "#999" }} />
            <ReferenceLine x={11} stroke="#999" strokeWidth={2} strokeDasharray="5 5" label={{ value: "Q4", position: "top", fill: "#999" }} />
            
            {/* Threshold lines for each category */}
            <ReferenceLine
              y={categoryLimits.medicalErrors}
              stroke="#ff4757"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `حد: ${categoryLimits.medicalErrors}`, position: "right", fill: "#ff4757", fontSize: 11 }}
            />
            <ReferenceLine
              y={categoryLimits.lackOfCare}
              stroke="#ffa502"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `حد: ${categoryLimits.lackOfCare}`, position: "right", fill: "#ffa502", fontSize: 11 }}
            />
            <ReferenceLine
              y={categoryLimits.communication}
              stroke="#667eea"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `حد: ${categoryLimits.communication}`, position: "right", fill: "#667eea", fontSize: 11 }}
            />
            <ReferenceLine
              y={categoryLimits.administrative}
              stroke="#5f27cd"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `حد: ${categoryLimits.administrative}`, position: "right", fill: "#5f27cd", fontSize: 11 }}
            />
            
            {/* Medical Errors Line */}
            <Line
              type="monotone"
              dataKey="medicalErrors"
              stroke="#ff4757"
              strokeWidth={3}
              dot={{ fill: "#ff4757", r: 5 }}
              activeDot={{ r: 7 }}
              name="أخطاء طبية (Medical Errors)"
            />
            
            {/* Lack of Care Line */}
            <Line
              type="monotone"
              dataKey="lackOfCare"
              stroke="#ffa502"
              strokeWidth={3}
              dot={{ fill: "#ffa502", r: 5 }}
              activeDot={{ r: 7 }}
              name="نقص الرعاية (Lack of Care)"
            />
            
            {/* Communication Line */}
            <Line
              type="monotone"
              dataKey="communication"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: "#667eea", r: 5 }}
              activeDot={{ r: 7 }}
              name="التواصل (Communication)"
            />
            
            {/* Administrative Line */}
            <Line
              type="monotone"
              dataKey="administrative"
              stroke="#5f27cd"
              strokeWidth={3}
              dot={{ fill: "#5f27cd", r: 5 }}
              activeDot={{ r: 7 }}
              name="إدارية (Administrative)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 2,
          background: "rgba(102, 126, 234, 0.05)",
          borderRadius: "8px",
        }}
      >
        <Typography level="body-xs" sx={{ color: "#666" }}>
          💡 الخطوط الرأسية: فواصل الفصول (كل 4 أشهر) | الخطوط الأفقية المنقطة: الحدود القصوى لكل فئة
        </Typography>
      </Box>
    </Card>
  );
};

export default CombinedCategoryChart;
