// src/pages/settings/SettingsUsersTab.jsx
import React, { useState, useEffect } from "react";
import { Box, Card, Typography, CircularProgress, Alert } from "@mui/joy";
import { listUsers, deleteUser } from "../../api/settingsUsersApi";
import { useAuth } from "../../context/AuthContext";
import { isSoftwareAdmin } from "../../utils/roleGuards";
import UsersTable from "../../components/settings/UsersTable";
import CreateUserDialog from "../../components/settings/CreateUserDialog";
import EditUserDialog from "../../components/settings/EditUserDialog";

const SettingsUsersTab = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Guard: Only SOFTWARE_ADMIN can access this component
  const isAuthorized = isSoftwareAdmin(user);

  useEffect(() => {
    // Only load users if authorized
    if (isAuthorized) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setCreateDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      await deleteUser(user.user_id);
      await loadUsers(); // Reload users list
    } catch (err) {
      setError(err.message || "Failed to delete user");
      console.error("Error deleting user:", err);
    }
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  const handleUserSaved = () => {
    loadUsers();
  };

  // Show loading spinner
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show not authorized message for non-admin users
  if (!isAuthorized) {
    return (
      <Alert color="warning" sx={{ mb: 3 }}>
        Not authorized. This page is only accessible to SOFTWARE_ADMIN users.
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert color="danger" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <UsersTable
        users={users}
        onCreateClick={handleCreateUser}
        onEditClick={handleEditUser}
        onDeleteClick={handleDeleteUser}
      />

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={handleUserCreated}
      />

      <EditUserDialog
        open={editDialogOpen}
        user={selectedUser}
        onClose={() => setEditDialogOpen(false)}
        onSaved={handleUserSaved}
      />
    </Box>
  );
};

export default SettingsUsersTab;
