// src/components/trendMonitoring/DomainTrendTable.js
import React, { useState } from "react";
import { Card, Typography, Table, Sheet, Box, Button } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { monthlyDomainData } from "../../data/trendMonitoringData";

const DomainTrendTable = () => {
  const [isExpanded, setIsExpanded] = useState(false);

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
                {monthlyDomainData.map((data, index) => (
                  <th key={index} style={{ textAlign: "center", minWidth: "80px" }}>
                    {data.month}
                    <br />
                    <span style={{ fontSize: "11px", color: "#999" }}>{data.monthEn}</span>
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
                {monthlyDomainData.map((data, index) => (
                  <td key={index} style={{ textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                    {data.total}
                  </td>
                ))}
              </tr>

              {/* Clinical Row */}
              <tr>
                <td style={{ fontWeight: 700, color: "#ff4757" }}>
                  سريري<br />
                  <span style={{ fontSize: "11px", color: "#999" }}>Clinical</span>
                </td>
                {monthlyDomainData.map((data, index) => {
                  const percentage = ((data.clinical / data.total) * 100).toFixed(1);
                  return (
                    <td key={index} style={{ textAlign: "center" }}>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{data.clinical}</Box>
                      <Box sx={{ fontSize: "11px", color: "#666" }}>({percentage}%)</Box>
                    </td>
                  );
                })}
              </tr>

              {/* Management Row */}
              <tr>
                <td style={{ fontWeight: 700, color: "#ffa502" }}>
                  إداري<br />
                  <span style={{ fontSize: "11px", color: "#999" }}>Management</span>
                </td>
                {monthlyDomainData.map((data, index) => {
                  const percentage = ((data.management / data.total) * 100).toFixed(1);
                  return (
                    <td key={index} style={{ textAlign: "center" }}>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{data.management}</Box>
                      <Box sx={{ fontSize: "11px", color: "#666" }}>({percentage}%)</Box>
                    </td>
                  );
                })}
              </tr>

              {/* Relational Row */}
              <tr>
                <td style={{ fontWeight: 700, color: "#2ed573" }}>
                  علائقي<br />
                  <span style={{ fontSize: "11px", color: "#999" }}>Relational</span>
                </td>
                {monthlyDomainData.map((data, index) => {
                  const percentage = ((data.relational / data.total) * 100).toFixed(1);
                  return (
                    <td key={index} style={{ textAlign: "center" }}>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{data.relational}</Box>
                      <Box sx={{ fontSize: "11px", color: "#666" }}>({percentage}%)</Box>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </Table>
        </Box>
      </Sheet>
      )}
    </Card>
  );
};

export default DomainTrendTable;
