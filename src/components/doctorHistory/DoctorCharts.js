// src/components/doctorHistory/DoctorCharts.js
import React from "react";
import { Box, Typography, Card, Grid } from "@mui/joy";

const DoctorCharts = ({ categoryBreakdown, monthlyTrend }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        Visual Analytics
      </Typography>
      
      <Grid container spacing={2}>
        {/* Category Breakdown */}
        <Grid xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              height: "100%",
              borderColor: "rgba(102, 126, 234, 0.3)",
            }}
          >
            <Typography level="title-md" sx={{ mb: 2, fontWeight: 700 }}>
              📊 Category Breakdown
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {categoryBreakdown.map((category, index) => {
                const percentage = (category.count / categoryBreakdown.reduce((sum, c) => sum + c.count, 0) * 100).toFixed(1);
                return (
                  <Box key={index}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                      <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                        {category.count} ({percentage}%)
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: "8px",
                        background: "#e0e0e0",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>

        {/* Monthly Trend */}
        <Grid xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              height: "100%",
              borderColor: "rgba(102, 126, 234, 0.3)",
            }}
          >
            <Typography level="title-md" sx={{ mb: 2, fontWeight: 700 }}>
              📈 Monthly Trend (Last 6 Months)
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: "200px" }}>
              {monthlyTrend.map((month, index) => {
                const maxValue = Math.max(...monthlyTrend.map(m => m.count));
                const heightPercent = (month.count / maxValue) * 100;
                return (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography level="body-xs" sx={{ fontWeight: 700, color: "#667eea" }}>
                      {month.count}
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        height: `${heightPercent}%`,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "4px 4px 0 0",
                        minHeight: month.count > 0 ? "20px" : "0",
                      }}
                    />
                    <Typography level="body-xs" sx={{ fontSize: "10px", color: "#666" }}>
                      {month.month}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorCharts;
