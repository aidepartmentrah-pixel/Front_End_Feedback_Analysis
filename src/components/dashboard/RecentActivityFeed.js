import React from "react";
import { Card, Typography, Box, Table, Chip, Sheet } from "@mui/joy";
import { AccessTime, Warning, CheckCircle, Error } from "@mui/icons-material";

const RecentActivityFeed = ({ incidents = [] }) => {
  const getSeverityColor = (severity) => {
    const severityStr = typeof severity === 'string' ? severity.toLowerCase() : '';
    switch (severityStr) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#667eea";
    }
  };

  const getStatusIcon = (status) => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : '';
    switch (statusStr) {
      case "closed":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "pending":
        return <AccessTime sx={{ fontSize: 16 }} />;
      case "open":
        return <Warning sx={{ fontSize: 16 }} />;
      default:
        return <Error sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = (status) => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : '';
    switch (statusStr) {
      case "closed":
        return "#2ed573";
      case "pending":
        return "#ffa502";
      case "open":
        return "#ff4757";
      default:
        return "#667eea";
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000 / 60); // minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <Card
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
      }}
    >
      <Typography
        level="h4"
        sx={{
          mb: 2,
          color: "#1a1e3f",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <AccessTime sx={{ color: "#667eea" }} />
        Recent Activity
      </Typography>

      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "sm",
          overflow: "auto",
          maxHeight: 400,
        }}
      >
        <Table
          size="sm"
          sx={{
            "& thead th": {
              bgcolor: "#f5f7fa",
              fontWeight: 700,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#667eea",
              borderBottom: "2px solid #667eea20",
              position: "sticky",
              top: 0,
              zIndex: 1,
            },
            "& tbody tr": {
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#667eea08",
                cursor: "pointer",
              },
            },
            "& tbody td": {
              fontSize: "13px",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "15%" }}>Time</th>
              <th style={{ width: "45%" }}>Description</th>
              <th style={{ width: "20%", textAlign: "center" }}>Severity</th>
              <th style={{ width: "20%", textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                  <Typography level="body-sm" sx={{ color: "#999" }}>
                    No recent activity
                  </Typography>
                </td>
              </tr>
            ) : (
              incidents.map((incident, index) => (
                <tr key={index}>
                  <td>
                    <Typography
                      level="body-xs"
                      sx={{ color: "#667eea", fontWeight: 600 }}
                    >
                      {formatTime(incident.timestamp)}
                    </Typography>
                  </td>
                  <td>
                    <Typography
                      level="body-sm"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "350px",
                      }}
                    >
                      {incident.description}
                    </Typography>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Chip
                      size="sm"
                      variant="soft"
                      sx={{
                        bgcolor: `${getSeverityColor(incident.severity)}15`,
                        color: getSeverityColor(incident.severity),
                        fontWeight: 600,
                        fontSize: "11px",
                        border: `1px solid ${getSeverityColor(incident.severity)}30`,
                      }}
                    >
                      {incident.severity || 'Unknown'}
                    </Chip>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Chip
                      size="sm"
                      variant="soft"
                      startDecorator={getStatusIcon(incident.status)}
                      sx={{
                        bgcolor: `${getStatusColor(incident.status)}15`,
                        color: getStatusColor(incident.status),
                        fontWeight: 600,
                        fontSize: "11px",
                        border: `1px solid ${getStatusColor(incident.status)}30`,
                      }}
                    >
                      {incident.status || 'Unknown'}
                    </Chip>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>
    </Card>
  );
};

export default RecentActivityFeed;
