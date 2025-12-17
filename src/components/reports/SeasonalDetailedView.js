// src/components/reports/SeasonalDetailedView.js
import React from "react";
import { Box, Typography, Card, Alert, Chip, Sheet, Table } from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SeasonalDetailedView = ({ complaints, threshold, filters }) => {
  // Classify record type
  const getRecordType = (record) => {
    const harmLevel = record.harm?.toLowerCase() || "";
    const severity = record.severity?.toLowerCase() || "";
    
    if (harmLevel.includes("death") || harmLevel.includes("وفاة") || 
        harmLevel.includes("permanent") || harmLevel.includes("دائم")) {
      return "never-event";
    }
    
    if ((severity === "high" && (harmLevel.includes("moderate") || harmLevel.includes("severe") || 
        harmLevel.includes("serious") || harmLevel.includes("خطير"))) ||
        (record.problemDomain === "CLINICAL" && severity === "high" && harmLevel !== "no harm")) {
      return "red-flag";
    }
    
    return "ordinary";
  };

  // Categorize complaints
  const neverEvents = complaints.filter(c => getRecordType(c) === "never-event");
  const redFlags = complaints.filter(c => getRecordType(c) === "red-flag");
  const ordinary = complaints.filter(c => getRecordType(c) === "ordinary");
  
  // Calculate clinical percentage
  const clinicalRecords = complaints.filter(c => c.problemDomain === "CLINICAL");
  const clinicalPercentage = complaints.length > 0 ? (clinicalRecords.length / complaints.length) * 100 : 0;
  const exceedsThreshold = clinicalPercentage > parseFloat(threshold);

  const getTrimesterLabel = (trimester) => {
    const labels = {
      "1": "الفصل الأول (Jan - Apr)",
      "2": "الفصل الثاني (May - Aug)",
      "3": "الفصل الثالث (Sep - Dec)"
    };
    return labels[trimester] || "غير محدد";
  };

  return (
    <Box>
      {/* Page Header */}
      <Card sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)" }}>
        <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
          📊 التقرير الفصلي التفصيلي (Seasonal Detailed Report)
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666" }}>
          {getTrimesterLabel(filters.trimester)} - {filters.year}
        </Typography>
      </Card>

      {/* Summary Statistics */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
            border: "2px solid rgba(102, 126, 234, 0.3)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>إجمالي السجلات</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#667eea" }}>
            {complaints.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>Total Records</Typography>
        </Card>

        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(46, 213, 115, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)",
            border: "2px solid rgba(46, 213, 115, 0.3)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>حالات عادية</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#2ed573" }}>
            {ordinary.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>Ordinary Cases</Typography>
        </Card>

        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 99, 71, 0.1) 100%)",
            border: "2px solid rgba(255, 71, 87, 0.3)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>Red Flags</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#ff4757" }}>
            {redFlags.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>Critical Cases</Typography>
        </Card>

        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(139, 0, 0, 0.1) 0%, rgba(220, 20, 60, 0.1) 100%)",
            border: "2px solid rgba(139, 0, 0, 0.5)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>Never Events</Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#8B0000" }}>
            {neverEvents.length}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>Serious Events</Typography>
        </Card>

        <Card
          sx={{
            p: 2,
            background: exceedsThreshold
              ? "linear-gradient(135deg, rgba(255, 165, 2, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)"
              : "linear-gradient(135deg, rgba(46, 213, 115, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)",
            border: exceedsThreshold
              ? "2px solid rgba(255, 165, 2, 0.3)"
              : "2px solid rgba(46, 213, 115, 0.3)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>نسبة الحالات السريرية</Typography>
          <Typography
            level="h4"
            sx={{
              fontWeight: 800,
              color: exceedsThreshold ? "#ffa502" : "#2ed573",
            }}
          >
            {clinicalPercentage.toFixed(2)}%
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>Clinical %</Typography>
        </Card>
      </Box>

      {/* Threshold Status */}
      {exceedsThreshold ? (
        <Alert
          color="warning"
          variant="soft"
          startDecorator={<WarningIcon />}
          sx={{
            mb: 3,
            fontSize: "0.95rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, rgba(255, 165, 2, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%)",
            border: "2px solid #ffa502",
          }}
        >
          <Box>
            <Typography level="title-md" sx={{ color: "#d97706", fontWeight: 700 }}>
              ⚠️ تجاوز الحد المسموح
            </Typography>
            <Typography level="body-sm" sx={{ color: "#92400e", mt: 0.5 }}>
              نسبة الحالات السريرية ({clinicalPercentage.toFixed(2)}%) تتجاوز العتبة المحددة ({threshold}%).
            </Typography>
          </Box>
        </Alert>
      ) : (
        <Alert
          color="success"
          variant="soft"
          startDecorator={<CheckCircleIcon />}
          sx={{
            mb: 3,
            fontSize: "0.95rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, rgba(46, 213, 115, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%)",
            border: "2px solid #2ed573",
          }}
        >
          <Box>
            <Typography level="title-md" sx={{ color: "#15803d", fontWeight: 700 }}>
              ✅ ضمن المقبول
            </Typography>
            <Typography level="body-sm" sx={{ color: "#166534", mt: 0.5 }}>
              نسبة الحالات السريرية ({clinicalPercentage.toFixed(2)}%) ضمن العتبة المقبولة ({threshold}%).
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Red Flags Section */}
      {redFlags.length > 0 && (
        <Card sx={{ p: 3, mb: 3, border: "2px solid #ff4757" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <FlagIcon sx={{ color: "#ff4757", fontSize: "2rem" }} />
            <Box>
              <Typography level="h6" sx={{ color: "#ff4757", fontWeight: 700 }}>
                Red Flags - الحالات الحرجة
              </Typography>
              <Typography level="body-sm" sx={{ color: "#666" }}>
                حالات تتطلب اهتمام فوري ومتابعة دقيقة
              </Typography>
            </Box>
          </Box>

          <Sheet sx={{ borderRadius: "8px", overflow: "hidden" }}>
            <Table size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>التاريخ</th>
                  <th>المريض</th>
                  <th>القسم</th>
                  <th>المجال</th>
                  <th>التصنيف</th>
                  <th>الشدة</th>
                  <th>الضرر</th>
                </tr>
              </thead>
              <tbody>
                {redFlags.map((record) => (
                  <tr key={record.id} style={{ background: "rgba(255, 71, 87, 0.05)" }}>
                    <td><strong>{record.complaintID}</strong></td>
                    <td>{record.dateReceived}</td>
                    <td>{record.patientFullName}</td>
                    <td>{record.sendingDepartment}</td>
                    <td><Chip color="danger" size="sm">{record.problemDomain}</Chip></td>
                    <td style={{ fontSize: "0.75rem" }}>{record.classificationAr}</td>
                    <td><Chip color="danger" size="sm">{record.severity}</Chip></td>
                    <td style={{ fontSize: "0.75rem", color: "#ff4757", fontWeight: 600 }}>{record.harm}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Card>
      )}

      {/* Never Events Section */}
      {neverEvents.length > 0 && (
        <Card sx={{ p: 3, mb: 3, border: "3px solid #8B0000", background: "rgba(139, 0, 0, 0.02)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <ErrorIcon sx={{ color: "#8B0000", fontSize: "2.5rem" }} />
            <Box>
              <Typography level="h6" sx={{ color: "#8B0000", fontWeight: 800 }}>
                Never Events - الأحداث الخطيرة
              </Typography>
              <Typography level="body-sm" sx={{ color: "#666" }}>
                أحداث خطيرة يجب ألا تحدث أبداً - تتطلب تحقيق شامل
              </Typography>
            </Box>
          </Box>

          <Sheet sx={{ borderRadius: "8px", overflow: "hidden" }}>
            <Table size="sm">
              <thead>
                <tr style={{ background: "#8B0000" }}>
                  <th style={{ color: "white" }}>ID</th>
                  <th style={{ color: "white" }}>التاريخ</th>
                  <th style={{ color: "white" }}>المريض</th>
                  <th style={{ color: "white" }}>القسم</th>
                  <th style={{ color: "white" }}>المجال</th>
                  <th style={{ color: "white" }}>التصنيف</th>
                  <th style={{ color: "white" }}>الشدة</th>
                  <th style={{ color: "white" }}>الضرر</th>
                </tr>
              </thead>
              <tbody>
                {neverEvents.map((record) => (
                  <tr key={record.id} style={{ background: "rgba(139, 0, 0, 0.08)" }}>
                    <td><strong>{record.complaintID}</strong></td>
                    <td>{record.dateReceived}</td>
                    <td style={{ fontWeight: 600 }}>{record.patientFullName}</td>
                    <td>{record.sendingDepartment}</td>
                    <td><Chip color="danger" variant="solid" size="sm">{record.problemDomain}</Chip></td>
                    <td style={{ fontSize: "0.75rem" }}>{record.classificationAr}</td>
                    <td><Chip color="danger" variant="solid" size="sm">{record.severity}</Chip></td>
                    <td style={{ fontSize: "0.75rem", color: "#8B0000", fontWeight: 700 }}>{record.harm}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Card>
      )}

      {/* Summary Table - Domain Breakdown */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
          توزيع الحالات حسب المجال (Domain Breakdown)
        </Typography>
        
        <Sheet sx={{ borderRadius: "8px", overflow: "hidden" }}>
          <Table>
            <thead>
              <tr>
                <th>المجال (Domain)</th>
                <th>إجمالي (Total)</th>
                <th>عادي (Ordinary)</th>
                <th>Red Flag</th>
                <th>Never Event</th>
                <th>النسبة المئوية (%)</th>
              </tr>
            </thead>
            <tbody>
              {["CLINICAL", "MANAGEMENT", "RELATIONAL"].map(domain => {
                const domainRecords = complaints.filter(c => c.problemDomain === domain);
                const domainOrdinary = domainRecords.filter(c => getRecordType(c) === "ordinary");
                const domainRedFlags = domainRecords.filter(c => getRecordType(c) === "red-flag");
                const domainNeverEvents = domainRecords.filter(c => getRecordType(c) === "never-event");
                const percentage = complaints.length > 0 ? (domainRecords.length / complaints.length * 100).toFixed(1) : 0;
                
                return (
                  <tr key={domain}>
                    <td><strong>{domain}</strong></td>
                    <td><Chip size="sm">{domainRecords.length}</Chip></td>
                    <td>{domainOrdinary.length}</td>
                    <td style={{ color: "#ff4757", fontWeight: 600 }}>{domainRedFlags.length}</td>
                    <td style={{ color: "#8B0000", fontWeight: 700 }}>{domainNeverEvents.length}</td>
                    <td><strong>{percentage}%</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Sheet>
      </Card>
    </Box>
  );
};

export default SeasonalDetailedView;
