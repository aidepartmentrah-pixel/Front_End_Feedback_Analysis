// src/components/settings/EditUserDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
  Alert,
  Divider,
  Typography,
} from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import { updateUserIdentity, updateUserPassword } from "../../api/settingsUsersApi";

const EditUserDialog = ({ open, user, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    display_name: "",
    department_display_name: "",
    email: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || "",
        department_display_name: user.department_display_name || "",
        email: user.email || "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
      setApiError(null);
    }
  }, [user]);

  // Check if identity fields have changed
  const hasIdentityChanged = () => {
    if (!user) return false;
    return (
      formData.display_name !== (user.display_name || "") ||
      formData.department_display_name !== (user.department_display_name || "") ||
      formData.email !== (user.email || "")
    );
  };

  // Check if password is being reset
  const isPasswordReset = () => {
    return formData.new_password.trim().length > 0;
  };

  // Check if save button should be enabled
  const isSaveEnabled = () => {
    return hasIdentityChanged() || isPasswordReset();
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    // Email validation (optional but must be valid format if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Password validation (only if password is being reset)
    if (isPasswordReset()) {
      if (formData.new_password.trim().length < 6) {
        newErrors.new_password = "Password must be at least 6 characters";
      }

      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    // Clear API error
    if (apiError) {
      setApiError(null);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!isSaveEnabled()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const promises = [];

      // Update identity if changed
      if (hasIdentityChanged()) {
        const identityPayload = {
          display_name: formData.display_name,
          department_display_name: formData.department_display_name,
          email: formData.email || null,
        };
        promises.push(updateUserIdentity(user.user_id, identityPayload));
      }

      // Update password if provided
      if (isPasswordReset()) {
        const passwordPayload = {
          new_password: formData.new_password,
        };
        promises.push(updateUserPassword(user.user_id, passwordPayload));
      }

      // Execute all updates
      await Promise.all(promises);

      // Reset form
      setFormData({
        display_name: "",
        department_display_name: "",
        email: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});

      // Notify parent
      onSaved();
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || error.message || "Failed to update user";
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        display_name: "",
        department_display_name: "",
        email: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
      setApiError(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ zIndex: 9999 }}>
      <ModalDialog sx={{ minWidth: 500, maxWidth: 600 }}>
        <ModalClose disabled={isSubmitting} />
        <DialogTitle>Edit User</DialogTitle>
        <Divider />

        <DialogContent>
          {apiError && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Username (read-only) */}
              {user && (
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Input value={user.username} disabled />
                  <FormHelperText>Username cannot be changed</FormHelperText>
                </FormControl>
              )}

              {/* Identity Section */}
              <Typography level="title-md" sx={{ mt: 1 }}>
                Identity Information
              </Typography>

              {/* Display Name */}
              <FormControl>
                <FormLabel>Display Name</FormLabel>
                <Input
                  placeholder="e.g., John Doe"
                  value={formData.display_name}
                  onChange={(e) => handleChange("display_name", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormControl>

              {/* Department Display Name */}
              <FormControl>
                <FormLabel>Department Display Name</FormLabel>
                <Input
                  placeholder="e.g., Emergency Department"
                  value={formData.department_display_name}
                  onChange={(e) =>
                    handleChange("department_display_name", e.target.value)
                  }
                  disabled={isSubmitting}
                />
              </FormControl>

              {/* Email */}
              <FormControl error={!!errors.email}>
                <FormLabel>Email (for notifications)</FormLabel>
                <Input
                  type="email"
                  placeholder="e.g., john.doe@hospital.local"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <FormHelperText>{errors.email}</FormHelperText>
                )}
                <FormHelperText>
                  Used for system notifications when cases are assigned
                </FormHelperText>
              </FormControl>

              {/* Password Reset Section */}
              <Typography level="title-md" sx={{ mt: 2 }}>
                Password Reset (Optional)
              </Typography>

              {/* New Password */}
              <FormControl error={!!errors.new_password}>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={formData.new_password}
                  onChange={(e) => handleChange("new_password", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.new_password && (
                  <FormHelperText>{errors.new_password}</FormHelperText>
                )}
                <FormHelperText>
                  Leave empty to keep current password
                </FormHelperText>
              </FormControl>

              {/* Confirm Password */}
              <FormControl error={!!errors.confirm_password}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirm_password}
                  onChange={(e) => handleChange("confirm_password", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.confirm_password && (
                  <FormHelperText>{errors.confirm_password}</FormHelperText>
                )}
              </FormControl>

              {/* Action Buttons */}
              <Box
                sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
              >
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  startDecorator={<SaveIcon />}
                  loading={isSubmitting}
                  disabled={!isSaveEnabled()}
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default EditUserDialog;
