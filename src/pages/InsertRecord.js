// src/pages/InsertRecord.js
import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/joy";

// Components
import MainLayout from "../components/common/MainLayout";
import TextBlocksWithButtons from "../components/insert/TextBlocksWithButtons";
import RecordMetadata from "../components/insert/RecordMetadata";
import NEROutputs from "../components/insert/NEROutputs";
import ClassificationFields from "../components/insert/ClassificationFields";
import ActionButtons from "../components/insert/ActionButtons";

// API
import {
  fetchReferenceData,
  fetchCategories,
  fetchSubcategories,
  fetchClassifications,
  submitRecord,
  extractNER,
  searchPatients,
  searchDoctors,
  searchEmployees,
} from "../api/insertRecord";

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
    target_department_ids: [], // Multiple departments
    source_id: null,
    in_out: null, // IN or OUT
    worker_type: null, // Doctor, Clerk, Nurse, etc.

    // Step 3: NER Outputs
    patient_admission_id: null, // Single patient ID
    doctor_ids: [], // Multiple doctor IDs
    employee_ids: [], // Multiple employee IDs

    // Step 4: Classification (Domain first!)
    domain_id: null,
    category_id: null,
    subcategory_id: null,
    classification_id: null,

    // Step 5: Additional attributes
    severity_id: null,
    stage_id: null,
    harm_id: null,
    feedback_intent_type_id: null,
    clinical_risk_type_id: null,
  });

  // State for reference data
  const [referenceData, setReferenceData] = useState({
    departments: [],
    sources: [],
    domains: [],
    severity: [],
    stages: [],
    harm: [],
  });

  // State for cascading dropdowns
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [classifications, setClassifications] = useState([]);

  // State for API responses and loading
  const [dataLoading, setDataLoading] = useState(false);
  const [nerLoading, setNerLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorField, setErrorField] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load reference data on mount
  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      setDataLoading(true);
      const data = await fetchReferenceData();
      console.log("Setting reference data:", data);
      console.log("Domains count:", data?.domains?.length);
      console.log("Sources count:", data?.sources?.length);
      console.log("Departments count:", data?.departments?.length);
      console.log("Worker types count:", data?.worker_types?.length);
      console.log("Worker types data:", data?.worker_types);
      setReferenceData(data);
    } catch (err) {
      setError("Failed to load reference data. Please refresh the page.");
      console.error("Error loading reference data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Handle domain change - fetch categories and clear dependent fields
  useEffect(() => {
    if (formData.domain_id) {
      loadCategories(formData.domain_id);
      // Clear dependent fields
      setFormData((prev) => ({
        ...prev,
        category_id: null,
        subcategory_id: null,
        classification_id: null,
      }));
      setSubcategories([]);
      setClassifications([]);
    } else {
      setCategories([]);
      setSubcategories([]);
      setClassifications([]);
    }
  }, [formData.domain_id]);

  // Handle category change - fetch subcategories and clear dependent fields
  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
      // Clear dependent fields
      setFormData((prev) => ({
        ...prev,
        subcategory_id: null,
        classification_id: null,
      }));
      setClassifications([]);
    } else {
      setSubcategories([]);
      setClassifications([]);
    }
  }, [formData.category_id]);

  // Handle subcategory change - fetch classifications and clear dependent fields
  useEffect(() => {
    if (formData.subcategory_id) {
      loadClassifications(formData.subcategory_id);
      // Clear dependent field
      setFormData((prev) => ({
        ...prev,
        classification_id: null,
      }));
    } else {
      setClassifications([]);
    }
  }, [formData.subcategory_id]);

  const loadCategories = async (domainId) => {
    try {
      const data = await fetchCategories(domainId);
      console.log("Setting categories:", data);
      console.log("Categories count:", data?.length);
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const data = await fetchSubcategories(categoryId);
      setSubcategories(data);
    } catch (err) {
      console.error("Error loading subcategories:", err);
    }
  };

  const loadClassifications = async (subcategoryId) => {
    try {
      const data = await fetchClassifications(subcategoryId);
      setClassifications(data);
    } catch (err) {
      console.error("Error loading classifications:", err);
    }
  };

  // Update form data
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts fixing the issue
    if (errorField === field) {
      setErrorField(null);
      setError(null);
    }
  };

  // Handle NER Extraction button click
  const handleRunNER = async () => {
    try {
      setNerLoading(true);
      setError(null);
      setErrorField(null);

      if (!formData.complaint_text || formData.complaint_text.trim().length === 0) {
        setError("Complaint text is required for NER extraction");
        setNerLoading(false);
        return;
      }

      // Call NER API to extract names
      const response = await extractNER(formData.complaint_text);
      console.log("NER extraction response:", response);

      // Return extracted names to be populated in search boxes
      const extractedNames = {
        patient: response.patient_name || response.patient || "",
        doctor: response.doctor_name || response.doctor || "",
        employee: response.employee_name || response.employee || "",
      };

      setSuccess("NER extraction completed! Names populated in search boxes.");
      setTimeout(() => setSuccess(null), 3000);

      // Return the extracted names so NEROutputs can populate search boxes
      return extractedNames;
    } catch (err) {
      setError("Error during NER extraction. Please try again or search manually.");
      console.error("NER Error:", err);
      return null;
    } finally {
      setNerLoading(false);
    }
  };

  // Handle transcription completion (auto-trigger NER)
  const handleTranscriptionComplete = async (transcribedText) => {
    if (transcribedText && transcribedText.trim().length > 0) {
      // Auto-run NER after successful transcription
      setTimeout(() => {
        handleRunNER();
      }, 500);
    }
  };

  // Handle Add Record button click (submits to database)
  const handleAddRecord = async () => {
    try {
      setSubmitLoading(true);
      setError(null);
      setErrorField(null);

      // Validate required fields
      if (!formData.complaint_text || formData.complaint_text.trim().length === 0) {
        setError("Complaint text is required");
        setErrorField("complaint_text");
        setSubmitLoading(false);
        return;
      }

      if (!formData.feedback_received_date) {
        setError("Feedback received date is required");
        setErrorField("feedback_received_date");
        setSubmitLoading(false);
        return;
      }

      if (!formData.domain_id) {
        setError("Domain is required");
        setErrorField("domain_id");
        setSubmitLoading(false);
        return;
      }

      if (!formData.category_id) {
        setError("Category is required");
        setErrorField("category_id");
        setSubmitLoading(false);
        return;
      }

      if (!formData.patient_admission_id) {
        setError("Patient selection is required");
        setErrorField("patient_admission_id");
        setSubmitLoading(false);
        return;
      }

      if (!formData.severity_id) {
        setError("Severity is required");
        setErrorField("severity_id");
        setSubmitLoading(false);
        return;
      }

      // Prepare payload with numeric IDs (only include non-null values)
      const payload = {
        complaint_text: formData.complaint_text,
        feedback_received_date: formData.feedback_received_date,
        domain_id: formData.domain_id,
        category_id: formData.category_id,
        severity_id: formData.severity_id,
      };

      // Add optional fields if they exist
      if (formData.immediate_action) payload.immediate_action = formData.immediate_action;
      if (formData.taken_action) payload.taken_action = formData.taken_action;
      if (formData.issuing_department_id) payload.issuing_department_id = formData.issuing_department_id;
      if (formData.target_department_ids && formData.target_department_ids.length > 0) {
        // Send first target department as target_department_id
        payload.target_department_id = formData.target_department_ids[0];
      }
      if (formData.source_id) payload.source_id = formData.source_id;
      if (formData.in_out) payload.in_out = formData.in_out;
      if (formData.worker_type) payload.worker_type = formData.worker_type;
      if (formData.patient_admission_id) payload.patient_admission_id = formData.patient_admission_id;
      if (formData.doctor_ids && formData.doctor_ids.length > 0) payload.doctor_ids = formData.doctor_ids;
      if (formData.employee_ids && formData.employee_ids.length > 0) payload.employee_ids = formData.employee_ids;
      if (formData.subcategory_id) payload.subcategory_id = formData.subcategory_id;
      if (formData.classification_id) payload.classification_id = formData.classification_id;
      if (formData.stage_id) payload.stage_id = formData.stage_id;
      if (formData.harm_id) payload.harm_id = formData.harm_id;
      if (formData.feedback_intent_type_id) payload.feedback_intent_type_id = formData.feedback_intent_type_id;
      if (formData.clinical_risk_type_id) payload.clinical_risk_type_id = formData.clinical_risk_type_id;

      // Submit to backend
      const response = await submitRecord(payload);

      console.log("Record added successfully:", response);

      // Show success message with record ID
      setSuccess(
        `✅ Record added successfully! Record ID: ${response.record_id || response.id}`
      );
      setError(null);
      setErrorField(null);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          complaint_text: "",
          immediate_action: "",
          taken_action: "",
          feedback_received_date: new Date().toISOString().split("T")[0],
          issuing_department_id: null,
          target_department_ids: [],
          source_id: null,
          in_out: null,
          worker_type: null,
          patient_name: "",
          doctor_name: "",
          domain_id: null,
          category_id: null,
          subcategory_id: null,
          classification_id: null,
          severity_id: null,
          stage_id: null,
          harm_id: null,
          feedback_intent_type_id: null,
          clinical_risk_type_id: null,
        });
        setSuccess(null);
        // Reset cascading dropdowns
        setCategories([]);
        setSubcategories([]);
        setClassifications([]);
      }, 3000);
    } catch (err) {
      // Handle error response format from backend
      const errorMessage = err.message_ar || err.message || "Error adding record. Please try again.";
      setError(errorMessage);
      if (err.field) {
        setErrorField(err.field);
      }
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

        {/* Loading indicator */}
        {dataLoading && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: "8px",
              background: "#ffa726",
              color: "white",
              fontWeight: 600,
            }}
          >
            ⏳ Loading reference data...
          </Box>
        )}

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
            {success}
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
          onTranscriptionComplete={handleTranscriptionComplete}
        />

        {/* Step 2: Metadata */}
        <RecordMetadata
          formData={formData}
          onInputChange={handleInputChange}
          referenceData={referenceData}
          errorField={errorField}
        />

        {/* Step 3: NER Outputs (always visible) */}
        <NEROutputs
          formData={formData}
          onInputChange={handleInputChange}
          onRunNER={async () => {
            const response = await handleRunNER();
            // Copy NER results to search bar fields
            if (response) {
              if (response.patient) {
                setFormData((prev) => ({ ...prev, patientQuery: response.patient }));
              }
              if (response.doctor) {
                setFormData((prev) => ({ ...prev, doctorQuery: response.doctor }));
              }
              if (response.employee) {
                setFormData((prev) => ({ ...prev, employeeQuery: response.employee }));
              }
              if (response.department) {
                setFormData((prev) => ({ ...prev, departmentQuery: response.department }));
              }
            }
            return response;
          }}
          loading={nerLoading}
          errorField={errorField}
          referenceData={referenceData}
        />

        {/* Step 4: AI Classification & Severity Fields (merged Step 4 + 5) */}
        <ClassificationFields
          formData={formData}
          onInputChange={handleInputChange}
          referenceData={referenceData}
          categories={categories}
          subcategories={subcategories}
          classifications={classifications}
          errorField={errorField}
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
