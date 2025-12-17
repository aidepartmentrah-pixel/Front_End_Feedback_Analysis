// src/components/trendMonitoring/CombinedDomainChart.js
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
import { monthlyDomainData, domainLimits } from "../../data/trendMonitoringData";

const CombinedDomainChart = () => {
  // Prepare combined data
  const combinedData = monthlyDomainData.map((item, index) => ({
    month: item.month,
    clinical: item.clinical,
    management: item.management,
    relational: item.relational,
    monthIndex: index,
  }));

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        📈 اتجاه المجالات (Domain Trends with Limits)
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
            
            {/* Threshold lines for each domain */}
            <ReferenceLine
              y={domainLimits.clinical}
              stroke="#ff4757"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `حد سريري: ${domainLimits.clinical}`, position: "right", fill: "#ff4757", fontSize: 11 }}
            />
            <ReferenceLine
              y={domainLimits.management}
              stroke="#ffa502"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `حد إداري: ${domainLimits.management}`, position: "right", fill: "#ffa502", fontSize: 11 }}
            />
            <ReferenceLine
              y={domainLimits.relational}
              stroke="#2ed573"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `حد علائقي: ${domainLimits.relational}`, position: "right", fill: "#2ed573", fontSize: 11 }}
            />
            
            {/* Clinical Line */}
            <Line
              type="monotone"
              dataKey="clinical"
              stroke="#ff4757"
              strokeWidth={3}
              dot={{ fill: "#ff4757", r: 5 }}
              activeDot={{ r: 7 }}
              name="سريري (Clinical)"
            />
            
            {/* Management Line */}
            <Line
              type="monotone"
              dataKey="management"
              stroke="#ffa502"
              strokeWidth={3}
              dot={{ fill: "#ffa502", r: 5 }}
              activeDot={{ r: 7 }}
              name="إداري (Management)"
            />
            
            {/* Relational Line */}
            <Line
              type="monotone"
              dataKey="relational"
              stroke="#2ed573"
              strokeWidth={3}
              dot={{ fill: "#2ed573", r: 5 }}
              activeDot={{ r: 7 }}
              name="علائقي (Relational)"
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
          💡 الخطوط الرأسية: فواصل الفصول (كل 4 أشهر) | الخطوط الأفقية المنقطة: الحدود القصوى لكل مجال
        </Typography>
      </Box>
    </Card>
  );
};

export default CombinedDomainChart;
