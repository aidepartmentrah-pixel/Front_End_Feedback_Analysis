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
import theme from '../../theme';

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
        "&:hover": { color: theme.colors.primary },
      }}
    >
      {label}
      {sortConfig.key === sortKey && (
        <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
      )}
    </Box>
  );

  // Component hidden - all elements removed per user request
  return null;
};

export default DepartmentTable;
