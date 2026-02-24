// src/pages/SettingPage.js
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Tabs, TabList, Tab, TabPanel, Alert } from "@mui/joy";
import theme from '../theme';
import MainLayout from "../components/common/MainLayout";
import DepartmentTable from "../components/settings/DepartmentTable";
import AddDepartmentForm from "../components/settings/AddDepartmentForm";
import DoctorTable from "../components/settings/DoctorTable";
import AddDoctorForm from "../components/settings/AddDoctorForm";
import PatientTable from "../components/settings/PatientTable";
import AddPatientForm from "../components/settings/AddPatientForm";
import PolicyConfiguration from "../components/settings/PolicyConfiguration";
import Training from "../components/settings/Training";
import UnifiedUsersTab from "./settings/UnifiedUsersTab";
import SectionCreationPanel from "../components/settings/SectionCreationPanel"; // PHASE C — Production Section Creation Tool
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { canRoleSeeSettingsTab, SETTINGS_TAB_KEYS } from "../security/roleVisibilityMap";

const SettingPage = () => {
  // Auth context for role checking
  const { user } = useAuth();
  
  // Helper to get primary role from user
  const getPrimaryRole = (user) => {
    if (!user || !user.roles || user.roles.length === 0) return null;
    return user.roles[0];
  };
  
  // Get primary role for visibility checks
  const primaryRole = getPrimaryRole(user);
  
  // Define all available tabs with their keys
  const allTabs = useMemo(() => [
    {
      key: SETTINGS_TAB_KEYS.DEPARTMENTS,
      label: "🏥 Departments",
      component: 0
    },
    {
      key: SETTINGS_TAB_KEYS.DOCTORS,
      label: "👨‍⚕️ Doctors",
      component: 1
    },
    {
      key: SETTINGS_TAB_KEYS.PATIENTS,
      label: "🧑‍🤝‍🧑 Patients",
      component: 2
    },
    {
      key: SETTINGS_TAB_KEYS.POLICY,
      label: "📋 Policy Configuration",
      component: 4
    },
    {
      key: SETTINGS_TAB_KEYS.TRAINING,
      label: "🚦 Training",
      component: 5
    },
    {
      key: SETTINGS_TAB_KEYS.USERS,
      label: "� Users Management",
      component: 6
    },    {
      key: SETTINGS_TAB_KEYS.HARDWARE_CONFIG,
      label: "🔧 Hardware Config",
      component: 7
    },  ], []);
  
  // Filter tabs based on role visibility
  const visibleTabs = useMemo(() => {
    if (!primaryRole) return [];
    return allTabs.filter(tab => canRoleSeeSettingsTab(primaryRole, tab.key));
  }, [primaryRole, allTabs]);

  // State Management
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

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
      const response = await api.getDepartments();
      setDepartments(response.data || []);
    } catch (err) {
      setError("Failed to fetch departments. Please try again.");
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
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

  // Add new department
  const handleAddDepartment = async (newDepartment) => {
    try {
      setError(null);
      const response = await api.addDepartment(newDepartment);
      
      // Handle success response from API
      if (response.success || response.data) {
        // Refresh departments list to get updated data
        await fetchDepartments();
        setSuccess(response.message || "Department added successfully!");
        setTimeout(() => setSuccess(null), 3000);
        return true;
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to add department";
      setError(errorMsg);
      console.error("Error adding department:", err);
      return false;
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

  // Refresh data
  const handleRefresh = () => {
    fetchDepartments();
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
              background: theme.gradients.primary,
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

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <TabList>
          {visibleTabs.map((tab, index) => (
            <Tab key={`${tab.key}-${index}`}>{tab.label}</Tab>
          ))}
        </TabList>

        {/* Render TabPanels for visible tabs only */}
        {visibleTabs.map((tab, index) => {
          // Departments Tab
          if (tab.component === 0) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3 }}>
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Department Table */}
                  <DepartmentTable
                    departments={departments}
                    onEdit={handleEditDepartment}
                    onDelete={handleDeleteDepartment}
                    loading={loading}
                  />

                  {/* PHASE C — F-C8 — Role Guard — Section Creation restricted to SOFTWARE_ADMIN */}
                  {primaryRole === 'SOFTWARE_ADMIN' && (
                    <Box sx={{ mt: 3 }}>
                      <SectionCreationPanel />
                    </Box>
                  )}
                </Box>
              </TabPanel>
            );
          }
          
          // Doctors Tab
          if (tab.component === 1) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3 }}>
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Add Doctor Form */}
                  <AddDoctorForm onAdd={handleAddDoctor} />

                  {/* Doctor Table */}
                  <DoctorTable
                    doctors={doctors}
                    onEdit={handleEditDoctor}
                    onDelete={handleDeleteDoctor}
                    loading={loading}
                  />
                </Box>
              </TabPanel>
            );
          }
          
          // Patients Tab
          if (tab.component === 2) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3 }}>
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Add Patient Form */}
                  <AddPatientForm onAdd={handleAddPatient} />

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
            );
          }
          
          // Policy Configuration Tab
          if (tab.component === 4) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3 }}>
                <PolicyConfiguration />
              </TabPanel>
            );
          }
          
          // Training Tab
          if (tab.component === 5) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3 }}>
                <Training />
              </TabPanel>
            );
          }
          
          // Unified Users Management Tab
          if (tab.component === 6) {
            return (
              <TabPanel key={`panel-${tab.key}-${index}`} value={index} sx={{ p: 3 }}>
                <UnifiedUsersTab />
              </TabPanel>
            );
          }
          
          return null;
        })}
      </Tabs>
      </Box>
    </MainLayout>
  );
};

export default SettingPage;