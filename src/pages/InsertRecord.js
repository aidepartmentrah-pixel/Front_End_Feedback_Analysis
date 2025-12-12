// src/pages/InsertRecord.js
import React, { useState } from "react";
import { Box, Container } from "@mui/joy";
import axios from "axios";

// Components
import MainLayout from "../components/common/MainLayout";
import TextBlocksWithButtons from "../components/insert/TextBlocksWithButtons";
import RecordMetadata from "../components/insert/RecordMetadata";
import NEROutputs from "../components/insert/NEROutputs";
import ClassificationFields from "../components/insert/ClassificationFields";
import ActionButtons from "../components/insert/ActionButtons";

const InsertRecord = () => {
  // State for all form fields with proper ID-based structure
  const [formData, setFormData] = useState({
    // Step 1: Text blocks
    complaint_text: "",
    immediate_action: "",
    taken_action: "",

    // Step 2: Metadata
    feedback_received_date: new Date().toISOString().split("T")[0],
    issuing_department_id: null,
    target_department_id: null,
    source_id: null,

    // Step 3: NER Outputs
    patient_name: "",
    doctor_name: "",

    // Step 4: Classification (Domain first!)
    domain_id: null,
    category_id: null,
    subcategory_id: null,
    classification_id: null,

    // Step 5: Additional attributes
    severity_id: null,
    stage_id: null,
    harm_id: null,
    improvement_type: 0, // 0 = No, 1 = Yes
  });

  // State for API responses and loading
  const [nerLoading, setNerLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update form data
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle NER Extraction button click
  const handleRunNER = async () => {
    try {
      setNerLoading(true);
      setError(null);

      if (!formData.complaint_text || formData.complaint_text.trim().length === 0) {
        setError("Complaint text is required for NER extraction");
        setNerLoading(false);
        return;
      }

      // Call NER API
      const response = await axios.post("/api/ner/extract", {
        text: formData.complaint_text,
      });

      // Update form with extracted entities
      setFormData((prev) => ({
        ...prev,
        patient_name: response.data.patient_name || "",
        doctor_name: response.data.doctor_name || "",
      }));

      setSuccess("NER extraction completed! Review and adjust names if needed.");
    } catch (err) {
      setError("Error during NER extraction. Please try again or enter manually.");
      console.error("NER Error:", err);
    } finally {
      setNerLoading(false);
    }
  };

  // Handle Add Record button click (submits to database)
  const handleAddRecord = async () => {
    try {
      setSubmitLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.complaint_text || formData.complaint_text.trim().length === 0) {
        setError("Complaint text is required");
        setSubmitLoading(false);
        return;
      }

      if (!formData.feedback_received_date) {
        setError("Feedback received date is required");
        setSubmitLoading(false);
        return;
      }

      if (!formData.domain_id) {
        setError("Domain is required");
        setSubmitLoading(false);
        return;
      }

      if (!formData.category_id) {
        setError("Category is required");
        setSubmitLoading(false);
        return;
      }

      if (!formData.severity_id) {
        setError("Severity is required");
        setSubmitLoading(false);
        return;
      }

      // Prepare payload with numeric IDs
      const payload = {
        complaint_text: formData.complaint_text,
        immediate_action: formData.immediate_action,
        taken_action: formData.taken_action,
        feedback_received_date: formData.feedback_received_date,
        issuing_department_id: formData.issuing_department_id,
        target_department_id: formData.target_department_id,
        source_id: formData.source_id,
        status_id: 3, // Always "In Progress" for new records
        patient_name: formData.patient_name,
        doctor_name: formData.doctor_name,
        domain_id: formData.domain_id,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id,
        classification_id: formData.classification_id,
        severity_id: formData.severity_id,
        stage_id: formData.stage_id,
        harm_id: formData.harm_id,
        improvement_type: formData.improvement_type,
      };

      // Submit to backend
      const response = await axios.post("/api/records/add", payload);

      console.log("Record added successfully:", response.data);

      setSuccess("Record added successfully!");
      setError(null);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          complaint_text: "",
          immediate_action: "",
          taken_action: "",
          feedback_received_date: new Date().toISOString().split("T")[0],
          issuing_department_id: null,
          target_department_id: null,
          source_id: null,
          patient_name: "",
          doctor_name: "",
          domain_id: null,
          category_id: null,
          subcategory_id: null,
          classification_id: null,
          severity_id: null,
          stage_id: null,
          harm_id: null,
          improvement_type: 0,
        });
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding record. Please try again.");
      console.error("Submit Error:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <h1 style={{ color: "#1a1e3f", marginBottom: "8px" }}>Insert New Record</h1>
          <p style={{ color: "#667eea", margin: 0 }}>
            Create and submit a new feedback/incident record (4-step wizard)
          </p>
        </Box>

        {/* Error and Success Messages */}
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: "8px",
              background: "#ff4757",
              color: "white",
              fontWeight: 600,
            }}
          >
            ❌ {error}
          </Box>
        )}
        {success && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: "8px",
              background: "#2ed573",
              color: "white",
              fontWeight: 600,
            }}
          >
            ✅ {success}
          </Box>
        )}

        {/* Step 1: Text Inputs */}
        <TextBlocksWithButtons
          complaintText={formData.complaint_text}
          additionalNotes={formData.immediate_action}
          optionalThirdText={formData.taken_action}
          onTextChange={(field, value) => {
            setFormData((prev) => ({
              ...prev,
              [field]: value,
            }));
          }}
        />

        {/* Step 2: Metadata */}
        <RecordMetadata
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* Step 3: NER Outputs (always visible) */}
        <NEROutputs
          formData={formData}
          onInputChange={handleInputChange}
          onRunNER={handleRunNER}
          loading={nerLoading}
        />

        {/* Step 4: AI Classification & Severity Fields (merged Step 4 + 5) */}
        <ClassificationFields
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* Action Buttons */}
        <ActionButtons
          onExtract={handleRunNER}
          onAddRecord={handleAddRecord}
          loading={submitLoading}
          hasComplaintText={formData.complaint_text.trim().length > 0}
        />
      </Container>
    </MainLayout>
  );
};

export default InsertRecord;
