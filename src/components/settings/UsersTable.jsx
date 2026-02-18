// src/components/settings/UsersTable.jsx
import React, { useState, useMemo } from "react";
import {
  Table,
  Sheet,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Button,
  Chip,
  Card,
  Checkbox,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import EmailIcon from "@mui/icons-material/Email";

const UsersTable = ({ users, onCreateClick, onEditClick, onDeleteClick, onBulkDeleteClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: "username", direction: "asc" });
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Debug logging
  console.log('UsersTable received users:', users);
  console.log('Users is array:', Array.isArray(users));
  console.log('Users length:', users?.length);

  // Sort users
  const sortedUsers = useMemo(() => {
    let sorted = [...users];
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
  }, [users, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle individual selection
  const handleSelectUser = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (onBulkDeleteClick) {
      onBulkDeleteClick(selectedUserIds);
      setSelectedUserIds([]); // Clear selection after delete
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
        justifyContent: "center",
        gap: 0.5,
        userSelect: "none",
        "&:hover": { color: "#667eea" },
      }}
    >
      {label}
      {sortConfig.key === sortKey && (
        <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
      )}
    </Box>
  );

  return (
    <Box>
      {/* Toolbar */}
      <Card sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography level="h4">Users Management</Typography>
          {selectedUserIds.length > 0 && (
            <Chip color="primary" size="lg">
              {selectedUserIds.length} selected
            </Chip>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedUserIds.length > 0 && (
            <Button
              startDecorator={<DeleteSweepIcon />}
              onClick={handleBulkDelete}
              color="danger"
              size="md"
              variant="solid"
            >
              Delete Selected ({selectedUserIds.length})
            </Button>
          )}
          <Button
            startDecorator={<AddIcon />}
            onClick={onCreateClick}
            color="primary"
            size="md"
          >
            Create User
          </Button>
        </Box>
      </Card>

      {/* Table */}
      <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "auto" }}>
        <Table stickyHeader>
          <thead>
            <tr>
              <th style={{ width: "5%", textAlign: "center" }}>Select</th>
              <th style={{ width: "15%", textAlign: "center" }}>
                <SortableHeader label="Username" sortKey="username" />
              </th>
              <th style={{ width: "15%", textAlign: "center" }}>
                <SortableHeader label="Display Name" sortKey="display_name" />
              </th>
              <th style={{ width: "15%", textAlign: "center" }}>
                <SortableHeader label="Department" sortKey="department_display_name" />
              </th>
              <th style={{ width: "13%", textAlign: "center" }}>
                <SortableHeader label="Role" sortKey="role_name" />
              </th>
              <th style={{ width: "5%", textAlign: "center" }}>
                <Tooltip title="Email for notifications">
                  <Box sx={{ cursor: "help" }}>
                    <EmailIcon fontSize="small" />
                  </Box>
                </Tooltip>
              </th>
              <th style={{ width: "12%", textAlign: "center" }}>
                <SortableHeader label="Org Unit" sortKey="org_unit_name" />
              </th>
              <th style={{ width: "10%", textAlign: "center" }}>
                <SortableHeader label="Status" sortKey="is_active" />
              </th>
              <th style={{ width: "15%", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>
                  <Typography level="body-md" sx={{ color: "neutral.500" }}>
                    No users found
                  </Typography>
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.user_id}>
                  <td style={{ textAlign: "center" }}>
                    <Checkbox
                      checked={selectedUserIds.includes(user.user_id)}
                      onChange={() => handleSelectUser(user.user_id)}
                      size="sm"
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>{user.username}</td>
                  <td style={{ textAlign: "center" }}>{user.display_name || "-"}</td>
                  <td style={{ textAlign: "center" }}>{user.department_display_name || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    <Chip
                      size="sm"
                      color={
                        user.role_name === "SOFTWARE_ADMIN"
                          ? "danger"
                          : user.role_name === "SECTION_ADMIN"
                          ? "primary"
                          : "neutral"
                      }
                    >
                      {user.role_name}
                    </Chip>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {user.email ? (
                      <Tooltip title={user.email}>
                        <EmailIcon fontSize="small" color="primary" sx={{ cursor: "pointer" }} />
                      </Tooltip>
                    ) : (
                      <Typography level="body-xs" sx={{ color: "neutral.400" }}>-</Typography>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{user.org_unit_name || "-"}</td>
                  <td style={{ textAlign: "center" }}>
                    <Typography
                      level="body-sm"
                      sx={{
                        color: user.is_active ? "success.plainColor" : "neutral.plainColor",
                        fontWeight: 600,
                      }}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Typography>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Tooltip title="Edit User">
                        <IconButton
                          size="sm"
                          color="primary"
                          variant="outlined"
                          onClick={() => onEditClick(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="sm"
                          color="danger"
                          variant="outlined"
                          onClick={() => onDeleteClick(user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );
};

export default UsersTable;
