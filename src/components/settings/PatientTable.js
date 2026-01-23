// src/components/settings/PatientTable.js
import React, { useState, useMemo } from "react";
import {
  Table,
  Sheet,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Input,
  Chip,
  CircularProgress,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const PatientTable = ({ patients, onEdit, onDelete, loading, totalCount }) => {
  const [sortConfig, setSortConfig] = useState({ key: "full_name", direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  // Sort patients
  const sortedPatients = useMemo(() => {
    let sorted = [...patients];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [patients, sortConfig]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return sortedPatients.filter((patient) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        patient.full_name?.toLowerCase().includes(searchLower) ||
        patient.first_name?.toLowerCase().includes(searchLower) ||
        patient.phone_number?.toLowerCase().includes(searchLower) ||
        patient.document_number?.toLowerCase().includes(searchLower) ||
        patient.medical_file_number?.toLowerCase().includes(searchLower) ||
        patient.patient_admission_id?.toString().includes(searchTerm)
      );
    });
  }, [sortedPatients, searchTerm]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Sortable header
  const SortableHeader = ({ label, sortKey }) => (
    <Box
      onClick={() => handleSort(sortKey)}
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        "&:hover": { color: "#667eea" },
      }}
    >
      {label}
      {sortConfig.key === sortKey && (
        <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
      )}
    </Box>
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: "md",
        overflow: "auto",
        border: "2px solid rgba(102, 126, 234, 0.2)",
      }}
    >
      {/* Header with Search */}
      <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography level="h4" sx={{ color: "#667eea", fontWeight: 700 }}>
            🏥 Reserve Patients
          </Typography>
          <Chip color="primary" variant="soft">
            Total: {totalCount || patients.length}
          </Chip>
        </Box>

        {/* Search Bar */}
        <Input
          placeholder="Search by name, phone, document number, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startDecorator={<SearchIcon />}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && filteredPatients.length === 0 && (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography level="body-md" sx={{ color: "#666" }}>
            {searchTerm
              ? "No patients found matching your search."
              : "No patients added yet. Add your first patient above!"}
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && filteredPatients.length > 0 && (
        <Table
          stickyHeader
          sx={{
            "& thead th": {
              fontWeight: 700,
              background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
              color: "#667eea",
            },
            "& tbody tr:hover": {
              background: "rgba(102, 126, 234, 0.05)",
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "80px" }}>
                <SortableHeader label="ID" sortKey="patient_admission_id" />
              </th>
              <th style={{ width: "200px" }}>
                <SortableHeader label="Full Name" sortKey="full_name" />
              </th>
              <th style={{ width: "120px" }}>
                <SortableHeader label="Phone" sortKey="phone_number" />
              </th>
              <th style={{ width: "120px" }}>
                <SortableHeader label="Birth Date" sortKey="birth_date" />
              </th>
              <th style={{ width: "60px", textAlign: "center" }}>Sex</th>
              <th style={{ width: "140px" }}>Document #</th>
              <th style={{ width: "140px" }}>Medical File #</th>
              <th style={{ width: "150px" }}>
                <SortableHeader label="Created" sortKey="created_at" />
              </th>
              <th style={{ width: "100px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.patient_admission_id}>
                {/* Patient ID */}
                <td>
                  <Chip color="primary" variant="soft" size="sm">
                    {patient.patient_admission_id}
                  </Chip>
                </td>

                {/* Full Name */}
                <td>
                  <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                    {patient.full_name || `${patient.first_name || ""} ${patient.middle_name || ""} ${patient.last_name || ""}`.trim()}
                  </Typography>
                  {patient.mother_name && (
                    <Typography level="body-xs" sx={{ color: "#666" }}>
                      Mother: {patient.mother_name}
                    </Typography>
                  )}
                </td>

                {/* Phone Number */}
                <td>
                  <Typography level="body-sm">
                    {patient.phone_number || "-"}
                  </Typography>
                  {patient.phone_number2 && (
                    <Typography level="body-xs" sx={{ color: "#666" }}>
                      {patient.phone_number2}
                    </Typography>
                  )}
                </td>

                {/* Birth Date */}
                <td>
                  <Typography level="body-sm">
                    {formatDate(patient.birth_date)}
                  </Typography>
                </td>

                {/* Sex */}
                <td style={{ textAlign: "center" }}>
                  {patient.sex ? (
                    <Chip
                      color={patient.sex === "M" ? "primary" : "danger"}
                      variant="soft"
                      size="sm"
                    >
                      {patient.sex === "M" ? "M" : "F"}
                    </Chip>
                  ) : (
                    "-"
                  )}
                </td>

                {/* Document Number */}
                <td>
                  <Typography level="body-sm">
                    {patient.document_number || "-"}
                  </Typography>
                </td>

                {/* Medical File Number */}
                <td>
                  <Typography level="body-sm">
                    {patient.medical_file_number || "-"}
                  </Typography>
                </td>

                {/* Created At */}
                <td>
                  <Typography level="body-sm">
                    {patient.created_at
                      ? new Date(patient.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </Typography>
                </td>

                {/* Actions */}
                <td>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Edit Patient">
                      <IconButton
                        size="sm"
                        color="primary"
                        onClick={() => onEdit && onEdit(patient.patient_admission_id, patient)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Patient">
                      <IconButton
                        size="sm"
                        color="danger"
                        onClick={() => onDelete && onDelete(patient.patient_admission_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Footer with count */}
      {!loading && filteredPatients.length > 0 && (
        <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", textAlign: "center" }}>
          <Typography level="body-sm" sx={{ color: "#666" }}>
            Showing {filteredPatients.length} of {totalCount || patients.length} patients
            {searchTerm && ` (filtered)`}
          </Typography>
        </Box>
      )}
    </Sheet>
  );
};

export default PatientTable;
