// src/components/settings/OrgUnitSelectorAdapter.jsx
import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Option,
  CircularProgress,
} from "@mui/joy";
import { getUserInventory } from "../../api/adminUsers";

const OrgUnitSelectorAdapter = ({
  value,
  onChange,
  label = "Organization Unit",
  disabled = false,
  error = false,
  helperText = "",
}) => {
  const [orgUnits, setOrgUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    loadOrgUnits();
  }, []);

  const loadOrgUnits = async () => {
    try {
      setLoading(true);
      const data = await getUserInventory();
      setOrgUnits(data.org_units || []);
      setFetchError(null);
    } catch (err) {
      console.error("Failed to load org units:", err);
      setFetchError("Failed to load organizational units");
      setOrgUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    // Convert to number if not empty string
    if (newValue === "" || newValue === null) {
      onChange(null);
    } else {
      onChange(Number(newValue));
    }
  };

  // Get display name for an org unit
  const getDisplayName = (unit) => {
    return unit.NameEn || unit.NameAr || unit.Name || `Unit ${unit.ID}`;
  };

  return (
    <FormControl error={error || !!fetchError} disabled={disabled || loading}>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        placeholder={loading ? "Loading..." : "Select organization unit"}
        value={value === null ? "" : value}
        onChange={handleChange}
        disabled={disabled || loading}
        endDecorator={loading && <CircularProgress size="sm" />}
      >
        <Option value="">Select organization unit</Option>
        {orgUnits.map((unit) => (
          <Option key={unit.ID} value={unit.ID}>
            {getDisplayName(unit)} {unit.Type && `(${unit.Type})`}
          </Option>
        ))}
      </Select>
      {fetchError && <FormHelperText>{fetchError}</FormHelperText>}
      {helperText && !fetchError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default OrgUnitSelectorAdapter;
