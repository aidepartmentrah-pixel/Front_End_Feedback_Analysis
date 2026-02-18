// src/components/settings/RoleSelector.jsx
import React from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Option,
} from "@mui/joy";

const RoleSelector = ({
  roles,
  value,
  onChange,
  label = "Role",
  disabled = false,
  error = false,
  helperText = "",
}) => {
  const handleChange = (event, newValue) => {
    // Convert to number if not empty string
    if (newValue === "" || newValue === null) {
      onChange(null);
    } else {
      onChange(Number(newValue));
    }
  };

  return (
    <FormControl error={error} disabled={disabled}>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        placeholder="Select role"
        value={value === null ? "" : value}
        onChange={handleChange}
        disabled={disabled}
      >
        <Option value="">Select role</Option>
        {roles.map((role) => (
          <Option key={role.role_id} value={role.role_id}>
            {role.role_name}
          </Option>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RoleSelector;
