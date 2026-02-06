// src/components/settings/UsersAndSectionsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Select,
  Option,
  Input,
  FormControl,
  FormLabel,
  Alert,
  Table,
  Sheet,
  IconButton,
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
  Snackbar,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  getUserInventory,
  createSectionWithAdmin,
  getUserCredentials,
  deleteUser,
  recreateSectionAdmin,
  exportCredentialsMarkdown,
} from "../../api/adminUsers";

/**
 * Users & Sections (Testing) Tab
 * Admin-only tab for managing test users and sections
 */
const UsersAndSectionsTab = () => {
  // Org units state
  const [orgUnits, setOrgUnits] = useState([]);
  const [administrations, setAdministrations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  // Form state
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [sectionName, setSectionName] = useState("");

  // Table state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Result state
  const [creationResult, setCreationResult] = useState(null);
  const [recreateResult, setRecreateResult] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "success" });

  // Load org units on mount
  useEffect(() => {
    loadOrgUnits();
    loadUsers();
  }, []);

  // Filter departments when administration changes
  useEffect(() => {
    if (selectedAdmin) {
      const filtered = departments.filter((dept) => dept.ParentID === parseInt(selectedAdmin));
      setFilteredDepartments(filtered);
      setSelectedDepartment(""); // Reset department selection
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedAdmin, departments]);

  const loadOrgUnits = async () => {
    try {
      const data = await getUserInventory();
      setOrgUnits(data.org_units || []);

      // Separate by type
      const admins = data.org_units.filter((unit) => unit.Type === "ADMINISTRATION");
      const depts = data.org_units.filter((unit) => unit.Type === "DEPARTMENT");

      setAdministrations(admins);
      setDepartments(depts);
    } catch (err) {
      setError("Failed to load organizational units");
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getUserCredentials();
      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to load user credentials");
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateSection = async () => {
    if (!sectionName || !selectedDepartment) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createSectionWithAdmin(sectionName, parseInt(selectedDepartment));

      setCreationResult({
        section_id: result.section_id,
        username: result.username,
        password: result.password,
      });

      // Reset form
      setSectionName("");
      setSelectedAdmin("");
      setSelectedDepartment("");

      // Refresh users table
      await loadUsers();

      setSnackbar({
        open: true,
        message: "Section and admin user created successfully!",
        color: "success",
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create section");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username, role) => {
    if (role === "SOFTWARE_ADMIN") {
      setSnackbar({
        open: true,
        message: "Cannot delete SOFTWARE_ADMIN user",
        color: "danger",
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await deleteUser(userId);
      setSnackbar({
        open: true,
        message: `User "${username}" deleted successfully`,
        color: "success",
      });
      await loadUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to delete user",
        color: "danger",
      });
      console.error(err);
    }
  };

  const handleRecreateSectionAdmin = async (sectionId, sectionName) => {
    if (!window.confirm(`Recreate admin user for section "${sectionName}"?`)) {
      return;
    }

    try {
      const result = await recreateSectionAdmin(sectionId);
      setRecreateResult({
        username: result.username,
        password: result.password,
      });

      await loadUsers();

      setSnackbar({
        open: true,
        message: "Section admin recreated successfully!",
        color: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Failed to recreate admin",
        color: "danger",
      });
      console.error(err);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      await exportCredentialsMarkdown();
      setSnackbar({
        open: true,
        message: "Credentials exported successfully!",
        color: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to export credentials",
        color: "danger",
      });
      console.error(err);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: `${label} copied to clipboard`,
      color: "success",
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header Alert */}
      <Alert color="warning" variant="soft">
        <Typography level="body-sm">
          ⚠️ <strong>Testing Only:</strong> This tab is for creating test accounts during development.
          All credentials are visible here for testing purposes.
        </Typography>
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert color="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Card A: Create Section + Admin User */}
      <Card variant="outlined">
        <Typography level="h4" sx={{ mb: 2 }}>
          🏗️ Create Section + Admin User
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl>
            <FormLabel>Administration</FormLabel>
            <Select
              value={selectedAdmin}
              onChange={(e, newValue) => setSelectedAdmin(newValue)}
              placeholder="Select Administration"
            >
              {administrations.map((admin) => (
                <Option key={admin.ID} value={admin.ID}>
                  {admin.Name}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Department</FormLabel>
            <Select
              value={selectedDepartment}
              onChange={(e, newValue) => setSelectedDepartment(newValue)}
              placeholder="Select Department"
              disabled={!selectedAdmin}
            >
              {filteredDepartments.map((dept) => (
                <Option key={dept.ID} value={dept.ID}>
                  {dept.Name}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Section Name</FormLabel>
            <Input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Enter section name"
            />
          </FormControl>

          <Button
            onClick={handleCreateSection}
            loading={loading}
            disabled={!sectionName || !selectedDepartment}
            color="primary"
          >
            Create Section + Admin User
          </Button>
        </Box>

        {/* Creation Result */}
        {creationResult && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "success.softBg", borderRadius: "sm" }}>
            <Typography level="title-md" sx={{ mb: 2, color: "success.plainColor" }}>
              ✅ Section Created Successfully
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Section ID:
                </Typography>
                <Input value={creationResult.section_id} readOnly size="sm" sx={{ flex: 1 }} />
                <IconButton
                  size="sm"
                  onClick={() => copyToClipboard(creationResult.section_id, "Section ID")}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Username:
                </Typography>
                <Input value={creationResult.username} readOnly size="sm" sx={{ flex: 1 }} />
                <IconButton
                  size="sm"
                  onClick={() => copyToClipboard(creationResult.username, "Username")}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                  Password:
                </Typography>
                <Input value={creationResult.password} readOnly size="sm" sx={{ flex: 1 }} />
                <IconButton
                  size="sm"
                  onClick={() => copyToClipboard(creationResult.password, "Password")}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            <Button
              size="sm"
              variant="plain"
              sx={{ mt: 2 }}
              onClick={() => setCreationResult(null)}
            >
              Dismiss
            </Button>
          </Box>
        )}
      </Card>

      {/* Card B: User Credentials Table */}
      <Card variant="outlined">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography level="h4">👥 User Credentials</Typography>
          <Button
            startDecorator={<RefreshIcon />}
            variant="outlined"
            size="sm"
            onClick={loadUsers}
            loading={loadingUsers}
          >
            Refresh
          </Button>
        </Box>

        <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "auto" }}>
          <Table stickyHeader>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Org Unit</th>
                <th>Active</th>
                <th>Test Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    <CircularProgress />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.username}</td>
                    <td>
                      <Typography
                        level="body-sm"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: "sm",
                          bgcolor:
                            user.role === "SOFTWARE_ADMIN"
                              ? "danger.softBg"
                              : "primary.softBg",
                          color:
                            user.role === "SOFTWARE_ADMIN"
                              ? "danger.plainColor"
                              : "primary.plainColor",
                          display: "inline-block",
                        }}
                      >
                        {user.role}
                      </Typography>
                    </td>
                    <td>{user.org_unit_name || "(none)"}</td>
                    <td>
                      <Typography
                        level="body-sm"
                        sx={{
                          color: user.is_active ? "success.plainColor" : "neutral.plainColor",
                        }}
                      >
                        {user.is_active ? "✓ Yes" : "✗ No"}
                      </Typography>
                    </td>
                    <td>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Input
                          value={user.test_password || "(not set)"}
                          readOnly
                          size="sm"
                          sx={{ fontFamily: "monospace", maxWidth: 200 }}
                        />
                        {user.test_password && (
                          <IconButton
                            size="sm"
                            onClick={() =>
                              copyToClipboard(user.test_password, "Password")
                            }
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        )}
                      </Box>
                    </td>
                    <td>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {/* Recreate Section Admin */}
                        {user.role === "SECTION_ADMIN" && (
                          <IconButton
                            size="sm"
                            color="warning"
                            variant="outlined"
                            onClick={() =>
                              handleRecreateSectionAdmin(
                                user.org_unit_id,
                                user.org_unit_name
                              )
                            }
                            title="Recreate Section Admin"
                          >
                            <RestartAltIcon />
                          </IconButton>
                        )}

                        {/* Delete User */}
                        <IconButton
                          size="sm"
                          color="danger"
                          variant="outlined"
                          onClick={() =>
                            handleDeleteUser(user.user_id, user.username, user.role)
                          }
                          disabled={user.role === "SOFTWARE_ADMIN"}
                          title="Delete User"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Sheet>
      </Card>

      {/* Card C: Export Credentials */}
      <Card variant="outlined">
        <Typography level="h4" sx={{ mb: 2 }}>
          📄 Export Credentials
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2, color: "neutral.plainColor" }}>
          Export all user credentials as a markdown file for testing reference.
        </Typography>
        <Button
          startDecorator={<DownloadIcon />}
          onClick={handleExportMarkdown}
          color="neutral"
          variant="outlined"
        >
          Export All Credentials (Markdown)
        </Button>
      </Card>

      {/* Recreate Result Modal */}
      <Modal open={!!recreateResult} onClose={() => setRecreateResult(null)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            ✅ Section Admin Recreated
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                Username:
              </Typography>
              <Input value={recreateResult?.username} readOnly size="sm" sx={{ flex: 1 }} />
              <IconButton
                size="sm"
                onClick={() => copyToClipboard(recreateResult?.username, "Username")}
              >
                <ContentCopyIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography level="body-sm" sx={{ fontWeight: "bold", minWidth: 100 }}>
                Password:
              </Typography>
              <Input value={recreateResult?.password} readOnly size="sm" sx={{ flex: 1 }} />
              <IconButton
                size="sm"
                onClick={() => copyToClipboard(recreateResult?.password, "Password")}
              >
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Box>

          <Button sx={{ mt: 2 }} onClick={() => setRecreateResult(null)}>
            Close
          </Button>
        </ModalDialog>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        color={snackbar.color}
        variant="soft"
      >
        {snackbar.message}
      </Snackbar>
    </Box>
  );
};

export default UsersAndSectionsTab;
