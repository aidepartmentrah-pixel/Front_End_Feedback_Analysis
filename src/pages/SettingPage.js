// src/pages/SettingPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, TabList, Tab, TabPanel, Alert } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import DepartmentTable from "../components/settings/DepartmentTable";
import AddDepartmentForm from "../components/settings/AddDepartmentForm";
import DepartmentMappingToggle from "../components/settings/DepartmentMappingToggle";
import DoctorTable from "../components/settings/DoctorTable";
import AddDoctorForm from "../components/settings/AddDoctorForm";
import PatientTable from "../components/settings/PatientTable";
import AddPatientForm from "../components/settings/AddPatientForm";
import SettingActions from "../components/settings/SettingActions";
import VariableAttributes from "../components/settings/VariableAttributes";
import PolicyConfiguration from "../components/settings/PolicyConfiguration";
import Training from "../components/settings/Training";
import api from "../services/api";

const SettingPage = () => {
  // State Management
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [viewMode, setViewMode] = useState("internal"); // "internal" or "external"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch departments on mount and when viewMode changes
  useEffect(() => {
    fetchDepartments();
  }, [viewMode]);

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDepartments(viewMode);
      setDepartments(response.data || []);
    } catch (err) {
      setError("Failed to fetch departments. Please try again.");
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new department
  const handleAddDepartment = async (newDepartment) => {
    try {
      setError(null);
      const response = await api.addDepartment(newDepartment);
      setDepartments([...departments, response.data]);
      setSuccess("Department added successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add department");
      console.error("Error adding department:", err);
      return false;
    }
  };

  // Edit department
  const handleEditDepartment = async (id, updatedData) => {
    try {
      setError(null);
      const response = await api.updateDepartment(id, updatedData);
      setDepartments(
        departments.map((dept) => (dept.id === id ? response.data : dept))
      );
      setSuccess("Department updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update department");
      console.error("Error updating department:", err);
      return false;
    }
  };

  // Delete department
  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    try {
      setError(null);
      await api.deleteDepartment(id);
      setDepartments(departments.filter((dept) => dept.id !== id));
      setSuccess("Department deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department");
      console.error("Error deleting department:", err);
    }
  };

  // Fetch doctors from API (reserve doctors only)
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDoctors();
      // Response structure: { doctors: [], total: number, message: string }
      setDoctors(response.doctors || []);
    } catch (err) {
      setError("Failed to fetch reserve doctors. Please try again.");
      console.error("Error fetching reserve doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new doctor
  const handleAddDoctor = async (newDoctor) => {
    try {
      setError(null);
      const response = await api.addDoctor(newDoctor);
      
      // Handle success response from API
      if (response.success) {
        // Refresh doctors list to get updated data
        await fetchDoctors();
        setSuccess(response.message || "Doctor added successfully!");
        setTimeout(() => setSuccess(null), 3000);
        return true;
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to add doctor";
      setError(errorMsg);
      console.error("Error adding doctor:", err);
      return false;
    }
  };

  // Edit doctor
  const handleEditDoctor = async (id, updatedData) => {
    try {
      setError(null);
      const response = await api.updateDoctor(id, updatedData);
      setDoctors(
        doctors.map((doc) => (doc.id === id ? response.data : doc))
      );
      setSuccess("Doctor updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update doctor");
      console.error("Error updating doctor:", err);
      return false;
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }
    try {
      setError(null);
      await api.deleteDoctor(id);
      setDoctors(doctors.filter((doc) => doc.id !== id));
      setSuccess("Doctor deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete doctor");
      console.error("Error deleting doctor:", err);
    }
  };

  // Fetch patients from API (reserve patients only)
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPatients(100, 0, "created_at");
      // Response structure: { patients: [], total: number, count: number }
      setPatients(response.patients || []);
      setTotalPatients(response.total || 0);
    } catch (err) {
      setError("Failed to fetch reserve patients. Please try again.");
      console.error("Error fetching reserve patients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new patient
  const handleAddPatient = async (newPatient) => {
    try {
      setError(null);
      const response = await api.addPatient(newPatient);
      
      // Handle success response from API
      if (response.success) {
        // Refresh patients list to get updated data
        await fetchPatients();
        setSuccess(response.message || "Patient added successfully!");
        setTimeout(() => setSuccess(null), 3000);
        return true;
      }
    } catch (err) {
      // Handle different error types from backend
      let errorMsg = "Failed to add patient";
      
      if (err.code === "VALIDATION_ERROR") {
        errorMsg = err.message || "Validation error occurred";
      } else if (err.code === "DUPLICATE_PATIENT") {
        errorMsg = err.message || "Patient already exists";
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      console.error("Error adding patient:", err);
      return false;
    }
  };

  // Edit patient
  const handleEditPatient = async (id, updatedData) => {
    try {
      setError(null);
      const response = await api.updatePatient(id, updatedData);
      setPatients(
        patients.map((patient) => (patient.patient_admission_id === id ? response.data : patient))
      );
      setSuccess("Patient updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update patient");
      console.error("Error updating patient:", err);
      return false;
    }
  };

  // Delete patient
  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }
    try {
      setError(null);
      await api.deletePatient(id);
      setPatients(patients.filter((patient) => patient.patient_admission_id !== id));
      setTotalPatients(totalPatients - 1);
      setSuccess("Patient deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete patient");
      console.error("Error deleting patient:", err);
    }
  };

  // Save configuration
  const handleSaveConfiguration = async () => {
    try {
      setError(null);
      await api.saveConfiguration({ departments });
      setSuccess("Configuration saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to save configuration");
      console.error("Error saving configuration:", err);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDepartments();
  };

  // Export configuration
  const handleExport = (format) => {
    const data = { departments, viewMode };
    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `settings_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
    } else if (format === "csv") {
      // CSV export for departments
      const deptCSV = [
        ["ID", "Name", "Parent ID", "Type"],
        ...departments.map((d) => [d.id, d.name, d.parent_id || "", d.type]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([deptCSV], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `departments_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    }
    setSuccess(`Configuration exported as ${format.toUpperCase()}!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            ⚙️ Settings
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            Manage departments and system configuration
          </Typography>
        </Box>

      {/* Alerts */}
      {error && (
        <Alert color="danger" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert color="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Department Mapping Toggle */}
      <Box sx={{ mb: 3 }}>
        <DepartmentMappingToggle
          viewMode={viewMode}
          onToggle={(newMode) => setViewMode(newMode)}
        />
      </Box>

      {/* Actions Bar */}
      <Box sx={{ mb: 3 }}>
        <SettingActions
          departments={departments}
          onSave={handleSaveConfiguration}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <TabList>
          <Tab>🏥 Departments</Tab>
          <Tab>👨‍⚕️ Doctors</Tab>
          <Tab>🧑‍🤝‍🧑 Patients</Tab>
          <Tab>⚙️ Variable Attributes</Tab>
          <Tab>📋 Policy Configuration</Tab>
          <Tab>🚦 Training</Tab>
        </TabList>

        {/* Department Management Tab */}
        <TabPanel value={0} sx={{ p: 3 }}>
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Add Department Form */}
            <AddDepartmentForm
              onAdd={handleAddDepartment}
              departments={departments}
              viewMode={viewMode}
            />

            {/* Department Table */}
            <DepartmentTable
              departments={departments}
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
              loading={loading}
            />
          </Box>
        </TabPanel>

        {/* Doctors Management Tab */}
        <TabPanel value={1} sx={{ p: 3 }}>
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Add Doctor Form */}
            <AddDoctorForm
              onAdd={handleAddDoctor}
            />

            {/* Doctor Table */}
            <DoctorTable
              doctors={doctors}
              onEdit={handleEditDoctor}
              onDelete={handleDeleteDoctor}
              loading={loading}
            />
          </Box>
        </TabPanel>

        {/* Patients Management Tab */}
        <TabPanel value={2} sx={{ p: 3 }}>
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Add Patient Form */}
            <AddPatientForm
              onAdd={handleAddPatient}
            />

            {/* Patient Table */}
            <PatientTable
              patients={patients}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
              loading={loading}
              totalCount={totalPatients}
            />
          </Box>
        </TabPanel>

        {/* Variable Attributes Tab */}
        <TabPanel value={3} sx={{ p: 3 }}>
          <VariableAttributes />
        </TabPanel>

        {/* Policy Configuration Tab */}
        <TabPanel value={4} sx={{ p: 3 }}>
          <PolicyConfiguration />
        </TabPanel>

        {/* Training Tab */}
        <TabPanel value={5} sx={{ p: 3 }}>
          <Training />
        </TabPanel>
      </Tabs>
      </Box>
    </MainLayout>
  );
};

export default SettingPage;