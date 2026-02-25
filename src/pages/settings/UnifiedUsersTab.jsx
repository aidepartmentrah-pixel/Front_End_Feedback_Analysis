// src/pages/settings/UnifiedUsersTab.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/joy";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuth } from "../../context/AuthContext";
import { isSoftwareAdmin } from "../../utils/roleGuards";
import { canRoleSeeSettingsTab, SETTINGS_TAB_KEYS } from "../../security/roleVisibilityMap";
import { listUsers, deleteUser as deleteUserSettings, bulkDeleteUsers } from "../../api/settingsUsersApi";
import UsersTable from "../../components/settings/UsersTable";
import CreateUserDialog from "../../components/settings/CreateUserDialog";
import EditUserDialog from "../../components/settings/EditUserDialog";
import apiClient from "../../api/apiClient";

/**
 * Unified Users Management Tab
 * Production user management
 */
const UnifiedUsersTab = () => {
  const { user } = useAuth();
  
  // User data
  const [users, setUsers] = useState([]);
  
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
      await loadUsers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorMsg = "Failed to load data";
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorMsg = detail.msg || detail.message || JSON.stringify(detail);
      } else if (err.message) {
        errorMsg = err.message;
      }
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
      const detail = err.response?.data?.detail;
      let errorMsg = "Failed to delete users";
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorMsg = detail.msg || detail.message || JSON.stringify(detail);
      } else if (err.message) {
        errorMsg = err.message;
      }
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

  const handleRefresh = () => {
    loadAllData();
  };

  const handleExportCredentials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/testing/user-credentials-word', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'user_credentials.docx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].trim();
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Credentials exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export credentials. Ensure you have SOFTWARE_ADMIN role.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
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
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startDecorator={<DownloadIcon />}
            variant="solid"
            color="success"
            onClick={handleExportCredentials}
            size="sm"
            title="Export all user credentials to Word document"
          >
            Export Credentials
          </Button>
          <Button
            startDecorator={<RefreshIcon />}
            variant="outlined"
            onClick={handleRefresh}
            size="sm"
          >
            Refresh
          </Button>
        </Box>
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
