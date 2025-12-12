// src/components/reports/SeasonalSummary.js
import React from "react";
import { Box, Typography, Card, Alert, Chip } from "@mui/joy";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BusinessIcon from "@mui/icons-material/Business";

const SeasonalSummary = ({ stats, threshold, filters }) => {
  const { totalOpen, clinicalCount, clinicalPercentage } = stats;
  const exceedsThreshold = clinicalPercentage > parseFloat(threshold);

  // Get trimester label
  const getTrimesterLabel = (trimester) => {
    const labels = {
      "1": "الفصل الأول (Jan - Apr)",
      "2": "الفصل الثاني (May - Aug)",
      "3": "الفصل الثالث (Sep - Dec)"
    };
    return labels[trimester] || "غير محدد";
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        level="h5"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: "#667eea",
        }}
      >
        📊 ملخص التقرير الفصلي (Seasonal Summary)
      </Typography>

      {/* Period and Department Info */}
      <Card sx={{ p: 2, mb: 3, background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)" }}>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthIcon sx={{ color: "#667eea" }} />
            <Box>
              <Typography level="body-xs" sx={{ color: "#999" }}>الفترة</Typography>
              <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                {getTrimesterLabel(filters.trimester)} - {filters.year}
              </Typography>
            </Box>
          </Box>

          {(filters.idara || filters.dayra || filters.qism) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BusinessIcon sx={{ color: "#667eea" }} />
              <Box>
                <Typography level="body-xs" sx={{ color: "#999" }}>الجهة</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                  {filters.idara && (
                    <Chip size="sm" color="primary" variant="soft">
                      إدارة: {filters.idara}
                    </Chip>
                  )}
                  {filters.dayra && (
                    <Chip size="sm" color="primary" variant="soft">
                      دائرة: {filters.dayra}
                    </Chip>
                  )}
                  {filters.qism && (
                    <Chip size="sm" color="primary" variant="soft">
                      قسم: {filters.qism}
                    </Chip>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {!filters.idara && !filters.dayra && !filters.qism && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BusinessIcon sx={{ color: "#999" }} />
              <Box>
                <Typography level="body-xs" sx={{ color: "#999" }}>الجهة</Typography>
                <Typography level="body-sm" sx={{ fontWeight: 600, color: "#999" }}>
                  جميع الجهات (All Departments)
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Card>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
            border: "2px solid rgba(102, 126, 234, 0.3)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
            إجمالي الحالات المفتوحة
          </Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#667eea" }}>
            {totalOpen}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>
            Total Open Cases
          </Typography>
        </Card>

        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 99, 71, 0.1) 100%)",
            border: "2px solid rgba(255, 71, 87, 0.3)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
            حالات المجال السريري
          </Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#ff4757" }}>
            {clinicalCount}
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>
            Clinical Domain Cases
          </Typography>
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
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
            نسبة الحالات السريرية
          </Typography>
          <Typography
            level="h4"
            sx={{
              fontWeight: 800,
              color: exceedsThreshold ? "#ffa502" : "#2ed573",
            }}
          >
            {clinicalPercentage.toFixed(2)}%
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>
            Clinical Percentage
          </Typography>
        </Card>

        <Card
          sx={{
            p: 2,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            border: "2px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <Typography level="body-sm" sx={{ color: "#666", mb: 0.5 }}>
            العتبة المحددة
          </Typography>
          <Typography level="h4" sx={{ fontWeight: 800, color: "#667eea" }}>
            {threshold}%
          </Typography>
          <Typography level="body-xs" sx={{ color: "#999" }}>
            Threshold Value
          </Typography>
        </Card>
      </Box>

      {/* Threshold Status Banner */}
      {exceedsThreshold ? (
        <Alert
          color="warning"
          variant="soft"
          startDecorator={<WarningIcon />}
          sx={{
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
    </Box>
  );
};

export default SeasonalSummary;
