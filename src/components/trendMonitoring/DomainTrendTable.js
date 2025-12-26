// src/components/trendMonitoring/DomainTrendTable.js
import React, { useState } from "react";
import { Card, Typography, Table, Sheet, Box, Button } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const DomainTrendTable = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || !data.domains || data.domains.length === 0) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No domain data available
        </Typography>
      </Card>
    );
  }

  // Get all unique months from the first domain's monthly data
  const monthsData = data.domains[0]?.monthly_data || [];
  
  // Calculate totals for each month
  const monthlyTotals = monthsData.map((monthData) => {
    const total = data.domains.reduce((sum, domain) => {
      const domainMonth = domain.monthly_data.find(m => m.period === monthData.period);
      return sum + (domainMonth?.incident_count || 0);
    }, 0);
    return {
      period: monthData.period,
      label: monthData.period_label,
      total,
    };
  });

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
          📊 جدول المجالات الشهري (Domain Monthly Table)
        </Typography>
        <Button
          variant="outlined"
          color="neutral"
          endDecorator={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ fontWeight: 600 }}
        >
          {isExpanded ? "إخفاء الجدول" : "عرض الجدول"}
        </Button>
      </Box>

      {isExpanded && (
        <Sheet
          sx={{
            borderRadius: "8px",
            border: "2px solid rgba(102, 126, 234, 0.2)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                "--TableCell-paddingY": "12px",
                "--TableCell-paddingX": "10px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(102, 126, 234, 0.1)" }}>
                  <th style={{ width: "150px", fontWeight: 700 }}>
                    المجال<br />Domain
                  </th>
                  {monthsData.map((monthData, index) => (
                    <th key={index} style={{ textAlign: "center", minWidth: "80px" }}>
                      {monthData.period_label_ar || monthData.period_label}
                      <br />
                      <span style={{ fontSize: "11px", color: "#999" }}>
                        {monthData.period}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Total Row */}
                <tr style={{ background: "rgba(102, 126, 234, 0.05)", fontWeight: 700 }}>
                  <td style={{ fontWeight: 700, color: "#667eea" }}>
                    الإجمالي<br />
                    <span style={{ fontSize: "11px", color: "#999" }}>Total Incidents</span>
                  </td>
                  {monthlyTotals.map((monthTotal, index) => (
                    <td key={index} style={{ textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                      {monthTotal.total}
                    </td>
                  ))}
                </tr>

                {/* Domain Rows */}
                {data.domains.map((domain, domainIndex) => (
                  <tr key={domainIndex}>
                    <td style={{ fontWeight: 700, color: domain.domain_color || "#667eea" }}>
                      {domain.domain_name_ar || domain.domain_name}<br />
                      <span style={{ fontSize: "11px", color: "#999" }}>
                        {domain.domain_name}
                      </span>
                    </td>
                    {monthsData.map((monthData, monthIndex) => {
                      const domainMonth = domain.monthly_data.find(m => m.period === monthData.period);
                      const count = domainMonth?.incident_count || 0;
                      const monthTotal = monthlyTotals[monthIndex].total;
                      const percentage = monthTotal > 0 ? ((count / monthTotal) * 100).toFixed(1) : "0.0";
                      
                      return (
                        <td key={monthIndex} style={{ textAlign: "center" }}>
                          <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{count}</Box>
                          <Box sx={{ fontSize: "11px", color: "#666" }}>({percentage}%)</Box>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Sheet>
      )}
    </Card>
  );
};

export default DomainTrendTable;
