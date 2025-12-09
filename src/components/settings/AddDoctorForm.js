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

const AddDoctorForm = ({ onAdd, departments }) => {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    department_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Doctor name is required";
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = "Specialty is required";
    }

    if (!formData.department_id) {
      newErrors.department_id = "Department is required";
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
      setFormData({ name: "", specialty: "", department_id: "" });
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
          <FormControl error={!!errors.name}>
            <FormLabel>Doctor Name *</FormLabel>
            <Input
              placeholder="e.g., Dr. Sarah Johnson"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
          </FormControl>

          {/* Specialty */}
          <FormControl error={!!errors.specialty}>
            <FormLabel>Specialty *</FormLabel>
            <Input
              placeholder="e.g., Cardiology"
              value={formData.specialty}
              onChange={(e) => handleChange("specialty", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.specialty && (
              <FormHelperText>{errors.specialty}</FormHelperText>
            )}
          </FormControl>

          {/* Department */}
          <FormControl error={!!errors.department_id}>
            <FormLabel>Department *</FormLabel>
            <Select
              placeholder="Select department..."
              value={formData.department_id}
              onChange={(e, value) => handleChange("department_id", value)}
              disabled={isSubmitting}
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
            {errors.department_id && (
              <FormHelperText>{errors.department_id}</FormHelperText>
            )}
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
