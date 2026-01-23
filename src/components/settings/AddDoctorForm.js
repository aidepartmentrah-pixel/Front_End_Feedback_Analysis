// src/components/settings/AddDoctorForm.js
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
  FormHelperText,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";

const AddDoctorForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    doctor_name: "",
    specialty: "",
    is_active: true,
    source_system: "MANUAL",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.doctor_name.trim()) {
      newErrors.doctor_name = "Doctor name is required (min 3 characters)";
    } else if (formData.doctor_name.trim().length < 3) {
      newErrors.doctor_name = "Doctor name must be at least 3 characters";
    } else if (formData.doctor_name.trim().length > 200) {
      newErrors.doctor_name = "Doctor name must not exceed 200 characters";
    }

    if (formData.specialty && formData.specialty.length > 200) {
      newErrors.specialty = "Specialty must not exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await onAdd(formData);

    if (success) {
      setFormData({ doctor_name: "", specialty: "", is_active: true, source_system: "MANUAL" });
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

  return (
    <Card
      sx={{
        p: 3,
        border: "2px solid rgba(102, 126, 234, 0.2)",
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
      }}
    >
      <Typography level="h4" sx={{ mb: 2, color: "#667eea", fontWeight: 700 }}>
        ➕ Add New Doctor
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Doctor Name */}
          <FormControl error={!!errors.doctor_name}>
            <FormLabel>Doctor Name *</FormLabel>
            <Input
              placeholder="e.g., Dr. Sarah Johnson"
              value={formData.doctor_name}
              onChange={(e) => handleChange("doctor_name", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.doctor_name && <FormHelperText>{errors.doctor_name}</FormHelperText>}
            <FormHelperText>Minimum 3 characters, maximum 200</FormHelperText>
          </FormControl>

          {/* Specialty */}
          <FormControl error={!!errors.specialty}>
            <FormLabel>Specialty</FormLabel>
            <Input
              placeholder="e.g., Interventional Cardiology"
              value={formData.specialty}
              onChange={(e) => handleChange("specialty", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.specialty && (
              <FormHelperText>{errors.specialty}</FormHelperText>
            )}
            <FormHelperText>Optional, maximum 200 characters</FormHelperText>
          </FormControl>

          {/* Active Status */}
          <FormControl>
            <FormLabel>Status</FormLabel>
            <Select
              value={formData.is_active}
              onChange={(e, value) => handleChange("is_active", value)}
              disabled={isSubmitting}
            >
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
            <FormHelperText>Set doctor's active status</FormHelperText>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            startDecorator={<AddIcon />}
            loading={isSubmitting}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 700,
            }}
          >
            Add Doctor
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default AddDoctorForm;
