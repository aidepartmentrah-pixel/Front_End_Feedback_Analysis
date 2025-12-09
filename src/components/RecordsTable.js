// src/components/RecordsTable.js
import React, { useState } from "react";
import {
  Table,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Sheet,
  Typography,
} from "@mui/joy";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const RecordsTable = ({ records, filters }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // FILTER LOGIC
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.record_id.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      record.patient_full_name.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesIssuing =
      filters.issuingDept === "All" || record.issuing_department === filters.issuingDept;
    const matchesTarget =
      filters.targetDept === "All" || record.target_department === filters.targetDept;
    const matchesSource =
      filters.source === "All" || record.source_1 === filters.source;
    return matchesSearch && matchesIssuing && matchesTarget && matchesSource;
  });

  // SORTING LOGIC
  const sortedRecords = React.useMemo(() => {
    let sorted = [...filteredRecords];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredRecords, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get severity color with solid background
  const getSeverityStyle = (severity) => {
    const text = severity?.toLowerCase() || "";
    const styleMap = {
      high: { background: "#ff4757", color: "white", label: "High" },
      medium: { background: "#ffa502", color: "white", label: "Medium" },
      low: { background: "#2ed573", color: "white", label: "Low" },
    };
    return styleMap[text] || { background: "#999", color: "white", label: severity };
  };

  // Get status color with solid background
  const getStatusStyle = (status) => {
    const text = status?.toLowerCase() || "";
    const styleMap = {
      closed: { background: "#2ed573", color: "white", label: "Closed" },
      "in progress": { background: "#ffa502", color: "white", label: "In Progress" },
      pending: { background: "#667eea", color: "white", label: "Pending" },
    };
    return styleMap[text] || { background: "#999", color: "white", label: status };
  };

  // Get harm level color with solid background
  const getHarmStyle = (harm) => {
    const text = harm?.toLowerCase() || "";
    const styleMap = {
      high: { background: "#ff4757", color: "white", label: "High" },
      medium: { background: "#ffa502", color: "white", label: "Moderate" },
      low: { background: "#2ed573", color: "white", label: "Low" },
      "moderate harm": { background: "#ffa502", color: "white", label: "Moderate" },
    };
    return styleMap[text] || { background: "#999", color: "white", label: harm };
  };

  // Badge component with proper styling
  const StyledBadge = ({ style, text }) => (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: style.background,
        color: style.color,
        padding: "6px 8px",
        borderRadius: "4px",
        fontWeight: 700,
        fontSize: "12px",
        textAlign: "center",
        width: "90px",
        height: "28px",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
      }}
    >
      {text}
    </Box>
  );

  const SortableHeader = ({ label, sortKey }) => (
    <Tooltip title={`Click to sort by ${label}`}>
      <Box
        onClick={() => handleSort(sortKey)}
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          "&:hover": {
            color: "#667eea",
          },
        }}
      >
        {label}
        {sortConfig.key === sortKey && (
          <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
        )}
      </Box>
    </Tooltip>
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Summary Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Total Records
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.length}
          </Typography>
        </Sheet>

        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            High Severity
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.filter((r) => r.severity_level?.toLowerCase() === "high").length}
          </Typography>
        </Sheet>

        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            In Progress
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.filter((r) => r.status?.toLowerCase() === "in progress").length}
          </Typography>
        </Sheet>

        <Sheet
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography level="body-sm" sx={{ opacity: 0.9 }}>
            Closed
          </Typography>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            {filteredRecords.filter((r) => r.status?.toLowerCase() === "closed").length}
          </Typography>
        </Sheet>
      </Box>

      {/* Empty State */}
      {sortedRecords.length === 0 ? (
        <Sheet
          sx={{
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            borderRadius: "8px",
            border: "2px dashed rgba(102, 126, 234, 0.3)",
          }}
        >
          <Typography level="h3" sx={{ color: "#667eea", mb: 1 }}>
            📭 No records found
          </Typography>
          <Typography level="body-sm" sx={{ color: "#999" }}>
            Try adjusting your filters to find what you're looking for
          </Typography>
        </Sheet>
      ) : (
        <Sheet
          sx={{
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid rgba(102, 126, 234, 0.1)",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
          }}
        >
          <Table
            sx={{
              "--Table-firstBorderRadius": "8px 0 0 0",
              "--Table-lastBorderRadius": "0 8px 0 0",
              "--TableCell-paddingY": "12px",
              "--TableCell-paddingX": "16px",
            }}
          >
            <thead>
              <tr>
                <th>
                  <SortableHeader label="Date" sortKey="feedback_received_date" />
                </th>
                <th>
                  <SortableHeader label="Record ID" sortKey="record_id" />
                </th>
                <th>
                  <SortableHeader label="Patient" sortKey="patient_full_name" />
                </th>
                <th>
                  <SortableHeader label="Issuing Dept" sortKey="issuing_department" />
                </th>
                <th>
                  <SortableHeader label="Target Dept" sortKey="target_department" />
                </th>
                <th>
                  <SortableHeader label="Source" sortKey="source_1" />
                </th>
                <th>Type</th>
                <th>Domain</th>
                <th>
                  <SortableHeader label="Severity" sortKey="severity_level" />
                </th>
                <th>
                  <SortableHeader label="Status" sortKey="status" />
                </th>
                <th>Harm Level</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.feedback_received_date}</td>
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600, color: "#667eea" }}>
                      {record.record_id}
                    </Typography>
                  </td>
                  <td>{record.patient_full_name}</td>
                  <td>
                    <Typography level="body-xs">{record.issuing_department}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{record.target_department}</Typography>
                  </td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      label={record.source_1}
                      sx={{ background: "rgba(102, 126, 234, 0.1)", color: "#667eea" }}
                    />
                  </td>
                  <td>{record.feedback_type}</td>
                  <td>{record.domain}</td>
                  <td>
                    <StyledBadge
                      style={getSeverityStyle(record.severity_level)}
                      text={getSeverityStyle(record.severity_level).label}
                    />
                  </td>
                  <td>
                    <StyledBadge
                      style={getStatusStyle(record.status)}
                      text={getStatusStyle(record.status).label}
                    />
                  </td>
                  <td>
                    <StyledBadge
                      style={getHarmStyle(record.harm_level)}
                      text={getHarmStyle(record.harm_level).label}
                    />
                  </td>
                  <td>
                    <Typography level="body-xs">{record.stage}</Typography>
                  </td>
                  <td>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="primary"
                          sx={{ "&:hover": { background: "rgba(102, 126, 234, 0.1)" } }}
                        >
                          <VisibilityIcon sx={{ fontSize: "18px" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Record">
                        <Link to={`/edit/${record.record_id}`} style={{ textDecoration: "none" }}>
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="warning"
                            sx={{ "&:hover": { background: "rgba(255, 193, 7, 0.1)" } }}
                          >
                            <EditIcon sx={{ fontSize: "18px" }} />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title="Delete Record">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          sx={{ "&:hover": { background: "rgba(244, 67, 54, 0.1)" } }}
                        >
                          <DeleteIcon sx={{ fontSize: "18px" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      )}
    </Box>
  );
};

export default RecordsTable;
