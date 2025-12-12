// src/components/reports/MonthlyDetailedTable.js
import React, { useState } from "react";
import { Box, Card, Typography, Sheet, Table } from "@mui/joy";

const MonthlyDetailedTable = ({ complaints }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const getSeverityStyle = (severity) => {
    const styleMap = {
      high: { background: "#ff4757", color: "white" },
      medium: { background: "#ffa502", color: "white" },
      low: { background: "#2ed573", color: "white" },
    };
    return styleMap[severity?.toLowerCase()] || { background: "#999", color: "white" };
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        التقرير الشهري التفصيلي (Monthly Detailed Report)
      </Typography>

      <Sheet
        sx={{
          borderRadius: "8px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Table
            sx={{
              "--TableCell-paddingY": "10px",
              "--TableCell-paddingX": "8px",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr>
                <th>تاريخ الاستلام<br />Date Received</th>
                <th>رقم الشكوى<br />Complaint ID</th>
                <th>اسم المريض<br />Patient Name</th>
                <th>القسم المرسل<br />Sending Dept</th>
                <th>المصدر<br />Source</th>
                <th>النوع<br />Type</th>
                <th>المجال<br />Domain</th>
                <th>الفئة<br />Category</th>
                <th>التصنيف (عربي)<br />Classification (AR)</th>
                <th>الشدة<br />Severity</th>
                <th>المرحلة<br />Stage</th>
                <th>الضرر<br />Harm</th>
                <th>تفاصيل<br />Details</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((row) => (
                <React.Fragment key={row.id}>
                  <tr style={{ cursor: "pointer" }} onClick={() => toggleRow(row.id)}>
                    <td>{row.dateReceived}</td>
                    <td><strong>{row.complaintID}</strong></td>
                    <td>
                      <div>{row.patientFullName}</div>
                      <div style={{ fontSize: "10px", color: "#999" }}>{row.patientFullNameEn}</div>
                    </td>
                    <td>{row.sendingDepartment}</td>
                    <td>{row.source}</td>
                    <td>{row.type}</td>
                    <td><strong>{row.problemDomain}</strong></td>
                    <td>{row.problemCategory}</td>
                    <td>{row.classificationAr}</td>
                    <td>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ...getSeverityStyle(row.severity),
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: 700,
                          fontSize: "11px",
                          minWidth: "70px",
                        }}
                      >
                        {row.severity}
                      </Box>
                    </td>
                    <td>{row.stage}</td>
                    <td>{row.harm}</td>
                    <td>
                      <Typography
                        level="body-sm"
                        sx={{ color: "#667eea", fontWeight: 600, cursor: "pointer" }}
                      >
                        {expandedRow === row.id ? "▼" : "▶"}
                      </Typography>
                    </td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr>
                      <td colSpan="13">
                        <Box sx={{ p: 3, background: "#f9fafb" }}>
                          <Typography level="h6" sx={{ mb: 2, color: "#667eea" }}>
                            التفاصيل الكاملة (Full Details)
                          </Typography>
                          
                          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
                            <Box>
                              <Typography level="body-xs" sx={{ fontWeight: 700 }}>إدارة:</Typography>
                              <Typography level="body-sm">{row.idara}</Typography>
                            </Box>
                            <Box>
                              <Typography level="body-xs" sx={{ fontWeight: 700 }}>دائرة:</Typography>
                              <Typography level="body-sm">{row.dayra}</Typography>
                            </Box>
                            <Box>
                              <Typography level="body-xs" sx={{ fontWeight: 700 }}>قسم:</Typography>
                              <Typography level="body-sm">{row.qism}</Typography>
                            </Box>
                            <Box>
                              <Typography level="body-xs" sx={{ fontWeight: 700 }}>المبنى:</Typography>
                              <Typography level="body-sm">{row.building}</Typography>
                            </Box>
                            <Box>
                              <Typography level="body-xs" sx={{ fontWeight: 700 }}>الفئة الفرعية:</Typography>
                              <Typography level="body-sm">{row.subCategory}</Typography>
                            </Box>
                            <Box>
                              <Typography level="body-xs" sx={{ fontWeight: 700 }}>Classification (EN):</Typography>
                              <Typography level="body-sm">{row.classificationEn}</Typography>
                            </Box>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography level="body-xs" sx={{ fontWeight: 700, mb: 1 }}>
                              محتوى الشكوى (Raw Content):
                            </Typography>
                            <Typography level="body-sm" sx={{ p: 2, background: "white", borderRadius: "4px" }}>
                              {row.rawContent}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography level="body-xs" sx={{ fontWeight: 700, mb: 1 }}>
                              الإجراء الفوري (Immediate Action):
                            </Typography>
                            <Typography level="body-sm" sx={{ p: 2, background: "white", borderRadius: "4px" }}>
                              {row.immediateAction}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography level="body-xs" sx={{ fontWeight: 700, mb: 1 }}>
                              الإجراء التصحيحي (Corrective Action):
                            </Typography>
                            <Typography level="body-sm" sx={{ p: 2, background: "white", borderRadius: "4px" }}>
                              {row.correctiveAction}
                            </Typography>
                          </Box>
                        </Box>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", background: "#f9fafb" }}>
          <Typography level="body-sm" sx={{ color: "#666" }}>
            إجمالي السجلات (Total Records): {complaints.length}
          </Typography>
        </Box>
      </Sheet>
    </Card>
  );
};

export default MonthlyDetailedTable;
