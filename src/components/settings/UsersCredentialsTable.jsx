// src/components/settings/UsersCredentialsTable.jsx
import React, { useState } from "react";
import {
  Box,
  Table,
  Sheet,
  Typography,
  Input,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/joy";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * UsersCredentialsTable - Displays users with visible passwords for testing
 */
const UsersCredentialsTable = ({ users, onRefresh, onDeleteUser, onEditUser }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    // Show temporary feedback (you can use a proper Snackbar component)
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
    setTimeout(() => setSnackbar({ open: false, message: "" }), 2000);
  };

  const handleRefresh = async () => {
    setLoading(true);
    if (onRefresh) {
      await onRefresh();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Refresh */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography level="body-sm" sx={{ color: "neutral.500" }}>
          {users.length} user{users.length !== 1 ? "s" : ""} found
        </Typography>
        
        <Button
          startDecorator={<RefreshIcon />}
          variant="outlined"
          size="sm"
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Table */}
      <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "auto", maxHeight: 600 }}>
        <Table stickyHeader stripe="odd" size="sm">
          <thead>
            <tr>
              <th style={{ width: "15%" }}>Display Name</th>
              <th style={{ width: "12%" }}>Username</th>
              <th style={{ width: "12%" }}>Role</th>
              <th style={{ width: "15%" }}>Org Unit</th>
              <th style={{ width: "8%" }}>Active</th>
              <th style={{ width: "20%" }}>Test Password</th>
              <th style={{ width: "18%", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                  <Typography level="body-sm" sx={{ color: "neutral.500" }}>
                    No users found
                  </Typography>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.user_id}>
                  {/* Display Name */}
                  <td>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {user.display_name || "(not set)"}
                    </Typography>
                  </td>

                  {/* Username */}
                  <td>
                    <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                      {user.username}
                    </Typography>
                  </td>

                  {/* Role */}
                  <td>
                    <Typography
                      level="body-xs"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: "sm",
                        bgcolor:
                          user.role === "SOFTWARE_ADMIN"
                            ? "danger.softBg"
                            : user.role === "COMPLAINT_SUPERVISOR"
                            ? "warning.softBg"
                            : "primary.softBg",
                        color:
                          user.role === "SOFTWARE_ADMIN"
                            ? "danger.plainColor"
                            : user.role === "COMPLAINT_SUPERVISOR"
                            ? "warning.plainColor"
                            : "primary.plainColor",
                        display: "inline-block",
                        fontSize: "0.7rem",
                      }}
                    >
                      {user.role}
                    </Typography>
                  </td>

                  {/* Org Unit */}
                  <td>
                    <Typography level="body-sm" sx={{ fontSize: "0.8rem" }}>
                      {user.org_unit_name || "(none)"}
                    </Typography>
                  </td>

                  {/* Active Status */}
                  <td>
                    <Typography
                      level="body-sm"
                      sx={{
                        color: user.is_active ? "success.plainColor" : "neutral.plainColor",
                        fontWeight: 600,
                      }}
                    >
                      {user.is_active ? "✓ Yes" : "✗ No"}
                    </Typography>
                  </td>

                  {/* Test Password */}
                  <td>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                      <Input
                        value={user.test_password || "(not set)"}
                        readOnly
                        size="sm"
                        sx={{ 
                          fontFamily: "monospace", 
                          fontSize: "0.8rem",
                          minWidth: 100,
                          maxWidth: 150,
                        }}
                      />
                      {user.test_password && (
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => copyToClipboard(user.test_password, "Password")}
                          title="Copy password"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      )}
                    </Box>
                  </td>

                  {/* Actions */}
                  <td>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      {onEditUser && (
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="primary"
                          onClick={() => onEditUser(user)}
                          title="Edit user"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      
                      {onDeleteUser && user.role !== "SOFTWARE_ADMIN" && (
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="danger"
                          onClick={() => onDeleteUser(user)}
                          title="Delete user"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>

      {/* Snackbar for copy feedback */}
      {snackbar.open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            bgcolor: "success.solidBg",
            color: "white",
            px: 2,
            py: 1,
            borderRadius: "sm",
            boxShadow: "md",
            zIndex: 10000,
          }}
        >
          <Typography level="body-sm">{snackbar.message}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default UsersCredentialsTable;
