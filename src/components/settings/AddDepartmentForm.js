// src/components/settings/AddDepartmentForm.js
import React, { useState } from "react";
import {
  Card,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Button,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormHelperText,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import theme from '../../theme';

const AddDepartmentForm = ({ onAdd, departments, viewMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    type: viewMode, // "internal" or "external"
    category: "", // "قسم" or "دائرة" or "إدارة"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Department name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Check for circular reference (parent cannot be itself)
    if (formData.parent_id && formData.parent_id === formData.name) {
      newErrors.parent_id = "Department cannot be its own parent";
    }

    // Check for duplicate names
    if (
      departments.some(
        (dept) =>
          dept.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          dept.type === formData.type
      )
    ) {
      newErrors.name = "A department with this name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await onAdd({
      ...formData,
      parent_id: formData.parent_id || null,
    });

    if (success) {
      setFormData({ name: "", parent_id: "", type: viewMode, category: "" });
      setErrors({});
    }
    setIsSubmitting(false);
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // Get available parent departments (exclude potential circular references)
  const availableParents = departments.filter(
    (dept) => dept.type === formData.type
  );

  return (
    <Card
      sx={{
        p: 3,
        border: `2px solid ${theme.colors.primary}33`,
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
      }}
    >
      <Typography level="h4" sx={{ mb: 2, color: theme.colors.primary, fontWeight: 700 }}>
        ➕ Add New Department
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Department Name */}
          <FormControl error={!!errors.name}>
            <FormLabel>Department Name *</FormLabel>
            <Input
              placeholder="e.g., Emergency Department"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
          </FormControl>

          {/* Parent Department */}
          <FormControl error={!!errors.parent_id}>
            <FormLabel>Parent Department (Optional)</FormLabel>
            <Select
              placeholder="Select parent department..."
              value={formData.parent_id}
              onChange={(e, value) => handleChange("parent_id", value)}
              disabled={isSubmitting}
            >
              <Option value="">None (Top Level)</Option>
              {availableParents.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
            {errors.parent_id && (
              <FormHelperText>{errors.parent_id}</FormHelperText>
            )}
          </FormControl>

          {/* Category */}
          <FormControl error={!!errors.category}>
            <FormLabel>Category *</FormLabel>
            <Select
              placeholder="Select category..."
              value={formData.category}
              onChange={(e, value) => handleChange("category", value)}
              disabled={isSubmitting}
            >
              <Option value="قسم">قسم</Option>
              <Option value="دائرة">دائرة</Option>
              <Option value="إدارة">إدارة</Option>
            </Select>
            {errors.category && (
              <FormHelperText>{errors.category}</FormHelperText>
            )}
          </FormControl>

          {/* Department Type */}
          <FormControl>
            <FormLabel>Department Type</FormLabel>
            <RadioGroup
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              orientation="horizontal"
            >
              <Radio value="internal" label="Internal" disabled={isSubmitting} />
              <Radio value="external" label="External" disabled={isSubmitting} />
            </RadioGroup>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            startDecorator={<AddIcon />}
            loading={isSubmitting}
            sx={{
              background: theme.gradients.primary,
              fontWeight: 700,
            }}
          >
            Add Department
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default AddDepartmentForm;
