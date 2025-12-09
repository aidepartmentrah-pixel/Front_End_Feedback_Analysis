// src/pages/EditRecord.js
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Divider } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";

// Components
import MainLayout from "../components/common/MainLayout";
import SearchRecord from "../components/edit/SearchRecord";
import TextBlocksWithButtons from "../components/insert/TextBlocksWithButtons";
import RecordMetadata from "../components/insert/RecordMetadata";
import NEROutputs from "../components/insert/NEROutputs";
import ClassificationFields from "../components/insert/ClassificationFields";
import EditActionButtons from "../components/edit/EditActionButtons";

// Mock data for demonstration
import { mockIncidents } from "../data/mockData";

const EditRecord = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get record ID from URL params (/edit/:id)

  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [originalRecord, setOriginalRecord] = useState(null);

  // State for all form fields
  const [formData, setFormData] = useState({
    recordId: "",
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

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-load record from URL parameter
  useEffect(() => {
    if (id) {
      const record = mockIncidents.find((r) => r.record_id === id);
      if (record) {
        handleSelectRecord(record);
      } else {
        setError(`Record with ID "${id}" not found.`);
      }
    }
  }, [id]);

  // Handle record selection from search
  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setOriginalRecord(JSON.parse(JSON.stringify(record)));

    // Pre-fill form with record data
    setFormData({
      recordId: record.record_id || "",
      complaintText: record.complaint_text || "",
      immediateAction: record.immediate_action || "",
      takenAction: record.taken_action || "",
      feedbackReceivedDate: record.feedback_received_date || new Date().toISOString().split("T")[0],
      issuingDepartment: record.issuing_department || "ER",
      targetDepartment: record.target_department || "Ward 1",
      source: record.source_1 || "Phone",
      status: record.status || "In Progress",
      patientName: record.patient_full_name || "",
      doctorName: record.doctor_name || "",
      otherEntities: record.other_entities || "",
      category: record.category || "",
      subCategory: record.sub_category || "",
      newClassification: record.classification_ar || "",
      severity: record.severity_level || "Low",
      stage: record.stage || "Admission",
      harm: record.harm_level || "No Harm",
      improvementType: record.improvement_opportunity_type || "No",
    });

    setHasChanges(false);
    setError(null);
    setSuccess(null);
  };

  // Update form data
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  // Handle text block changes
  const handleTextBlockChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  // Handle Update Record
  const handleUpdateRecord = async () => {
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
      // In production: await axios.put(`/api/records/${formData.recordId}`, formData);

      console.log("Record updated:", formData);

      setSuccess("Record updated successfully! Redirecting...");
      setHasChanges(false);

      // Redirect back to table view after 2 seconds
      setTimeout(() => {
        navigate("/table-view");
      }, 2000);
    } catch (err) {
      setError("Error updating record. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
      return;
    }
    navigate("/table-view");
  };

  // Handle Reset to Original
  const handleReset = () => {
    if (originalRecord) {
      setFormData({
        recordId: originalRecord.record_id || "",
        complaintText: originalRecord.complaint_text || "",
        immediateAction: originalRecord.immediate_action || "",
        takenAction: originalRecord.taken_action || "",
        feedbackReceivedDate: originalRecord.feedback_received_date || new Date().toISOString().split("T")[0],
        issuingDepartment: originalRecord.issuing_department || "ER",
        targetDepartment: originalRecord.target_department || "Ward 1",
        source: originalRecord.source_1 || "Phone",
        status: originalRecord.status || "In Progress",
        patientName: originalRecord.patient_full_name || "",
        doctorName: originalRecord.doctor_name || "",
        otherEntities: originalRecord.other_entities || "",
        category: originalRecord.category || "",
        subCategory: originalRecord.sub_category || "",
        newClassification: originalRecord.classification_ar || "",
        severity: originalRecord.severity_level || "Low",
        stage: originalRecord.stage || "Admission",
        harm: originalRecord.harm_level || "No Harm",
        improvementType: originalRecord.improvement_opportunity_type || "No",
      });
      setHasChanges(false);
      setSuccess(null);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <h1 style={{ color: "#1a1e3f", marginBottom: "8px" }}>Edit Record</h1>
          <p style={{ color: "#667eea", margin: 0 }}>
            Search, select, and update a feedback/incident record
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

        {/* Search Record */}
        <SearchRecord
          records={mockIncidents}
          onSelectRecord={handleSelectRecord}
          selectedRecordId={selectedRecord?.record_id}
        />

        {selectedRecord ? (
          <>
            <Divider sx={{ my: 3 }} />

            {/* Row 1: Text Inputs + Buttons */}
            <TextBlocksWithButtons
              complaintText={formData.complaintText}
              additionalNotes={formData.immediateAction}
              optionalThirdText={formData.takenAction}
              onTextChange={handleTextBlockChange}
            />

            {/* Row 2: Metadata Inputs */}
            <RecordMetadata formData={formData} onInputChange={handleInputChange} />

            {/* Row 3: NER Outputs */}
            <NEROutputs formData={formData} onInputChange={handleInputChange} />

            {/* Row 4: Classification Fields */}
            <ClassificationFields formData={formData} onInputChange={handleInputChange} />

            {/* Row 5: Action Buttons */}
            <EditActionButtons
              onUpdate={handleUpdateRecord}
              onCancel={handleCancel}
              onReset={handleReset}
              loading={loading}
              hasChanges={hasChanges}
            />
          </>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
              border: "2px dashed rgba(102, 126, 234, 0.2)",
            }}
          >
            <Typography level="h3" sx={{ color: "#667eea", mb: 1 }}>
              🔍 No Record Selected
            </Typography>
            <Typography level="body-sm" sx={{ color: "#999" }}>
              Use the search box above to find and select a record to edit
            </Typography>
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default EditRecord;
