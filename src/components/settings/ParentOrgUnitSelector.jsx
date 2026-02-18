import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Select,
  Option,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
  Box,
} from "@mui/joy";
import { getUserInventory } from "../../api/adminUsers";

/**
 * PHASE C — F-C4 — REUSABLE PARENT ORG UNIT SELECTOR
 * 
 * A controlled component for selecting parent organizational units.
 * Loads org hierarchy and filters by parent type (ADMINISTRATION/DEPARTMENT).
 * 
 * @param {string} valueParentId - Selected parent unit ID
 * @param {string} valueParentType - Selected parent type ("ADMINISTRATION"|"DEPARTMENT")
 * @param {function} onChange - Callback: (parentId, parentType) => void
 */
const ParentOrgUnitSelector = ({ valueParentId, valueParentType, onChange }) => {
  const [administrations, setAdministrations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrgHierarchy();
  }, []);

  const loadOrgHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const inventory = await getUserInventory();

      // Extract administrations (top-level org units)
      const adminList = inventory.org_units || [];
      setAdministrations(adminList);

      // Extract departments (children of administrations)
      const deptList = adminList.flatMap((admin) => admin.Children || []);
      setDepartments(deptList);
    } catch (err) {
      setError("Failed to load organizational hierarchy");
      console.error("ParentOrgUnitSelector - loadOrgHierarchy error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleParentTypeChange = (event) => {
    const newType = event.target.value;
    // Reset parent selection when type changes
    onChange("", newType);
  };

  const handleParentChange = (event, newValue) => {
    onChange(newValue, valueParentType);
  };

  // Filter options based on parent type
  const filteredOptions =
    valueParentType === "ADMINISTRATION" ? administrations : departments;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Error Alert */}
      {error && (
        <Alert color="danger" variant="soft">
          {error}
        </Alert>
      )}

      {/* Parent Type Radio Selector */}
      <FormControl>
        <FormLabel>Parent Type</FormLabel>
        <RadioGroup
          value={valueParentType}
          onChange={handleParentTypeChange}
          orientation="horizontal"
        >
          <Radio value="DEPARTMENT" label="Department" />
          <Radio value="ADMINISTRATION" label="Administration" />
        </RadioGroup>
      </FormControl>

      {/* Parent Unit Dropdown */}
      <FormControl>
        <FormLabel>
          {valueParentType === "ADMINISTRATION"
            ? "Select Administration"
            : "Select Department"}
        </FormLabel>
        <Select
          value={valueParentId}
          onChange={handleParentChange}
          placeholder={`Select ${
            valueParentType === "ADMINISTRATION" ? "Administration" : "Department"
          }`}
          disabled={loading}
          startDecorator={loading ? <CircularProgress size="sm" /> : null}
        >
          {filteredOptions.map((unit) => (
            <Option key={unit.ID} value={unit.ID}>
              {unit.Name}
            </Option>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ParentOrgUnitSelector;
