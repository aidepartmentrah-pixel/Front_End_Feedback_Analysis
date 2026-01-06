// src/pages/EditRecord.js
import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Divider, CircularProgress, Card } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";

// Components
import MainLayout from "../components/common/MainLayout";
import TextBlocksWithButtons from "../components/insert/TextBlocksWithButtons";
import RecordMetadata from "../components/insert/RecordMetadata";
import ClassificationFields from "../components/insert/ClassificationFields";
import EditActionButtons from "../components/edit/EditActionButtons";

// API
import { getRecordById, updateRecord } from "../api/complaints";

const EditRecord = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get record ID from URL params (/edit/:id)

  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [originalRecord, setOriginalRecord] = useState(null);

  // State for all form fields (matching insert endpoint structure)
  const [formData, setFormData] = useState({
    complaint_text: "",
    feedback_received_date: new Date().toISOString().split("T")[0],
    issuing_department_id: null,
    domain_id: null,
    category_id: null,
    subcategory_id: null,
    classification_id: null,
    severity_id: null,
    stage_id: null,
    harm_id: null,
    clinical_risk_type_id: null,
    feedback_intent_type_id: null,
    immediate_action: "",
    taken_action: "",
    patient_name: "",
    target_department_ids: [],
    source_id: null,
    building_id: null,
    is_inpatient: false,
    doctors: [],
  });

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-load record from URL parameter
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      console.log("🔄 Loading record:", id);
      getRecordById(id)
        .then((record) => {
          console.log("📖 Record loaded:", record);
          setSelectedRecord(record);
          setOriginalRecord(JSON.parse(JSON.stringify(record)));

          // Pre-fill form with record data
          setFormData({
            complaint_text: record.complaint_text || "",
            feedback_received_date: record.received_date || new Date().toISOString().split("T")[0],
            issuing_department_id: record.issuing_org_unit_id || null,
            domain_id: record.domain_id || null,
            category_id: record.category_id || null,
            subcategory_id: record.subcategory_id || null,
            classification_id: record.classification_id || null,
            severity_id: record.severity_id || null,
            stage_id: record.stage_id || null,
            harm_id: record.harm_level_id || null,  // Maps harm_level_id from GET to harm_id for PUT
            clinical_risk_type_id: record.clinical_risk_type_id || null,
            feedback_intent_type_id: record.feedback_intent_type_id || null,
            immediate_action: record.immediate_action || "",
            taken_action: record.taken_action || "",
            patient_name: record.patient_name || "",
            target_department_ids: [],
            source_id: null,
            building_id: record.building_id || null,
            is_inpatient: record.in_out === 1,
            doctors: record.doctor_name ? [{ doctor_id: record.doctor_id, doctor_name: record.doctor_name }] : [],
          });

          setHasChanges(false);
        })
        .catch((err) => {
          console.error("❌ Error loading record:", err);
          setError(`Failed to load record: ${err.message}`);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

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
    // Convert field names from camelCase to snake_case
    const fieldMap = {
      "complaintText": "complaint_text",
      "additionalNotes": "immediate_action",
      "optionalThirdText": "taken_action",
    };
    const snakeField = fieldMap[field] || field;
    
    setFormData((prev) => ({
      ...prev,
      [snakeField]: value,
    }));
    setHasChanges(true);
  };

  // Handle Update Record
  const handleUpdateRecord = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.complaint_text.trim()) {
        setError("Complaint text is required");
        setLoading(false);
        return;
      }

      if (!formData.feedback_received_date) {
        setError("Feedback received date is required");
        setLoading(false);
        return;
      }

      if (!formData.issuing_department_id) {
        setError("Issuing department is required");
        setLoading(false);
        return;
      }

      if (!formData.domain_id) {
        setError("Domain is required");
        setLoading(false);
        return;
      }

      if (!formData.category_id) {
        setError("Category is required");
        setLoading(false);
        return;
      }

      if (!formData.classification_id) {
        setError("Classification is required");
        setLoading(false);
        return;
      }

      if (!formData.severity_id) {
        setError("Severity is required");
        setLoading(false);
        return;
      }

      if (!formData.stage_id) {
        setError("Stage is required");
        setLoading(false);
        return;
      }

      if (!formData.harm_id) {
        setError("Harm level is required");
        setLoading(false);
        return;
      }

      // Call API to update record
      const result = await updateRecord(id, formData);
      console.log("✅ Record updated:", result);

      setSuccess("Record updated successfully! Redirecting...");
      setHasChanges(false);

      // Redirect back to table view after 2 seconds
      setTimeout(() => {
        navigate("/table-view");
      }, 2000);
    } catch (err) {
      console.error("❌ Error updating record:", err);
      setError(`Error updating record: ${err.message}`);
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
        complaint_text: originalRecord.complaint_text || "",
        feedback_received_date: originalRecord.received_date || new Date().toISOString().split("T")[0],
        issuing_department_id: originalRecord.issuing_org_unit_id || null,
        domain_id: originalRecord.domain_id || null,
        category_id: originalRecord.category_id || null,
        subcategory_id: originalRecord.subcategory_id || null,
        classification_id: originalRecord.classification_id || null,
        severity_id: originalRecord.severity_id || null,
        stage_id: originalRecord.stage_id || null,
        harm_id: originalRecord.harm_id || null,
        clinical_risk_type_id: originalRecord.clinical_risk_type_id || null,
        feedback_intent_type_id: originalRecord.feedback_intent_type_id || null,
        immediate_action: originalRecord.immediate_action || "",
        taken_action: originalRecord.taken_action || "",
        patient_name: originalRecord.patient_name || "",
        target_department_ids: [],
        source_id: null,
        building_id: originalRecord.building_id || null,
        is_inpatient: originalRecord.in_out === 1,
        doctors: originalRecord.doctor_name ? [{ doctor_id: originalRecord.doctor_id, doctor_name: originalRecord.doctor_name }] : [],
      });
      setHasChanges(false);
      setSuccess(null);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <h1 style={{ color: "#1a1e3f", marginBottom: "8px" }}>📝 Edit Record</h1>
          <p style={{ color: "#667eea", margin: 0 }}>
            Update feedback/incident record #{id}
          </p>
        </Box>

        {/* Loading State */}
        {loading && !selectedRecord && (
          <Card sx={{ 
            p: 4, 
            textAlign: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #fff 100%)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}>
            <CircularProgress size="lg" sx={{ "--CircularProgress-color": "#667eea" }} />
            <Typography level="body-md" sx={{ mt: 2, color: "#667eea", fontWeight: 600 }}>
              Loading record...
            </Typography>
          </Card>
        )}

        {/* Error Messages */}
        {error && (
          <Card sx={{ mb: 2, p: 2, bgcolor: "danger.softBg" }}>
            <Typography color="danger">❌ {error}</Typography>
          </Card>
        )}

        {/* Success Messages */}
        {success && (
          <Card sx={{ mb: 2, p: 2, bgcolor: "success.softBg" }}>
            <Typography color="success">✅ {success}</Typography>
          </Card>
        )}

        {/* Form (show only when record is loaded) */}
        {selectedRecord && !loading && (
          <>
            <Divider sx={{ my: 3 }} />

            {/* Row 1: Text Inputs + Buttons */}
            <TextBlocksWithButtons
              complaintText={formData.complaint_text}
              additionalNotes={formData.immediate_action}
              optionalThirdText={formData.taken_action}
              onTextChange={handleTextBlockChange}
            />

            {/* Row 2: Metadata Inputs */}
            <RecordMetadata formData={formData} onInputChange={handleInputChange} />

            {/* Row 3: Classification Fields */}
            <ClassificationFields formData={formData} onInputChange={handleInputChange} />

            {/* Row 4: Action Buttons */}
            <EditActionButtons
              onUpdate={handleUpdateRecord}
              onCancel={handleCancel}
              onReset={handleReset}
              loading={loading}
              hasChanges={hasChanges}
            />
          </>
        )}

        {/* Empty/Loading State */}
        {!loading && !selectedRecord && (
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
              🔍 No Data
            </Typography>
            <Typography level="body-sm" sx={{ color: "#999" }}>
              {error ? "Failed to load record details" : "No record data available"}
            </Typography>
          </Box>
        )}

      </Container>
    </MainLayout>
  );
};
export default EditRecord;
