// src/components/departmentFeedback/ExplanationTypeSwitch.js
import React from "react";
import { Box, Typography, Card } from "@mui/joy";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const ExplanationTypeSwitch = ({ activeTab, setActiveTab }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography level="h5" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        نوع التوضيح
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Card
          onClick={() => setActiveTab(0)}
          sx={{
            flex: 1,
            p: 3,
            cursor: "pointer",
            border: activeTab === 0 ? "3px solid #667eea" : "2px solid #e0e0e0",
            background: activeTab === 0
              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
              : "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(102, 126, 234, 0.2)",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <DescriptionIcon
              sx={{ fontSize: 48, color: activeTab === 0 ? "#667eea" : "#999" }}
            />
            <Typography level="h6" sx={{ fontWeight: 700, color: activeTab === 0 ? "#667eea" : "#666" }}>
              📋 توضيح الحالات (Incident Explanations)
            </Typography>
            <Typography level="body-sm" sx={{ textAlign: "center", color: "#999" }}>
              توضيح ما حدث في حالة واحدة محددة
            </Typography>
          </Box>
        </Card>

        <Card
          onClick={() => setActiveTab(1)}
          sx={{
            flex: 1,
            p: 3,
            cursor: "pointer",
            border: activeTab === 1 ? "3px solid #667eea" : "2px solid #e0e0e0",
            background: activeTab === 1
              ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
              : "white",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 16px rgba(102, 126, 234, 0.2)",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <TrendingUpIcon
              sx={{ fontSize: 48, color: activeTab === 1 ? "#667eea" : "#999" }}
            />
            <Typography level="h6" sx={{ fontWeight: 700, color: activeTab === 1 ? "#667eea" : "#666" }}>
              📊 توضيح الأداء الفصلي (Seasonal Explanations)
            </Typography>
            <Typography level="body-sm" sx={{ textAlign: "center", color: "#999" }}>
              توضيح تجاوز العتبات في الأداء الفصلي
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default ExplanationTypeSwitch;
