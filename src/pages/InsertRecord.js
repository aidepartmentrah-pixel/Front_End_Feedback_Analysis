// src/pages/InsertRecord.js
import React, { useState } from "react";
import { Box, Container } from "@mui/joy";

// Components
import MainLayout from "../components/common/MainLayout";
import TextBlocksWithButtons from "../components/insert/TextBlocksWithButtons";
import RecordMetadata from "../components/insert/RecordMetadata";
import NEROutputs from "../components/insert/NEROutputs";
import ClassificationFields from "../components/insert/ClassificationFields";
import ActionButtons from "../components/insert/ActionButtons";

const InsertRecord = () => {
  // State for all form fields
  const [formData, setFormData] = useState({
    // Text blocks
    complaintText: "",
    immediateAction: "",
    takenAction: "",

    // Metadata
    feedbackReceivedDate: new Date().toISOString().split("T")[0],
    issuingDepartment: "ER",
    targetDepartment: "Ward 1",
    source: "Phone",
    status: "In Progress",

    // NER Outputs
    patientName: "",
    doctorName: "",
    otherEntities: "",

    // Classification
    category: "",
    subCategory: "",
    newClassification: "",
    severity: "Low",
    stage: "Admission",
    harm: "No Harm",
    improvementType: "No",
  });

  // State for API responses and loading
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update form data
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle text block changes
  const handleTextBlockChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Extract button click (triggers NER + Classification APIs)
  const handleExtract = async () => {
    try {
      setLoading(true);
      setError(null);

      // Placeholder for API calls
      // In production, these would call your backend:
      // const nerResponse = await axios.post('/api/ner/extract', { complaintText });
      // const classResponse = await axios.post('/api/classification/predict', { complaintText });

      // For now, simulate extracted data
      const simulatedNER = {
        patientName: "Extracted Patient Name",
        doctorName: "Extracted Doctor Name",
        otherEntities: "Other extracted info",
      };

      const simulatedClassification = {
        category: "Safety",
        subCategory: "Neglect - General",
        severity: "Medium",
        stage: "Care on the Ward",
        harm: "Moderate Harm",
        improvementType: "Yes",
      };

      setExtractedData({
        ...simulatedNER,
        ...simulatedClassification,
      });

      // Update form with extracted data
      setFormData((prev) => ({
        ...prev,
        ...simulatedNER,
        ...simulatedClassification,
      }));

      setSuccess("Extraction completed! Review and adjust fields as needed.");
    } catch (err) {
      setError("Error during extraction. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Record button click (submits to database)
  const handleAddRecord = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.complaintText.trim()) {
        setError("Complaint text is required");
        setLoading(false);
        return;
      }

      if (!formData.feedbackReceivedDate) {
        setError("Feedback received date is required");
        setLoading(false);
        return;
      }

      // Placeholder for API call
      // In production: await axios.post('/api/records/add', formData);

      console.log("Record to be added:", formData);

      setSuccess("Record added successfully!");
      setError(null);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          complaintText: "",
          immediateAction: "",
          takenAction: "",
          feedbackReceivedDate: new Date().toISOString().split("T")[0],
          issuingDepartment: "ER",
          targetDepartment: "Ward 1",
          source: "Phone",
          status: "In Progress",
          patientName: "",
          doctorName: "",
          otherEntities: "",
          category: "",
          subCategory: "",
          newClassification: "",
          severity: "Low",
          stage: "Admission",
          harm: "No Harm",
          improvementType: "No",
        });
        setExtractedData(null);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError("Error adding record. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <h1 style={{ color: "#1a1e3f", marginBottom: "8px" }}>Insert New Record</h1>
          <p style={{ color: "#667eea", margin: 0 }}>
            Create and submit a new feedback/incident record
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

        {/* Row 1: Text Inputs + Buttons */}
        <TextBlocksWithButtons
          complaintText={formData.complaintText}
          additionalNotes={formData.immediateAction}
          optionalThirdText={formData.takenAction}
          onTextChange={handleTextBlockChange}
        />

        {/* Row 2: Metadata Inputs */}
        <RecordMetadata
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* Row 3: NER Outputs */}
        {extractedData && (
          <NEROutputs
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}

        {/* Row 4: Classification Fields */}
        <ClassificationFields
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* Row 5: Action Buttons */}
        <ActionButtons
          onExtract={handleExtract}
          onAddRecord={handleAddRecord}
          loading={loading}
          hasComplaintText={formData.complaintText.trim().length > 0}
        />
      </Container>
    </MainLayout>
  );
};

export default InsertRecord;
