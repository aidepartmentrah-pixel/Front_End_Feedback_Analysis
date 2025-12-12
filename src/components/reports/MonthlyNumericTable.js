// src/components/reports/MonthlyNumericTable.js
import React from "react";
import { Box, Card, Typography, Sheet, Table, Grid } from "@mui/joy";

const MonthlyNumericTable = ({ stats }) => {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: "#667eea" }}>
        التقرير الشهري الرقمي (Monthly Numeric Report)
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center" }}>
            <Typography level="body-xs" sx={{ opacity: 0.9 }}>إجمالي الشكاوى</Typography>
            <Typography level="h2" sx={{ fontWeight: 800, mt: 1 }}>{stats.total}</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, background: "linear-gradient(135deg, #ff4757 0%, #d63031 100%)", color: "white", textAlign: "center" }}>
            <Typography level="body-xs" sx={{ opacity: 0.9 }}>شدة عالية</Typography>
            <Typography level="h2" sx={{ fontWeight: 800, mt: 1 }}>{stats.severity.high}</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, background: "linear-gradient(135deg, #ffa502 0%, #ff8c00 100%)", color: "white", textAlign: "center" }}>
            <Typography level="body-xs" sx={{ opacity: 0.9 }}>شدة متوسطة</Typography>
            <Typography level="h2" sx={{ fontWeight: 800, mt: 1 }}>{stats.severity.medium}</Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, background: "linear-gradient(135deg, #2ed573 0%, #00b894 100%)", color: "white", textAlign: "center" }}>
            <Typography level="body-xs" sx={{ opacity: 0.9 }}>شدة منخفضة</Typography>
            <Typography level="h2" sx={{ fontWeight: 800, mt: 1 }}>{stats.severity.low}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Domain Breakdown */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
          التوزيع حسب المجال (Domain Distribution)
        </Typography>
        <Sheet sx={{ borderRadius: "8px", border: "1px solid rgba(102, 126, 234, 0.2)", overflow: "hidden" }}>
          <Table>
            <thead>
              <tr>
                <th>المجال</th>
                <th>العدد</th>
                <th>النسبة المئوية</th>
                <th>مرئي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>CLINICAL</strong></td>
                <td>{stats.domain.clinical}</td>
                <td>{stats.domain.clinicalPercent}%</td>
                <td>
                  <Box sx={{ width: "100%", height: "20px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                    <Box sx={{ width: `${stats.domain.clinicalPercent}%`, height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }} />
                  </Box>
                </td>
              </tr>
              <tr>
                <td><strong>MANAGEMENT</strong></td>
                <td>{stats.domain.management}</td>
                <td>{stats.domain.managementPercent}%</td>
                <td>
                  <Box sx={{ width: "100%", height: "20px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                    <Box sx={{ width: `${stats.domain.managementPercent}%`, height: "100%", background: "linear-gradient(135deg, #ffa502 0%, #ff8c00 100%)" }} />
                  </Box>
                </td>
              </tr>
              <tr>
                <td><strong>RELATIONAL</strong></td>
                <td>{stats.domain.relational}</td>
                <td>{stats.domain.relationalPercent}%</td>
                <td>
                  <Box sx={{ width: "100%", height: "20px", background: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                    <Box sx={{ width: `${stats.domain.relationalPercent}%`, height: "100%", background: "linear-gradient(135deg, #2ed573 0%, #00b894 100%)" }} />
                  </Box>
                </td>
              </tr>
            </tbody>
          </Table>
        </Sheet>
      </Box>

      {/* Category Breakdown */}
      <Box>
        <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
          التوزيع حسب الفئة (Category Breakdown)
        </Typography>
        <Sheet sx={{ borderRadius: "8px", border: "1px solid rgba(102, 126, 234, 0.2)", overflow: "hidden" }}>
          <Table>
            <thead>
              <tr>
                <th>الفئة</th>
                <th>العدد</th>
                <th>النسبة المئوية</th>
              </tr>
            </thead>
            <tbody>
              {stats.categories.slice(0, 10).map((cat, idx) => (
                <tr key={idx}>
                  <td>{cat.name}</td>
                  <td>{cat.count}</td>
                  <td><strong>{cat.percentage}%</strong></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </Box>
    </Card>
  );
};

export default MonthlyNumericTable;
