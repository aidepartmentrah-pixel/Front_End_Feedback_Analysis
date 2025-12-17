// src/components/reports/MonthlyDetailedTable.js
import React from "react";
import { Box, Card, Typography, Sheet, Table, Chip } from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import FlagIcon from "@mui/icons-material/Flag";

const MonthlyDetailedTable = ({ complaints }) => {

  const getSeverityStyle = (severity) => {
    const styleMap = {
      high: { background: "#ff4757", color: "white" },
      medium: { background: "#ffa502", color: "white" },
      low: { background: "#2ed573", color: "white" },
    };
    return styleMap[severity?.toLowerCase()] || { background: "#999", color: "white" };
  };

  // Classify record type based on severity, harm, and domain
  const getRecordType = (record) => {
    const harmLevel = record.harm?.toLowerCase() || "";
    const severity = record.severity?.toLowerCase() || "";
    
    // Never Event: Death or severe permanent harm
    if (harmLevel.includes("death") || harmLevel.includes("وفاة") || 
        harmLevel.includes("permanent") || harmLevel.includes("دائم") ||
        harmLevel === "patient death") {
      return "never-event";
    }
    
    // Red Flag: High severity with significant harm or clinical domain with high severity
    if ((severity === "high" && (harmLevel.includes("moderate") || harmLevel.includes("severe") || 
        harmLevel.includes("serious") || harmLevel.includes("خطير"))) ||
        (record.problemDomain === "CLINICAL" && severity === "high" && harmLevel !== "no harm" && !harmLevel.includes("minor"))) {
      return "red-flag";
    }
    
    return "ordinary";
  };

  const getRowStyle = (recordType) => {
    switch (recordType) {
      case "never-event":
        return {
          background: "linear-gradient(90deg, rgba(139, 0, 0, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)",
          borderLeft: "4px solid #8B0000"
        };
      case "red-flag":
        return {
          background: "linear-gradient(90deg, rgba(255, 71, 87, 0.08) 0%, rgba(255, 99, 71, 0.03) 100%)",
          borderLeft: "4px solid #ff4757"
        };
      default:
        return {
          background: "white",
          borderLeft: "4px solid #e0e0e0"
        };
    }
  };

  const getRecordBadge = (recordType) => {
    switch (recordType) {
      case "never-event":
        return (
          <Chip
            color="danger"
            variant="solid"
            size="sm"
            startDecorator={<ErrorIcon />}
            sx={{ 
              fontWeight: 800, 
              background: "#8B0000",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.7 }
              }
            }}
          >
            NEVER EVENT
          </Chip>
        );
      case "red-flag":
        return (
          <Chip
            color="danger"
            variant="soft"
            size="sm"
            startDecorator={<FlagIcon />}
            sx={{ fontWeight: 700, background: "#ff4757", color: "white" }}
          >
            RED FLAG
          </Chip>
        );
      default:
        return null;
    }
  };

  // Categorize complaints
  const neverEvents = complaints.filter(c => getRecordType(c) === "never-event");
  const redFlags = complaints.filter(c => getRecordType(c) === "red-flag");
  const ordinary = complaints.filter(c => getRecordType(c) === "ordinary");

  // Debug logging
  console.log("MonthlyDetailedTable - Total complaints:", complaints.length);
  console.log("MonthlyDetailedTable - Never Events:", neverEvents.length, neverEvents);
  console.log("MonthlyDetailedTable - Red Flags:", redFlags.length, redFlags);
  console.log("MonthlyDetailedTable - Ordinary:", ordinary.length);

  return (
    <Card sx={{ p: 2, mb: 3, maxWidth: "100%", overflow: "hidden" }}>
      <Typography level="h5" sx={{ mb: 1.5, fontWeight: 700, color: "#667eea", fontSize: "1.1rem" }}>
        التقرير الشهري التفصيلي (Monthly Detailed Report)
      </Typography>

      {/* Summary Statistics */}
      <Box sx={{ 
        display: "flex", 
        gap: 1.5, 
        mb: 2, 
        flexWrap: "wrap",
        p: 1.5,
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
        borderRadius: "6px"
      }}>
        <Box sx={{ flex: 1, minWidth: "120px" }}>
          <Typography level="body-xs" sx={{ color: "#666", mb: 0.3, fontSize: "0.7rem" }}>إجمالي السجلات</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#667eea", fontSize: "1.5rem" }}>
            {complaints.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999", fontSize: "0.65rem" }}>Total Records</Typography>
        </Box>
        
        <Box sx={{ flex: 1, minWidth: "120px" }}>
          <Typography level="body-xs" sx={{ color: "#666", mb: 0.3, fontSize: "0.7rem" }}>حالات عادية</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#2ed573", fontSize: "1.5rem" }}>
            {ordinary.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999", fontSize: "0.65rem" }}>Ordinary Cases</Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: "120px" }}>
          <Typography level="body-xs" sx={{ color: "#666", mb: 0.3, fontSize: "0.7rem" }}>Red Flags</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#ff4757", fontSize: "1.5rem" }}>
            {redFlags.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999", fontSize: "0.65rem" }}>Critical Concerns</Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: "120px" }}>
          <Typography level="body-xs" sx={{ color: "#666", mb: 0.3, fontSize: "0.7rem" }}>Never Events</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#8B0000", fontSize: "1.5rem" }}>
            {neverEvents.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999", fontSize: "0.65rem" }}>Serious Events</Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ 
        display: "flex", 
        gap: 1.5, 
        mb: 2,
        p: 1.5,
        background: "#f9fafb",
        borderRadius: "6px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <Typography level="body-sm" sx={{ fontWeight: 700, color: "#666", fontSize: "0.75rem" }}>
          تصنيف الحالات:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <Box sx={{ width: "16px", height: "16px", background: "white", border: "2px solid #e0e0e0", borderRadius: "3px" }} />
          <Typography level="body-sm" sx={{ fontSize: "0.75rem" }}>عادي (Ordinary)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <Box sx={{ width: "16px", height: "16px", background: "rgba(255, 71, 87, 0.08)", border: "2px solid #ff4757", borderRadius: "3px" }} />
          <Typography level="body-sm" sx={{ fontSize: "0.75rem" }}>Red Flag (حرج)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <Box sx={{ width: "16px", height: "16px", background: "rgba(139, 0, 0, 0.1)", border: "2px solid #8B0000", borderRadius: "3px" }} />
          <Typography level="body-sm" sx={{ fontSize: "0.75rem" }}>Never Event (خطير جداً)</Typography>
        </Box>
      </Box>

      {/* Never Events Special Table */}
      {neverEvents.length > 0 && (
        <Card sx={{ p: 2, mb: 2, border: "2px solid #8B0000", background: "rgba(139, 0, 0, 0.02)", maxWidth: "100%", overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <ErrorIcon sx={{ color: "#8B0000", fontSize: "1.8rem" }} />
            <Box>
              <Typography level="h6" sx={{ color: "#8B0000", fontWeight: 800, fontSize: "0.95rem" }}>
                Never Events - الأحداث الخطيرة (يجب ألا تحدث أبداً)
              </Typography>
              <Typography level="body-sm" sx={{ color: "#666", fontSize: "0.7rem" }}>
                أحداث خطيرة تتطلب تحقيق شامل ومتابعة فورية
              </Typography>
            </Box>
            <Chip
              color="danger"
              variant="solid"
              size="md"
              sx={{ 
                ml: "auto",
                fontWeight: 800, 
                background: "#8B0000",
                fontSize: "1rem"
              }}
            >
              {neverEvents.length}
            </Chip>
          </Box>

          <Sheet sx={{ borderRadius: "6px", overflow: "hidden", border: "2px solid #8B0000" }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table
                sx={{
                  "--TableCell-paddingY": "8px",
                  "--TableCell-paddingX": "6px",
                  fontSize: "10px",
                }}
              >
                <thead>
                  <tr style={{ background: "#8B0000" }}>
                    <th style={{ color: "white", width: "75px", fontSize: "9px" }}>تاريخ الاستلام<br />Date</th>
                    <th style={{ color: "white", width: "85px", fontSize: "9px" }}>رقم الشكوى<br />ID</th>
                    <th style={{ color: "white", width: "120px", fontSize: "9px" }}>اسم المريض<br />Patient</th>
                    <th style={{ color: "white", width: "180px", fontSize: "9px" }}>محتوى الشكوى<br />Raw Content</th>
                    <th style={{ color: "white", width: "150px", fontSize: "9px" }}>الإجراء الفوري<br />Immediate Action</th>
                    <th style={{ color: "white", width: "150px", fontSize: "9px" }}>الإجراء التصحيحي<br />Corrective Action</th>
                    <th style={{ color: "white", width: "100px", fontSize: "9px" }}>القسم المرسل<br />Sending Dept</th>
                    <th style={{ color: "white", width: "90px", fontSize: "9px" }}>الإدارة<br />Idara</th>
                    <th style={{ color: "white", width: "90px", fontSize: "9px" }}>الدائرة<br />Dayra</th>
                    <th style={{ color: "white", width: "90px", fontSize: "9px" }}>القسم<br />Qism</th>
                    <th style={{ color: "white", width: "80px", fontSize: "9px" }}>المبنى<br />Building</th>
                    <th style={{ color: "white", width: "70px", fontSize: "9px" }}>المصدر<br />Source</th>
                    <th style={{ color: "white", width: "70px", fontSize: "9px" }}>النوع<br />Type</th>
                    <th style={{ color: "white", width: "75px", fontSize: "9px" }}>المجال<br />Domain</th>
                    <th style={{ color: "white", width: "100px", fontSize: "9px" }}>الفئة<br />Category</th>
                    <th style={{ color: "white", width: "110px", fontSize: "9px" }}>الفئة الفرعية<br />Sub-Category</th>
                    <th style={{ color: "white", width: "140px", fontSize: "9px" }}>التصنيف (عربي)<br />Classification AR</th>
                    <th style={{ color: "white", width: "140px", fontSize: "9px" }}>التصنيف (إنجليزي)<br />Classification EN</th>
                    <th style={{ color: "white", width: "70px", fontSize: "9px" }}>الشدة<br />Severity</th>
                    <th style={{ color: "white", width: "85px", fontSize: "9px" }}>المرحلة<br />Stage</th>
                    <th style={{ color: "white", width: "100px", fontSize: "9px" }}>الضرر<br />Harm</th>
                  </tr>
                </thead>
                <tbody>
                  {neverEvents.map((row) => (
                    <tr key={row.id} style={{ background: "rgba(139, 0, 0, 0.08)" }}>
                      <td style={{ fontSize: "10px" }}>{row.dateReceived}</td>
                      <td><strong style={{ fontSize: "11px" }}>{row.complaintID}</strong></td>
                      <td>
                        <div style={{ fontSize: "10px", fontWeight: 600 }}>{row.patientFullName}</div>
                        <div style={{ fontSize: "9px", color: "#999" }}>{row.patientFullNameEn}</div>
                      </td>
                      <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.rawContent}</td>
                      <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.immediateAction}</td>
                      <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.correctiveAction}</td>
                      <td style={{ fontSize: "10px" }}>{row.sendingDepartment}</td>
                      <td style={{ fontSize: "10px" }}>{row.idara}</td>
                      <td style={{ fontSize: "10px" }}>{row.dayra}</td>
                      <td style={{ fontSize: "10px" }}>{row.qism}</td>
                      <td style={{ fontSize: "10px" }}>{row.building}</td>
                      <td style={{ fontSize: "10px" }}>{row.source}</td>
                      <td style={{ fontSize: "10px" }}>{row.type}</td>
                      <td><strong style={{ fontSize: "10px" }}>{row.problemDomain}</strong></td>
                      <td style={{ fontSize: "10px" }}>{row.problemCategory}</td>
                      <td style={{ fontSize: "10px" }}>{row.subCategory}</td>
                      <td style={{ fontSize: "10px", textAlign: "right", direction: "rtl" }}>{row.classificationAr}</td>
                      <td style={{ fontSize: "10px", textAlign: "left" }}>{row.classificationEn}</td>
                      <td>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ...getSeverityStyle(row.severity),
                            padding: "3px 6px",
                            borderRadius: "4px",
                            fontWeight: 700,
                            fontSize: "9px",
                            minWidth: "60px",
                          }}
                        >
                          {row.severity}
                        </Box>
                      </td>
                      <td style={{ fontSize: "10px" }}>{row.stage}</td>
                      <td style={{ fontSize: "10px", color: "#8B0000", fontWeight: 700 }}>{row.harm}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Sheet>
        </Card>
      )}

      {/* Red Flags Special Table */}
      {redFlags.length > 0 && (
        <Card sx={{ p: 2, mb: 2, border: "2px solid #ff4757", maxWidth: "100%", overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <FlagIcon sx={{ color: "#ff4757", fontSize: "1.8rem" }} />
            <Box>
              <Typography level="h6" sx={{ color: "#ff4757", fontWeight: 700, fontSize: "0.95rem" }}>
                Red Flags - الحالات الحرجة
              </Typography>
              <Typography level="body-sm" sx={{ color: "#666", fontSize: "0.7rem" }}>
                حالات تتطلب اهتمام فوري ومتابعة دقيقة
              </Typography>
            </Box>
            <Chip
              color="danger"
              variant="soft"
              size="md"
              sx={{ 
                ml: "auto",
                fontWeight: 700,
                background: "#ff4757",
                color: "white",
                fontSize: "1rem"
              }}
            >
              {redFlags.length}
            </Chip>
          </Box>

          <Sheet sx={{ borderRadius: "6px", overflow: "hidden", border: "1px solid #ff4757" }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table
                sx={{
                  "--TableCell-paddingY": "8px",
                  "--TableCell-paddingX": "6px",
                  fontSize: "10px",
                }}
              >
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)" }}>
                    <th style={{ color: "white", width: "75px", fontSize: "9px" }}>تاريخ الاستلام<br />Date</th>
                    <th style={{ color: "white", width: "85px", fontSize: "9px" }}>رقم الشكوى<br />ID</th>
                    <th style={{ color: "white", width: "120px", fontSize: "9px" }}>اسم المريض<br />Patient</th>
                    <th style={{ color: "white", width: "180px", fontSize: "9px" }}>محتوى الشكوى<br />Raw Content</th>
                    <th style={{ color: "white", width: "150px", fontSize: "9px" }}>الإجراء الفوري<br />Immediate Action</th>
                    <th style={{ color: "white", width: "150px", fontSize: "9px" }}>الإجراء التصحيحي<br />Corrective Action</th>
                    <th style={{ color: "white", width: "100px", fontSize: "9px" }}>القسم المرسل<br />Sending Dept</th>
                    <th style={{ color: "white", width: "90px", fontSize: "9px" }}>الإدارة<br />Idara</th>
                    <th style={{ color: "white", width: "90px", fontSize: "9px" }}>الدائرة<br />Dayra</th>
                    <th style={{ color: "white", width: "90px", fontSize: "9px" }}>القسم<br />Qism</th>
                    <th style={{ color: "white", width: "80px", fontSize: "9px" }}>المبنى<br />Building</th>
                    <th style={{ color: "white", width: "70px", fontSize: "9px" }}>المصدر<br />Source</th>
                    <th style={{ color: "white", width: "70px", fontSize: "9px" }}>النوع<br />Type</th>
                    <th style={{ color: "white", width: "75px", fontSize: "9px" }}>المجال<br />Domain</th>
                    <th style={{ color: "white", width: "100px", fontSize: "9px" }}>الفئة<br />Category</th>
                    <th style={{ color: "white", width: "110px", fontSize: "9px" }}>الفئة الفرعية<br />Sub-Category</th>
                    <th style={{ color: "white", width: "140px", fontSize: "9px" }}>التصنيف (عربي)<br />Classification AR</th>
                    <th style={{ color: "white", width: "140px", fontSize: "9px" }}>التصنيف (إنجليزي)<br />Classification EN</th>
                    <th style={{ color: "white", width: "70px", fontSize: "9px" }}>الشدة<br />Severity</th>
                    <th style={{ color: "white", width: "85px", fontSize: "9px" }}>المرحلة<br />Stage</th>
                    <th style={{ color: "white", width: "100px", fontSize: "9px" }}>الضرر<br />Harm</th>
                  </tr>
                </thead>
                <tbody>
                  {redFlags.map((row) => (
                    <tr key={row.id} style={{ background: "rgba(255, 71, 87, 0.05)" }}>
                      <td style={{ fontSize: "10px" }}>{row.dateReceived}</td>
                      <td><strong style={{ fontSize: "11px" }}>{row.complaintID}</strong></td>
                      <td>
                        <div style={{ fontSize: "10px", fontWeight: 600 }}>{row.patientFullName}</div>
                        <div style={{ fontSize: "9px", color: "#999" }}>{row.patientFullNameEn}</div>
                      </td>
                      <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.rawContent}</td>
                      <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.immediateAction}</td>
                      <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.correctiveAction}</td>
                      <td style={{ fontSize: "10px" }}>{row.sendingDepartment}</td>
                      <td style={{ fontSize: "10px" }}>{row.idara}</td>
                      <td style={{ fontSize: "10px" }}>{row.dayra}</td>
                      <td style={{ fontSize: "10px" }}>{row.qism}</td>
                      <td style={{ fontSize: "10px" }}>{row.building}</td>
                      <td style={{ fontSize: "10px" }}>{row.source}</td>
                      <td style={{ fontSize: "10px" }}>{row.type}</td>
                      <td><strong style={{ fontSize: "10px" }}>{row.problemDomain}</strong></td>
                      <td style={{ fontSize: "10px" }}>{row.problemCategory}</td>
                      <td style={{ fontSize: "10px" }}>{row.subCategory}</td>
                      <td style={{ fontSize: "10px", textAlign: "right", direction: "rtl" }}>{row.classificationAr}</td>
                      <td style={{ fontSize: "10px", textAlign: "left" }}>{row.classificationEn}</td>
                      <td>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            ...getSeverityStyle(row.severity),
                            padding: "3px 6px",
                            borderRadius: "4px",
                            fontWeight: 700,
                            fontSize: "9px",
                            minWidth: "60px",
                          }}
                        >
                          {row.severity}
                        </Box>
                      </td>
                      <td style={{ fontSize: "10px" }}>{row.stage}</td>
                      <td style={{ fontSize: "10px", color: "#ff4757", fontWeight: 600 }}>{row.harm}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Sheet>
        </Card>
      )}

      {/* Main Detailed Table - Ordinary Records */}
      <Typography level="h6" sx={{ mb: 1.5, fontWeight: 700, color: "#667eea", fontSize: "0.95rem" }}>
        📋 جميع السجلات العادية (All Ordinary Records)
      </Typography>

      <Sheet
        sx={{
          borderRadius: "6px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Table
            sx={{
              "--TableCell-paddingY": "8px",
              "--TableCell-paddingX": "6px",
              fontSize: "10px",
            }}
          >
            <thead>
              <tr>
                <th style={{ width: "85px", fontSize: "9px" }}>نوع السجل<br />Type</th>
                <th style={{ width: "75px", fontSize: "9px" }}>تاريخ الاستلام<br />Date</th>
                <th style={{ width: "85px", fontSize: "9px" }}>رقم الشكوى<br />ID</th>
                <th style={{ width: "120px", fontSize: "9px" }}>اسم المريض<br />Patient</th>
                <th style={{ width: "180px", fontSize: "9px" }}>محتوى الشكوى<br />Raw Content</th>
                <th style={{ width: "150px", fontSize: "9px" }}>الإجراء الفوري<br />Immediate Action</th>
                <th style={{ width: "150px", fontSize: "9px" }}>الإجراء التصحيحي<br />Corrective Action</th>
                <th style={{ width: "100px", fontSize: "9px" }}>القسم المرسل<br />Sending Dept</th>
                <th style={{ width: "90px", fontSize: "9px" }}>الإدارة<br />Idara</th>
                <th style={{ width: "90px", fontSize: "9px" }}>الدائرة<br />Dayra</th>
                <th style={{ width: "90px", fontSize: "9px" }}>القسم<br />Qism</th>
                <th style={{ width: "80px", fontSize: "9px" }}>المبنى<br />Building</th>
                <th style={{ width: "70px", fontSize: "9px" }}>المصدر<br />Source</th>
                <th style={{ width: "70px", fontSize: "9px" }}>النوع<br />Type</th>
                <th style={{ width: "75px", fontSize: "9px" }}>المجال<br />Domain</th>
                <th style={{ width: "100px", fontSize: "9px" }}>الفئة<br />Category</th>
                <th style={{ width: "110px", fontSize: "9px" }}>الفئة الفرعية<br />Sub-Category</th>
                <th style={{ width: "140px", fontSize: "9px" }}>التصنيف (عربي)<br />Classification AR</th>
                <th style={{ width: "140px", fontSize: "9px" }}>التصنيف (إنجليزي)<br />Classification EN</th>
                <th style={{ width: "70px", fontSize: "9px" }}>الشدة<br />Severity</th>
                <th style={{ width: "85px", fontSize: "9px" }}>المرحلة<br />Stage</th>
                <th style={{ width: "100px", fontSize: "9px" }}>الضرر<br />Harm</th>
              </tr>
            </thead>
            <tbody>
              {ordinary.map((row) => {
                const recordType = getRecordType(row);
                return (
                  <tr 
                    key={row.id}
                    style={{ 
                      ...getRowStyle(recordType)
                    }} 
                  >
                    <td>
                      {getRecordBadge(recordType)}
                    </td>
                    <td style={{ fontSize: "10px" }}>{row.dateReceived}</td>
                    <td><strong style={{ fontSize: "11px" }}>{row.complaintID}</strong></td>
                    <td>
                      <div style={{ fontSize: "10px", fontWeight: 600 }}>{row.patientFullName}</div>
                      <div style={{ fontSize: "9px", color: "#999" }}>{row.patientFullNameEn}</div>
                    </td>
                    <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.rawContent}</td>
                    <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.immediateAction}</td>
                    <td style={{ fontSize: "10px", lineHeight: "1.4" }}>{row.correctiveAction}</td>
                    <td style={{ fontSize: "10px" }}>{row.sendingDepartment}</td>
                    <td style={{ fontSize: "10px" }}>{row.idara}</td>
                    <td style={{ fontSize: "10px" }}>{row.dayra}</td>
                    <td style={{ fontSize: "10px" }}>{row.qism}</td>
                    <td style={{ fontSize: "10px" }}>{row.building}</td>
                    <td style={{ fontSize: "10px" }}>{row.source}</td>
                    <td style={{ fontSize: "10px" }}>{row.type}</td>
                    <td><strong style={{ fontSize: "10px" }}>{row.problemDomain}</strong></td>
                    <td style={{ fontSize: "10px" }}>{row.problemCategory}</td>
                    <td style={{ fontSize: "10px" }}>{row.subCategory}</td>
                    <td style={{ fontSize: "10px", textAlign: "right", direction: "rtl" }}>{row.classificationAr}</td>
                    <td style={{ fontSize: "10px", textAlign: "left" }}>{row.classificationEn}</td>
                    <td>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ...getSeverityStyle(row.severity),
                          padding: "3px 6px",
                          borderRadius: "4px",
                          fontWeight: 700,
                          fontSize: "9px",
                          minWidth: "60px",
                        }}
                      >
                        {row.severity}
                      </Box>
                    </td>
                    <td style={{ fontSize: "10px" }}>{row.stage}</td>
                    <td>
                      <Typography 
                        level="body-xs" 
                        sx={{ 
                          fontSize: "10px",
                          fontWeight: recordType !== "ordinary" ? 700 : 400,
                          color: recordType === "never-event" ? "#8B0000" : 
                                 recordType === "red-flag" ? "#ff4757" : "inherit"
                        }}
                      >
                        {row.harm}
                      </Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", background: "#f9fafb" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Typography level="body-sm" sx={{ color: "#666" }}>
              إجمالي السجلات (Total Records): {complaints.length}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Typography level="body-sm" sx={{ color: "#2ed573", fontWeight: 600 }}>
                عادي: {ordinary.length}
              </Typography>
              <Typography level="body-sm" sx={{ color: "#ff4757", fontWeight: 600 }}>
                Red Flag: {redFlags.length}
              </Typography>
              <Typography level="body-sm" sx={{ color: "#8B0000", fontWeight: 700 }}>
                Never Event: {neverEvents.length}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Sheet>
    </Card>
  );
};

export default MonthlyDetailedTable;
