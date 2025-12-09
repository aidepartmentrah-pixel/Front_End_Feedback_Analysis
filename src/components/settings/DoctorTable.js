// src/components/settings/DoctorTable.js
import React, { useState, useMemo } from "react";
import {
  Table,
  Sheet,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Input,
  Select,
  Option,
  CircularProgress,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

const DoctorTable = ({ doctors, departments, onEdit, onDelete, loading }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  // Build department map
  const departmentMap = useMemo(() => {
    const map = {};
    departments.forEach((dept) => {
      map[dept.id] = dept.name;
    });
    return map;
  }, [departments]);

  // Sort doctors
  const sortedDoctors = useMemo(() => {
    let sorted = [...doctors];
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
  }, [doctors, sortConfig]);

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return sortedDoctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept =
        filterDept === "all" || doc.department_id === parseInt(filterDept);
      return matchesSearch && matchesDept;
    });
  }, [sortedDoctors, searchTerm, filterDept]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Start editing
  const handleStartEdit = (doctor) => {
    setEditingId(doctor.id);
    setEditForm({
      name: doctor.name,
      specialty: doctor.specialty,
      department_id: doctor.department_id,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Save edit
  const handleSaveEdit = async () => {
    const success = await onEdit(editingId, editForm);
    if (success) {
      setEditingId(null);
      setEditForm({});
    }
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
        <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Sheet
      sx={{
        borderRadius: "8px",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        overflow: "hidden",
      }}
    >
      {/* Filters */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
        }}
      >
        <Input
          placeholder="🔍 Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: "200px" }}
        />
        <Select
          value={filterDept}
          onChange={(e, value) => setFilterDept(value)}
          sx={{ minWidth: "200px" }}
        >
          <Option value="all">All Departments</Option>
          {departments.map((dept) => (
            <Option key={dept.id} value={dept.id}>
              {dept.name}
            </Option>
          ))}
        </Select>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto" }}>
        <Table
          sx={{
            "--TableCell-paddingY": "12px",
            "--TableCell-paddingX": "16px",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "50px" }}>ID</th>
              <th>
                <SortableHeader label="Doctor Name" sortKey="name" />
              </th>
              <th>
                <SortableHeader label="Specialty" sortKey="specialty" />
              </th>
              <th>Department</th>
              <th style={{ width: "120px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                  <Typography level="body-md" sx={{ color: "#999" }}>
                    No doctors found
                  </Typography>
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>
                    {editingId === doctor.id ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        size="sm"
                      />
                    ) : (
                      <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                        {doctor.name}
                      </Typography>
                    )}
                  </td>
                  <td>
                    {editingId === doctor.id ? (
                      <Input
                        value={editForm.specialty}
                        onChange={(e) =>
                          setEditForm({ ...editForm, specialty: e.target.value })
                        }
                        size="sm"
                      />
                    ) : (
                      <Typography level="body-sm">{doctor.specialty}</Typography>
                    )}
                  </td>
                  <td>
                    {editingId === doctor.id ? (
                      <Select
                        value={editForm.department_id}
                        onChange={(e, value) =>
                          setEditForm({ ...editForm, department_id: value })
                        }
                        size="sm"
                      >
                        {departments.map((dept) => (
                          <Option key={dept.id} value={dept.id}>
                            {dept.name}
                          </Option>
                        ))}
                      </Select>
                    ) : (
                      <Typography level="body-xs" sx={{ color: "#666" }}>
                        {departmentMap[doctor.department_id] || "N/A"}
                      </Typography>
                    )}
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      {editingId === doctor.id ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton
                              size="sm"
                              color="success"
                              onClick={handleSaveEdit}
                            >
                              <SaveIcon sx={{ fontSize: "18px" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton
                              size="sm"
                              color="neutral"
                              onClick={handleCancelEdit}
                            >
                              <CloseIcon sx={{ fontSize: "18px" }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              size="sm"
                              color="warning"
                              onClick={() => handleStartEdit(doctor)}
                            >
                              <EditIcon sx={{ fontSize: "18px" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="sm"
                              color="danger"
                              onClick={() => onDelete(doctor.id)}
                            >
                              <DeleteIcon sx={{ fontSize: "18px" }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(102, 126, 234, 0.1)",
          background: "#f9fafb",
        }}
      >
        <Typography level="body-sm" sx={{ color: "#666" }}>
          Total: {filteredDoctors.length} doctor(s)
        </Typography>
      </Box>
    </Sheet>
  );
};

export default DoctorTable;
