// src/components/trendMonitoring/CategoryTrendTable.js
import React, { useState } from "react";
import { Card, Typography, Table, Sheet, Box, Button } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const CategoryTrendTable = ({ data, referenceData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data || !data.table) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No category data available
        </Typography>
      </Card>
    );
  }

  // Build category ID to name map from reference data
  const categoryMap = new Map();
  if (referenceData?.allCategories && Array.isArray(referenceData.allCategories)) {
    referenceData.allCategories.forEach(cat => {
      categoryMap.set(cat.id, cat.name || cat.name_en || cat.category_name || `Category ${cat.id}`);
    });
  }

  console.log("📊 CategoryTrendTable - categoryMap:", Array.from(categoryMap.entries()));
  console.log("📊 CategoryTrendTable - table data:", data.table);

  // Helper to get category name from name field
  const getCategoryName = (name) => {
    // If backend returns "Category X" format
    const match = name?.match(/Category (\d+)/);
    if (match) {
      const categoryId = parseInt(match[1]);
      return categoryMap.get(categoryId) || name;
    }
    
    // If backend returns numeric ID directly as string
    const numericId = parseInt(name);
    if (!isNaN(numericId) && categoryMap.has(numericId)) {
      return categoryMap.get(numericId);
    }
    
    // If it's already a proper name, use it
    if (name && typeof name === 'string' && !name.startsWith('Category ')) {
      return name;
    }
    
    return name || "Unknown Category";
  };

  const getTrendIcon = (direction) => {
    if (direction === "increasing") return <TrendingUpIcon sx={{ fontSize: "16px", color: "#ff4757" }} />;
    if (direction === "decreasing") return <TrendingDownIcon sx={{ fontSize: "16px", color: "#2ed573" }} />;
    return <span style={{ fontSize: "12px", color: "#999" }}>—</span>;
  };

  const getTrendColor = (direction) => {
    if (direction === "increasing") return "#ff4757";
    if (direction === "decreasing") return "#2ed573";
    return "#999";
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography level="h5" sx={{ fontWeight: 700, color: "#ffa502" }}>
          Category Summary Table
        </Typography>
        <Button
          variant="outlined"
          color="neutral"
          endDecorator={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ fontWeight: 600 }}
        >
          {isExpanded ? "Hide Table" : "Show Table"}
        </Button>
      </Box>

      {isExpanded && (
        <Sheet
          sx={{
            borderRadius: "8px",
            border: "2px solid rgba(255, 165, 2, 0.2)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                "--TableCell-paddingY": "12px",
                "--TableCell-paddingX": "12px",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255, 165, 2, 0.1)" }}>
                  <th style={{ width: "150px", fontWeight: 700 }}>Category</th>
                  <th style={{ textAlign: "center", width: "100px", fontWeight: 700 }}>Total</th>
                  <th style={{ textAlign: "center", width: "100px", fontWeight: 700 }}>Trend</th>
                  <th style={{ textAlign: "center", width: "100px", fontWeight: 700 }}>% Change</th>
                </tr>
              </thead>
              <tbody>
                {data.table.map((item, index) => {
                  const displayName = getCategoryName(item.name);
                  return (
                    <tr key={index} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: item.color,
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{displayName}</span>
                        </Box>
                      </td>
                    <td style={{ textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                      {item.total}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5 }}>
                        {getTrendIcon(item.trend_direction)}
                        <span style={{ fontSize: "12px", textTransform: "capitalize" }}>
                          {item.trend_direction || "N/A"}
                        </span>
                      </Box>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ color: getTrendColor(item.trend_direction), fontWeight: 600 }}>
                        {item.trend_percentage !== null ? `${item.trend_percentage}%` : "N/A"}
                      </span>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </Table>
          </Box>
        </Sheet>
      )}
    </Card>
  );
};

export default CategoryTrendTable;
