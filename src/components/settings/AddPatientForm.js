// src/components/settings/AddPatientForm.js
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
  Grid,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import theme from '../../theme';

const AddPatientForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    mother_name: "",
    phone_number: "",
    phone_number2: "",
    birth_date: "",
    sex: "",
    document_number: "",
    medical_file_number: "",
    spouse: "",
    address_line1: "",
    address_line2: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validate = () => {
    const newErrors = {};

    // Required field: first_name
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required (min 2 characters)";
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "First name must be at least 2 characters";
    } else if (formData.first_name.trim().length > 150) {
      newErrors.first_name = "First name must not exceed 150 characters";
    }

    // Optional fields validation
    const nameFields = ["middle_name", "last_name", "mother_name", "spouse"];
    nameFields.forEach((field) => {
      if (formData[field] && formData[field].length > 150) {
        newErrors[field] = `${field.replace("_", " ")} must not exceed 150 characters`;
      }
    });

    // Phone validation
    if (formData.phone_number && formData.phone_number.length < 7) {
      newErrors.phone_number = "Phone number must be at least 7 digits";
    }
    if (formData.phone_number2 && formData.phone_number2.length < 7) {
      newErrors.phone_number2 = "Phone number 2 must be at least 7 digits";
    }

    // Birth date validation
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = "Birth date cannot be in the future";
      }
      const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
      if (age > 150) {
        newErrors.birth_date = "Patient age cannot exceed 150 years";
      }
    }

    // Document number and medical file number
    if (formData.document_number && formData.document_number.length > 100) {
      newErrors.document_number = "Document number must not exceed 100 characters";
    }
    if (formData.medical_file_number && formData.medical_file_number.length > 100) {
      newErrors.medical_file_number = "Medical file number must not exceed 100 characters";
    }

    // Address validation
    if (formData.address_line1 && formData.address_line1.length > 300) {
      newErrors.address_line1 = "Address line 1 must not exceed 300 characters";
    }
    if (formData.address_line2 && formData.address_line2.length > 300) {
      newErrors.address_line2 = "Address line 2 must not exceed 300 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Clean up form data - send only non-empty fields
    const cleanedData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] && formData[key].toString().trim() !== "") {
        cleanedData[key] = formData[key].toString().trim();
      }
    });

    const success = await onAdd(cleanedData);

    if (success) {
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        mother_name: "",
        phone_number: "",
        phone_number2: "",
        birth_date: "",
        sex: "",
        document_number: "",
        medical_file_number: "",
        spouse: "",
        address_line1: "",
        address_line2: "",
      });
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
        border: `2px solid ${theme.colors.primary}33`,
        background: "linear-gradient(135deg, #f5f7ff 0%, #fff 100%)",
      }}
    >
      <Typography level="h4" sx={{ mb: 2, color: theme.colors.primary, fontWeight: 700 }}>
        ➕ Add New Patient
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Name Fields Row */}
          <Grid container spacing={2}>
            {/* First Name - REQUIRED */}
            <Grid xs={12} md={4}>
              <FormControl error={!!errors.first_name} required>
                <FormLabel>First Name *</FormLabel>
                <Input
                  placeholder="e.g., Ahmed"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.first_name && <FormHelperText>{errors.first_name}</FormHelperText>}
                <FormHelperText>Required (min 2, max 150 chars)</FormHelperText>
              </FormControl>
            </Grid>

            {/* Middle Name */}
            <Grid xs={12} md={4}>
              <FormControl error={!!errors.middle_name}>
                <FormLabel>Middle Name</FormLabel>
                <Input
                  placeholder="e.g., Mohammed"
                  value={formData.middle_name}
                  onChange={(e) => handleChange("middle_name", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.middle_name && <FormHelperText>{errors.middle_name}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Last Name */}
            <Grid xs={12} md={4}>
              <FormControl error={!!errors.last_name}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  placeholder="e.g., Al-Rashid"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.last_name && <FormHelperText>{errors.last_name}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          {/* Mother Name and Spouse Row */}
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl error={!!errors.mother_name}>
                <FormLabel>Mother Name</FormLabel>
                <Input
                  placeholder="e.g., Fatima"
                  value={formData.mother_name}
                  onChange={(e) => handleChange("mother_name", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.mother_name && <FormHelperText>{errors.mother_name}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid xs={12} md={6}>
              <FormControl error={!!errors.spouse}>
                <FormLabel>Spouse</FormLabel>
                <Input
                  placeholder="e.g., Sara Al-Ahmad"
                  value={formData.spouse}
                  onChange={(e) => handleChange("spouse", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.spouse && <FormHelperText>{errors.spouse}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          {/* Phone Numbers Row */}
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl error={!!errors.phone_number}>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  type="tel"
                  placeholder="e.g., 0501234567"
                  value={formData.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.phone_number && <FormHelperText>{errors.phone_number}</FormHelperText>}
                <FormHelperText>Min 7 digits</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} md={6}>
              <FormControl error={!!errors.phone_number2}>
                <FormLabel>Phone Number 2</FormLabel>
                <Input
                  type="tel"
                  placeholder="e.g., 0509876543"
                  value={formData.phone_number2}
                  onChange={(e) => handleChange("phone_number2", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.phone_number2 && <FormHelperText>{errors.phone_number2}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          {/* Birth Date and Sex Row */}
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl error={!!errors.birth_date}>
                <FormLabel>Birth Date</FormLabel>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange("birth_date", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.birth_date && <FormHelperText>{errors.birth_date}</FormHelperText>}
                <FormHelperText>Format: YYYY-MM-DD</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} md={6}>
              <FormControl error={!!errors.sex}>
                <FormLabel>Sex</FormLabel>
                <Select
                  placeholder="Select sex"
                  value={formData.sex}
                  onChange={(e, value) => handleChange("sex", value)}
                  disabled={isSubmitting}
                >
                  <Option value="">Not Specified</Option>
                  <Option value="M">Male</Option>
                  <Option value="F">Female</Option>
                </Select>
                {errors.sex && <FormHelperText>{errors.sex}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>

          {/* Document Numbers Row */}
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl error={!!errors.document_number}>
                <FormLabel>Document Number</FormLabel>
                <Input
                  placeholder="e.g., 1234567890"
                  value={formData.document_number}
                  onChange={(e) => handleChange("document_number", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.document_number && <FormHelperText>{errors.document_number}</FormHelperText>}
                <FormHelperText>Max 100 characters</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} md={6}>
              <FormControl error={!!errors.medical_file_number}>
                <FormLabel>Medical File Number</FormLabel>
                <Input
                  placeholder="e.g., MRN-2026-001234"
                  value={formData.medical_file_number}
                  onChange={(e) => handleChange("medical_file_number", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.medical_file_number && <FormHelperText>{errors.medical_file_number}</FormHelperText>}
                <FormHelperText>Max 100 characters</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>

          {/* Address Fields */}
          <FormControl error={!!errors.address_line1}>
            <FormLabel>Address Line 1</FormLabel>
            <Input
              placeholder="e.g., 123 King Fahd Road, Riyadh"
              value={formData.address_line1}
              onChange={(e) => handleChange("address_line1", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.address_line1 && <FormHelperText>{errors.address_line1}</FormHelperText>}
            <FormHelperText>Max 300 characters</FormHelperText>
          </FormControl>

          <FormControl error={!!errors.address_line2}>
            <FormLabel>Address Line 2</FormLabel>
            <Input
              placeholder="e.g., Building 5, Apartment 201"
              value={formData.address_line2}
              onChange={(e) => handleChange("address_line2", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.address_line2 && <FormHelperText>{errors.address_line2}</FormHelperText>}
            <FormHelperText>Max 300 characters</FormHelperText>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            startDecorator={<AddIcon />}
            loading={isSubmitting}
            sx={{
              background: theme.gradients.primary,
              fontWeight: 700,
              mt: 1,
            }}
          >
            Add Patient
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default AddPatientForm;
