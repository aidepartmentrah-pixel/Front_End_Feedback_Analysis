// src/components/redflags/RedFlagTable.js
import React from "react";
import { Box, Card, Typography, Sheet, Table, Chip, Button, CircularProgress } from "@mui/joy";
import VisibilityIcon from "@mui/icons-material/Visibility";

const RedFlagTable = ({ title, redflags, loading, onViewDetails, showStatus = true, isFinished = false }) => {
  const getSeverityStyle = (severity) => {
    const styleMap = {
      HIGH: { background: "#ff4757", color: "white" },
      MEDIUM: { background: "#ffa502", color: "white" },
      LOW: { background: "#2ed573", color: "white" },
    };
    return styleMap[severity] || { background: "#999", color: "white" };
  };

  const getStatusStyle = (status) => {
    const styleMap = {
      OPEN: { background: "#ffa502", color: "white" },
      CLOSED: { background: "#999", color: "white" },
      FINISHED: { background: "#2ed573", color: "white" },
    };
    return styleMap[status] || { background: "#999", color: "white" };
  };

  if (loading) {
    return (
      <Card sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress size="lg" />
        <Typography level="body-sm" sx={{ mt: 2, color: "#666" }}>
          Loading Red Flags...
        </Typography>
      </Card>
    );
  }

  if (redflags.length === 0) {
    return (
      <Card sx={{ p: 5, textAlign: "center" }}>
        <Typography level="h6" sx={{ color: "#999" }}>
          No Red Flags found
        </Typography>
        <Typography level="body-sm" sx={{ color: "#666", mt: 1 }}>
          No incidents match the search criteria
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography level="h5" sx={{ mb: 3, fontWeight: 700, color: isFinished ? "#2ed573" : "#ff4757" }}>
        {title || `🚩 Red Flags - ${redflags.length} incidents`}
      </Typography>

      <Sheet
        sx={{
          borderRadius: "8px",
          border: isFinished ? "2px solid rgba(46, 213, 115, 0.2)" : "2px solid rgba(255, 71, 87, 0.2)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Table
            sx={{
              "--TableCell-paddingY": "14px",
              "--TableCell-paddingX": "12px",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: isFinished ? "rgba(46, 213, 115, 0.1)" : "rgba(255, 71, 87, 0.1)" }}>
                <th>Record ID</th>
                <th>Date</th>
                <th>Patient</th>
                <th>Sending Dept</th>
                <th>Target Dept</th>
                <th>Domain</th>
                <th>Severity</th>
                {showStatus && <th>Status</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {redflags.map((flag) => (
                <tr
                  key={flag.id}
                  style={{
                    borderLeft: flag.severity === "HIGH" ? "5px solid #ff4757" : "none",
                    background: flag.status === "OPEN" ? "rgba(255, 165, 2, 0.08)" : "white",
                  }}
                >
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#ff4757" }}>
                      {flag.recordID}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{flag.date}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {flag.patientName}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{flag.sendingDepartment}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{flag.targetDepartment}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 700, color: "#667eea" }}>
                      {flag.domain}
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      sx={{
                        ...getSeverityStyle(flag.severity),
                        fontWeight: 700,
                        fontSize: "12px",
                        minWidth: "65px",
                      }}
                    >
                      {flag.severity}
                    </Chip>
                  </td>
                  {showStatus && (
                    <td>
                      <Chip
                        sx={{
                        ...getStatusStyle(flag.status),
                        fontWeight: 700,
                        fontSize: "12px",
                        minWidth: "70px",
                      }}
                    >
                      {flag.status === "OPEN" ? "Open" : flag.status === "CLOSED" ? "Closed" : "Finished"}
                    </Chip>
                    </td>
                  )}
                  <td>
                    <Button
                      size="sm"
                      startDecorator={<VisibilityIcon />}
                      onClick={() => onViewDetails(flag)}
                      sx={{
                        background: "linear-gradient(135deg, #ff4757 0%, #e84118 100%)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      </Sheet>
    </Card>
  );
};

export default RedFlagTable;
