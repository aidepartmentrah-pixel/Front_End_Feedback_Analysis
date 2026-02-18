// src/components/doctorHistory/DoctorIncidentsTable.js
import React, { useState } from "react";
import { Box, Typography, Table, Chip } from "@mui/joy";

const DoctorIncidentsTable = ({ incidents }) => {
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const sortedIncidents = [...incidents].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "HIGH": return "danger";
      case "MEDIUM": return "warning";
      case "LOW": return "success";
      default: return "neutral";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CLOSED": return "success";
      case "OPEN": return "warning";
      case "UNDER_REVIEW": return "primary";
      default: return "neutral";
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography level="h6" sx={{ mb: 2, fontWeight: 700, color: "#667eea" }}>
        Incident History
      </Typography>
      
      <Box
        sx={{
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Typography level="title-md" sx={{ fontWeight: 700 }}>
            All Incidents Involving This Doctor
          </Typography>
          <Typography level="body-xs" sx={{ opacity: 0.9, mt: 0.5 }}>
            Click column headers to sort
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
          <Table
            sx={{
              "& thead th": {
                background: "#f9fafb",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
                position: "sticky",
                top: 0,
                zIndex: 1,
              },
              "& tbody td": {
                textAlign: "center",
              },
            }}
          >
            <thead>
              <tr>
                <th onClick={() => handleSort("date")}>
                  Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("incidentId")}>
                  Incident ID {sortBy === "incidentId" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("patientId")}>
                  Patient ID {sortBy === "patientId" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Category</th>
                <th onClick={() => handleSort("severity")}>
                  Severity {sortBy === "severity" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("classification")}>
                  Classification {sortBy === "classification" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Intent (AR)</th>
                <th>Intent (EN)</th>
                <th onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Red Flag</th>
              </tr>
            </thead>
            <tbody>
              {sortedIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  style={{
                    background: incident.isRedFlag ? "#ffebee" : "white",
                    borderLeft: incident.isRedFlag ? "4px solid #d32f2f" : "none",
                  }}
                >
                  <td>
                    <Typography level="body-sm">{incident.date}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600, color: "#667eea" }}>
                      {incident.isRedFlag && "🚩 "}
                      {incident.incidentId}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{incident.patientId}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{incident.category}</Typography>
                    <Typography level="body-xs" sx={{ color: "#999", dir: "rtl" }}>
                      {incident.categoryAr}
                    </Typography>
                  </td>
                  <td>
                    <Chip size="sm" color={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Chip>
                  </td>
                  <td>
                    <Chip
                      size="sm"
                      color={
                        incident.classification === "bad" ? "danger" :
                        incident.classification === "good" ? "success" : "neutral"
                      }
                    >
                      {incident.classification === "bad" ? "😞 Bad" :
                       incident.classification === "good" ? "😊 Good" :
                       incident.classification === "neutral" ? "😐 Neutral" : "—"}
                    </Chip>
                  </td>
                  <td style={{ direction: "rtl" }}>
                    <Typography level="body-sm">{incident.intent_type_ar || "—"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{incident.intent_type_en || "—"}</Typography>
                  </td>
                  <td>
                    <Chip size="sm" variant="soft" color={getStatusColor(incident.status)}>
                      {incident.status.replace("_", " ")}
                    </Chip>
                  </td>
                  <td>
                    {incident.isRedFlag ? (
                      <Typography level="body-sm" sx={{ color: "#d32f2f", fontWeight: 700 }}>
                        🚩 YES
                      </Typography>
                    ) : (
                      <Typography level="body-sm" sx={{ color: "#999" }}>
                        —
                      </Typography>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorIncidentsTable;
