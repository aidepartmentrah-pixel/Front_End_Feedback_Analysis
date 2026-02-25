// src/components/settings/CreateUserDialog.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  Autocomplete,
  CircularProgress,
} from "@mui/joy";
import SaveIcon from "@mui/icons-material/Save";
import { createUser } from "../../api/settingsUsersApi";
import { fetchLeaves, fetchDepartments } from "../../api/orgUnits";

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
  
  // Org units state
  const [orgUnits, setOrgUnits] = useState([]);
  const [orgUnitsLoading, setOrgUnitsLoading] = useState(false);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  
  // Departments state
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Available roles - expanded list
  const availableRoles = [
    { id: "SOFTWARE_ADMIN", name: "Software Admin" },
    { id: "COMPLAINT_SUPERVISOR", name: "Complaint Supervisor" },
    { id: "ADMINISTRATION_ADMIN", name: "Administration Admin" },
    { id: "DEPARTMENT_ADMIN", name: "Department Admin" },
    { id: "SECTION_ADMIN", name: "Section Admin" },
    { id: "WORKER", name: "Worker" },
  ];

  // Fetch org units and departments when dialog opens
  useEffect(() => {
    if (open) {
      if (orgUnits.length === 0) {
        loadOrgUnits();
      }
      if (departments.length === 0) {
        loadDepartments();
      }
    }
  }, [open]);

  const loadOrgUnits = async () => {
    setOrgUnitsLoading(true);
    try {
      const leaves = await fetchLeaves();
      // Transform to have consistent structure with id and name
      const transformed = leaves.map(unit => ({
        id: unit.org_unit_id || unit.id,
        name: unit.name || unit.org_unit_name || `Unit ${unit.org_unit_id || unit.id}`,
        fullPath: unit.full_path || unit.name,
      }));
      setOrgUnits(transformed);
    } catch (err) {
      console.error("Failed to load org units:", err);
    } finally {
      setOrgUnitsLoading(false);
    }
  };

  const loadDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const depts = await fetchDepartments();
      // Transform to have consistent structure
      const transformed = depts.map(dept => ({
        id: dept.org_unit_id || dept.id,
        name: dept.name || dept.org_unit_name || `Department ${dept.org_unit_id || dept.id}`,
      }));
      setDepartments(transformed);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Memoized options for Autocomplete
  const orgUnitOptions = useMemo(() => orgUnits, [orgUnits]);
  const departmentOptions = useMemo(() => departments, [departments]);

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
      setSelectedOrgUnit(null);
      setSelectedDepartment(null);
      setErrors({});
      
      // Notify parent
      onCreated(newUser);
      onClose();
    } catch (error) {
      // Handle different error formats from backend
      let errorMessage = "Failed to create user";
      const detail = error.response?.data?.detail;
      
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors come as array of {type, loc, msg, input}
        errorMessage = detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      } else if (detail && typeof detail === 'object') {
        // Single error object
        errorMessage = detail.msg || detail.message || JSON.stringify(detail);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
      setSelectedOrgUnit(null);
      setSelectedDepartment(null);
      setErrors({});
      setApiError(null);
      onClose();
    }
  };

  // Handle department selection
  const handleDepartmentChange = (event, newValue) => {
    setSelectedDepartment(newValue);
    if (newValue) {
      handleChange("department_display_name", newValue.name);
    } else {
      handleChange("department_display_name", "");
    }
  };

  // Handle org unit selection
  const handleOrgUnitChange = (event, newValue) => {
    setSelectedOrgUnit(newValue);
    if (newValue) {
      handleChange("org_unit_id", newValue.id);
      // Auto-fill department display name if empty
      if (!formData.department_display_name) {
        handleChange("department_display_name", newValue.name);
      }
    } else {
      handleChange("org_unit_id", "");
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ zIndex: 9999 }}>
      <ModalDialog 
        sx={{ 
          minWidth: 500, 
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ModalClose disabled={isSubmitting} />
        <DialogTitle>Create New User</DialogTitle>
        <Divider />
        
        <DialogContent sx={{ overflow: 'auto', flex: 1 }}>
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
                <FormLabel>Department</FormLabel>
                <Autocomplete
                  placeholder="Search and select department..."
                  options={departmentOptions}
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  loading={departmentsLoading}
                  disabled={isSubmitting}
                  freeSolo
                  onInputChange={(event, newInputValue, reason) => {
                    // Allow typing custom values
                    if (reason === 'input') {
                      handleChange("department_display_name", newInputValue);
                    }
                  }}
                  slotProps={{
                    listbox: {
                      sx: { maxHeight: 200, zIndex: 10001 }
                    },
                    popper: {
                      sx: { zIndex: 10001 }
                    }
                  }}
                  endDecorator={departmentsLoading ? <CircularProgress size="sm" /> : null}
                />
                <FormHelperText>
                  {departments.length > 0 
                    ? `${departments.length} departments - type to search or enter custom`
                    : 'Loading departments...'}
                </FormHelperText>
              </FormControl>

              {/* Role */}
              <FormControl error={!!errors.role_id} required>
                <FormLabel>Role</FormLabel>
                <Select
                  placeholder="Select role"
                  value={formData.role_id}
                  onChange={(e, value) => handleChange("role_id", value)}
                  disabled={isSubmitting}
                  slotProps={{
                    listbox: {
                      sx: { zIndex: 10001 }
                    },
                    popper: {
                      sx: { zIndex: 10001 }
                    }
                  }}
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
                <FormLabel>Organization Unit (Section)</FormLabel>
                <Autocomplete
                  placeholder="Search and select organization unit..."
                  options={orgUnitOptions}
                  value={selectedOrgUnit}
                  onChange={handleOrgUnitChange}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  loading={orgUnitsLoading}
                  disabled={isSubmitting}
                  slotProps={{
                    listbox: {
                      sx: { maxHeight: 200, zIndex: 10001 }
                    },
                    popper: {
                      sx: { zIndex: 10001 }
                    }
                  }}
                  endDecorator={orgUnitsLoading ? <CircularProgress size="sm" /> : null}
                />
                {errors.org_unit_id && <FormHelperText>{errors.org_unit_id}</FormHelperText>}
                <FormHelperText>
                  {orgUnits.length > 0 
                    ? `${orgUnits.length} units available - type to search`
                    : 'Loading organization units...'}
                </FormHelperText>
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
