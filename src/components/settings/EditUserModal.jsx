// src/components/settings/EditUserModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import theme from "../../theme";

/**
 * Modal for editing user credentials
 * Allows editing display name, username, and password
 */
const EditUserModal = ({ open, onClose, user, onSave }) => {
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setUsername(user.username || "");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setValidationErrors({});
    }
  }, [user]);

  // Validation function
  const validate = () => {
    const errors = {};

    // Display name validation
    if (displayName.trim().length < 2) {
      errors.displayName = "Display name must be at least 2 characters";
    }
    if (displayName.trim().length > 100) {
      errors.displayName = "Display name must be less than 100 characters";
    }

    // Username validation
    if (username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }
    if (username.trim().length > 50) {
      errors.username = "Username must be less than 50 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Password validation (only if provided)
    if (password) {
      if (password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    // Validate
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build update object (only include changed/provided fields)
      const updates = {};

      if (displayName.trim() !== (user.display_name || "")) {
        updates.display_name = displayName.trim();
      }

      if (username.trim() !== user.username) {
        updates.username = username.trim();
      }

      if (password) {
        updates.password = password;
      }

      // Check if anything changed
      if (Object.keys(updates).length === 0) {
        setError("No changes detected");
        setLoading(false);
        return;
      }

      // Call parent save handler
      await onSave(user.user_id, updates);

      // Close modal on success
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setError(null);
    setValidationErrors({});
    onClose();
  };

  if (!user) return null;

  return (
    <Modal open={open} onClose={handleCancel} sx={{ zIndex: 9999 }}>
      <ModalDialog sx={{ minWidth: 500, maxWidth: 600 }}>
        <ModalClose disabled={loading} />
        
        <Typography level="h4" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon /> Edit User Profile
        </Typography>

        <Typography level="body-sm" sx={{ mb: 2, color: "text.secondary" }}>
          Editing user: <strong>{user.username}</strong> ({user.role})
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Display Name */}
          <FormControl error={!!validationErrors.displayName}>
            <FormLabel>Display Name (Person's Name)</FormLabel>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., John Smith"
              disabled={loading}
            />
            {validationErrors.displayName && (
              <Typography level="body-sm" sx={{ color: "danger.500", mt: 0.5 }}>
                {validationErrors.displayName}
              </Typography>
            )}
          </FormControl>

          {/* Username */}
          <FormControl error={!!validationErrors.username}>
            <FormLabel>Username (Login ID)</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., john_admin"
              disabled={loading}
            />
            {validationErrors.username && (
              <Typography level="body-sm" sx={{ color: "danger.500", mt: 0.5 }}>
                {validationErrors.username}
              </Typography>
            )}
            <Typography level="body-xs" sx={{ mt: 0.5, color: "text.tertiary" }}>
              3-50 characters, letters, numbers, and underscores only
            </Typography>
          </FormControl>

          {/* Password */}
          <FormControl error={!!validationErrors.password}>
            <FormLabel>New Password (optional)</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to keep current password"
              disabled={loading}
            />
            {validationErrors.password && (
              <Typography level="body-sm" sx={{ color: "danger.500", mt: 0.5 }}>
                {validationErrors.password}
              </Typography>
            )}
            <Typography level="body-xs" sx={{ mt: 0.5, color: "text.tertiary" }}>
              Minimum 8 characters
            </Typography>
          </FormControl>

          {/* Confirm Password */}
          {password && (
            <FormControl error={!!validationErrors.confirmPassword}>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={loading}
              />
              {validationErrors.confirmPassword && (
                <Typography level="body-sm" sx={{ color: "danger.500", mt: 0.5 }}>
                  {validationErrors.confirmPassword}
                </Typography>
              )}
            </FormControl>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={loading}
              sx={{
                background: theme.gradients.primary,
                "&:hover": {
                  background: theme.gradients.primary,
                  opacity: 0.9,
                },
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default EditUserModal;
