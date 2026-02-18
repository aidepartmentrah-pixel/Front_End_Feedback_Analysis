// src/pages/settings/UnifiedUsersTab.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/joy";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuth } from "../../context/AuthContext";
import { isSoftwareAdmin } from "../../utils/roleGuards";
import { canRoleSeeSettingsTab, SETTINGS_TAB_KEYS } from "../../security/roleVisibilityMap";
import { listUsers, deleteUser as deleteUserSettings, bulkDeleteUsers } from "../../api/settingsUsersApi";
import {
  getUserCredentials,
  exportCredentialsMarkdown,
  deleteUser as deleteUserAdmin,
} from "../../api/adminUsers";
import UsersTable from "../../components/settings/UsersTable";
import CreateUserDialog from "../../components/settings/CreateUserDialog";
import EditUserDialog from "../../components/settings/EditUserDialog";
import UsersCredentialsTable from "../../components/settings/UsersCredentialsTable";

/**
 * Unified Users Management Tab
 * Combines production user management with testing/development tools
 */
const UnifiedUsersTab = () => {
  const { user } = useAuth();
  
  // User data
  const [users, setUsers] = useState([]);
  const [credentialUsers, setCredentialUsers] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const isAuthorized = isSoftwareAdmin(user) || (user?.roles?.includes('COMPLAINT_SUPERVISOR'));

  useEffect(() => {
    if (isAuthorized) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      await Promise.all([
        loadUsers(),
        loadCredentialUsers(),
      ]);
    } catch (err) {
      const errorMsg = err.response?.data?.detail?.message || 
                      err.response?.data?.detail || 
                      err.message || 
                      "Failed to load data";
      setError(errorMsg);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await listUsers();
      console.log('📦 Users API Response:', data);
      console.log('👥 Users array:', data.users);
      console.log('👥 Users count:', data.users ? data.users.length : 0);
      
      // Ensure data.users is an array
      const usersList = Array.isArray(data.users) ? data.users : 
                        Array.isArray(data) ? data : [];
      
      console.log('✅ Setting users:', usersList);
      setUsers(usersList);
    } catch (err) {
      console.error("Error loading users:", err);
      console.error("Error details:", err.response?.data);
      setUsers([]); // Set empty array on error
      throw err;
    }
  };

  const loadCredentialUsers = async () => {
    try {
      const data = await getUserCredentials();
      setCredentialUsers(data.users || []);
    } catch (err) {
      console.error("Error loading credential users:", err);
      // Don't throw - this API might not exist yet
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
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }
    
    try {
      await deleteUserSettings(user.user_id);
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to delete user");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleBulkDeleteUsers = async (userIds) => {
    if (userIds.length === 0) {
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${userIds.length} user(s)? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await bulkDeleteUsers(userIds);
      setSuccess(`Successfully deleted ${userIds.length} user(s)`);
      setTimeout(() => setSuccess(null), 3000);
      await loadAllData();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to delete users";
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUserCreated = () => {
    loadAllData();
    setSuccess("User created successfully");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUserSaved = () => {
    loadAllData();
    setSuccess("User updated successfully");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleExportCredentials = async () => {
    try {
      await exportCredentialsMarkdown();
      setSuccess("Credentials exported successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to export credentials");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRefresh = () => {
    loadAllData();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthorized) {
    return (
      <Alert color="warning" sx={{ mb: 3 }}>
        Not authorized. This page is only accessible to SOFTWARE_ADMIN users.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography level="h3" sx={{ fontWeight: 700 }}>
            👥 User Management
          </Typography>
          <Typography level="body-sm" sx={{ color: "neutral.500" }}>
            Manage system users, roles, and testing credentials
          </Typography>
        </Box>
        
        <Button
          startDecorator={<RefreshIcon />}
          variant="outlined"
          onClick={handleRefresh}
          size="sm"
        >
          Refresh
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert color="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Production User Management Section */}
      <Card variant="outlined" sx={{ p: 3 }}>
        <Alert color="primary" variant="soft" sx={{ mb: 3 }}>
          <Typography level="body-sm">
            📋 <strong>Production User Management:</strong> Create, edit, and manage system users securely.
          </Typography>
        </Alert>

        <UsersTable
          users={users}
          onCreateClick={handleCreateUser}
          onEditClick={handleEditUser}
          onDeleteClick={handleDeleteUser}
          onBulkDeleteClick={handleBulkDeleteUsers}
        />
      </Card>

      <Divider />

      {/* Testing Tools Section */}
      <Card variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography level="h4" sx={{ fontWeight: 600 }}>
            🧪 Testing Tools
          </Typography>
          <Button
            startDecorator={<DownloadIcon />}
            variant="solid"
            color="warning"
            onClick={handleExportCredentials}
            size="sm"
          >
            Export All Credentials
          </Button>
        </Box>

        <Alert color="warning" variant="soft" sx={{ mb: 3 }}>
          <Typography level="body-sm">
            ⚠️ <strong>Testing Mode:</strong> View credentials and export data.
            For development and testing purposes only.
          </Typography>
        </Alert>

        {/* Credentials Table */}
        <Box>
          <Typography level="h5" sx={{ mb: 2, fontWeight: 600 }}>
            🔐 User Credentials (With Passwords)
          </Typography>
          <UsersCredentialsTable 
            users={credentialUsers}
            onRefresh={loadCredentialUsers}
          />
        </Box>
      </Card>

      {/* Dialogs */}
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

export default UnifiedUsersTab;
