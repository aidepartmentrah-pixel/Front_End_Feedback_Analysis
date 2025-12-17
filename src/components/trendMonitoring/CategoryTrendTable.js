// src/components/trendMonitoring/CategoryTrendTable.js
import React, { useState } from "react";
import { Card, Typography, Table, Sheet, Box, Button } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { monthlyCategoryData } from "../../data/trendMonitoringData";

const CategoryTrendTable = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
          📊 جدول الفئات الشهري (Category Monthly Table)
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
                <th style={{ width: "180px", fontWeight: 700 }}>
                  الفئة<br />Category
                </th>
                {monthlyCategoryData.map((data, index) => (
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
                {monthlyCategoryData.map((data, index) => (
                  <td key={index} style={{ textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                    {data.total}
                  </td>
                ))}
              </tr>

              {/* Medical Errors Row */}
              <tr>
                <td style={{ fontWeight: 700, color: "#ff4757" }}>
                  أخطاء طبية<br />
                  <span style={{ fontSize: "11px", color: "#999" }}>Medical Errors</span>
                </td>
                {monthlyCategoryData.map((data, index) => {
                  const percentage = ((data.medicalErrors / data.total) * 100).toFixed(1);
                  return (
                    <td key={index} style={{ textAlign: "center" }}>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{data.medicalErrors}</Box>
                      <Box sx={{ fontSize: "11px", color: "#666" }}>({percentage}%)</Box>
                    </td>
                  );
                })}
              </tr>

              {/* Lack of Care Row */}
              <tr>
                <td style={{ fontWeight: 700, color: "#ffa502" }}>
                  نقص الرعاية<br />
                  <span style={{ fontSize: "11px", color: "#999" }}>Lack of Care</span>
                </td>
                {monthlyCategoryData.map((data, index) => {
                  const percentage = ((data.lackOfCare / data.total) * 100).toFixed(1);
                  return (
                    <td key={index} style={{ textAlign: "center" }}>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{data.lackOfCare}</Box>
                      <Box sx={{ fontSize: "11px", color: "#666" }}>({percentage}%)</Box>
                    </td>
                  );
                })}
              </tr>

              {/* Communication Row */}
              <tr>
                <td style={{ fontWeight: 700, color: "#667eea" }}>
                  التواصل<br />
                  <span style={{ fontSize: "11px", color: "#999" }}>Communication</span>
                </td>
                {monthlyCategoryData.map((data, index) => {
                  const percentage = ((data.communication / data.total) * 100).toFixed(1);
                  return (
                    <td key={index} style={{ textAlign: "center" }}>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{data.communication}</Box>
                      <Box sx={{ fontSize: "11px", color: "#666" }}>({percentage}%)</Box>
                    </td>
                  );
                })}
              </tr>

              {/* Administrative Row */}
              <tr>
                <td style={{ fontWeight: 700, color: "#5f27cd" }}>
                  إدارية<br />
                  <span style={{ fontSize: "11px", color: "#999" }}>Administrative</span>
                </td>
                {monthlyCategoryData.map((data, index) => {
                  const percentage = ((data.administrative / data.total) * 100).toFixed(1);
                  return (
                    <td key={index} style={{ textAlign: "center" }}>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>{data.administrative}</Box>
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

export default CategoryTrendTable;
