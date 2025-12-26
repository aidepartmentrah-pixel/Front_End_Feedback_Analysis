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
} from "recharts";

const CombinedDomainChart = ({ data }) => {
  if (!data || !data.domains || data.domains.length === 0) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No domain data available
        </Typography>
      </Card>
    );
  }

  // Get all unique months from the first domain
  const monthsData = data.domains[0]?.monthly_data || [];
  
  // Prepare chart data - combine all domains by month
  const chartData = monthsData.map((monthData) => {
    const dataPoint = {
      period: monthData.period,
      label: monthData.period_label,
      labelAr: monthData.period_label_ar,
      month: monthData.month,
      year: monthData.year,
    };
    
    // Add each domain's count for this month
    data.domains.forEach((domain) => {
      const domainMonth = domain.monthly_data.find(m => m.period === monthData.period);
      dataPoint[domain.domain_code] = domainMonth?.incident_count || 0;
      dataPoint[`${domain.domain_code}_name`] = domain.domain_name;
      dataPoint[`${domain.domain_code}_nameAr`] = domain.domain_name_ar;
      dataPoint[`${domain.domain_code}_color`] = domain.domain_color;
    });
    
    return dataPoint;
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: "white",
            border: "2px solid #667eea",
            borderRadius: "8px",
            p: 1.5,
            fontSize: "12px",
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 700, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: entry.color,
                }}
              />
              <Typography level="body-xs">
                {entry.name}: <strong>{entry.value}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        📈 اتجاه المجالات (Domain Trends)
      </Typography>
      
      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="label"
              stroke="#666"
              style={{ fontSize: "11px", fontWeight: 600 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: "12px", fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "13px", fontWeight: 600 }} />
            
            {/* Render a line for each domain */}
            {data.domains.map((domain, index) => (
              <Line
                key={domain.domain_id}
                type="monotone"
                dataKey={domain.domain_code}
                stroke={domain.domain_color || `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={3}
                dot={{ fill: domain.domain_color, r: 5 }}
                activeDot={{ r: 7 }}
                name={`${domain.domain_name_ar || domain.domain_name} (${domain.domain_code})`}
              />
            ))}
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
