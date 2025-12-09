// src/components/settings/DepartmentTable.js
import React, { useState, useMemo } from "react";
import {
  Table,
  Sheet,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Input,
  CircularProgress,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

const DepartmentTable = ({ departments, onEdit, onDelete, loading }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  // Build hierarchy map for parent department display
  const departmentMap = useMemo(() => {
    const map = {};
    departments.forEach((dept) => {
      map[dept.id] = dept.name;
    });
    return map;
  }, [departments]);

  // Sort departments
  const sortedDepartments = useMemo(() => {
    let sorted = [...departments];
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
  }, [departments, sortConfig]);

  // Filter departments by search term
  const filteredDepartments = useMemo(() => {
    return sortedDepartments.filter((dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedDepartments, searchTerm]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Start editing
  const handleStartEdit = (dept) => {
    setEditingId(dept.id);
    setEditForm({
      name: dept.name,
      parent_id: dept.parent_id || "",
      type: dept.type,
      category: dept.category || "",
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
      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(102, 126, 234, 0.1)" }}>
        <Input
          placeholder="🔍 Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: "400px" }}
        />
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
                <SortableHeader label="Department Name" sortKey="name" />
              </th>
              <th>Parent Department</th>
              <th>
                <SortableHeader label="Category" sortKey="category" />
              </th>
              <th>
                <SortableHeader label="Type" sortKey="type" />
              </th>
              <th style={{ width: "120px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  <Typography level="body-md" sx={{ color: "#999" }}>
                    No departments found
                  </Typography>
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td>
                    {editingId === dept.id ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        size="sm"
                      />
                    ) : (
                      <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                        {dept.name}
                      </Typography>
                    )}
                  </td>
                  <td>
                    <Typography level="body-xs" sx={{ color: "#666" }}>
                      {dept.parent_id
                        ? departmentMap[dept.parent_id] || "N/A"
                        : "—"}
                    </Typography>
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#764ba2",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {dept.category || "—"}
                    </Box>
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          dept.type === "internal" ? "#667eea" : "#ffa502",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {dept.type === "internal" ? "Internal" : "External"}
                    </Box>
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      {editingId === dept.id ? (
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
                              onClick={() => handleStartEdit(dept)}
                            >
                              <EditIcon sx={{ fontSize: "18px" }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="sm"
                              color="danger"
                              onClick={() => onDelete(dept.id)}
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
          Total: {filteredDepartments.length} department(s)
        </Typography>
      </Box>
    </Sheet>
  );
};

export default DepartmentTable;
