// src/components/settings/CreateUserDialog.jsx
import React, { useState } from "react";
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
  Select,
  Option,
  Button,
  FormHelperText,
  Alert,
  Divider,
} from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import { createUser } from "../../api/settingsUsersApi";

const CreateUserDialog = ({ open, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    display_name: "",
    department_display_name: "",
    role_id: "",
    org_unit_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Available roles
  const availableRoles = [
    { id: "SOFTWARE_ADMIN", name: "Software Admin" },
    { id: "SECTION_ADMIN", name: "Section Admin" },
    { id: "WORKER", name: "Worker" },
  ];

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role_id) {
      newErrors.role_id = "Role is required";
    }

    if (!formData.org_unit_id) {
      newErrors.org_unit_id = "Organization unit is required";
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

    setIsSubmitting(true);
    setApiError(null);

    try {
      const newUser = await createUser(formData);
      
      // Reset form
      setFormData({
        username: "",
        password: "",
        display_name: "",
        department_display_name: "",
        role_id: "",
        org_unit_id: "",
      });
      setErrors({});
      
      // Notify parent
      onCreated(newUser);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to create user";
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        username: "",
        password: "",
        display_name: "",
        department_display_name: "",
        role_id: "",
        org_unit_id: "",
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
        <DialogTitle>Create New User</DialogTitle>
        <Divider />
        
        <DialogContent>
          {apiError && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Username */}
              <FormControl error={!!errors.username} required>
                <FormLabel>Username</FormLabel>
                <Input
                  placeholder="e.g., john.doe"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.username && <FormHelperText>{errors.username}</FormHelperText>}
              </FormControl>

              {/* Password */}
              <FormControl error={!!errors.password} required>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
              </FormControl>

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
                  onChange={(e) => handleChange("department_display_name", e.target.value)}
                  disabled={isSubmitting}
                />
              </FormControl>

              {/* Role */}
              <FormControl error={!!errors.role_id} required>
                <FormLabel>Role</FormLabel>
                <Select
                  placeholder="Select role"
                  value={formData.role_id}
                  onChange={(e, value) => handleChange("role_id", value)}
                  disabled={isSubmitting}
                >
                  {availableRoles.map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
                {errors.role_id && <FormHelperText>{errors.role_id}</FormHelperText>}
              </FormControl>

              {/* Organization Unit ID */}
              <FormControl error={!!errors.org_unit_id} required>
                <FormLabel>Organization Unit ID</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter org unit ID"
                  value={formData.org_unit_id}
                  onChange={(e) => handleChange("org_unit_id", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.org_unit_id && <FormHelperText>{errors.org_unit_id}</FormHelperText>}
                <FormHelperText>Numeric ID of the organization unit</FormHelperText>
              </FormControl>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
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
                  color="primary"
                >
                  Create User
                </Button>
              </Box>
            </Box>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default CreateUserDialog;
