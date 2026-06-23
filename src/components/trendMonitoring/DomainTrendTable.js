// src/components/trendMonitoring/DomainTrendTable.js
import React, { useState } from "react";
import { Card, Typography, Table, Sheet, Box, Button } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const DomainTrendTable = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data || !data.table) {
    return (
      <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography level="body-md" sx={{ color: "#999" }}>
          No domain data available
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
          Domain Summary Table
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
            border: "2px solid rgba(102, 126, 234, 0.2)",
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
                <tr style={{ background: "rgba(102, 126, 234, 0.1)" }}>
                  <th style={{ width: "150px", fontWeight: 700 }}>Domain</th>
                  <th style={{ textAlign: "center", width: "100px", fontWeight: 700 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.table.map((item, index) => (
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
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                      </Box>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Sheet>
      )}
    </Card>
  );
};

export default DomainTrendTable;
