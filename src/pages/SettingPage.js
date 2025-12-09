// src/pages/SettingPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, TabList, Tab, TabPanel, Alert } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import DepartmentTable from "../components/settings/DepartmentTable";
import AddDepartmentForm from "../components/settings/AddDepartmentForm";
import DoctorTable from "../components/settings/DoctorTable";
import AddDoctorForm from "../components/settings/AddDoctorForm";
import DepartmentMappingToggle from "../components/settings/DepartmentMappingToggle";
import SettingActions from "../components/settings/SettingActions";
import api from "../services/api";

const SettingPage = () => {
  // State Management
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
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

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDoctors();
      setDoctors(response.data || []);
    } catch (err) {
      setError("Failed to fetch doctors. Please try again.");
      console.error("Error fetching doctors:", err);
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

  // Add new doctor
  const handleAddDoctor = async (newDoctor) => {
    try {
      setError(null);
      const response = await api.addDoctor(newDoctor);
      setDoctors([...doctors, response.data]);
      setSuccess("Doctor added successfully!");
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add doctor");
      console.error("Error adding doctor:", err);
      return false;
    }
  };

  // Edit doctor
  const handleEditDoctor = async (id, updatedData) => {
    try {
      setError(null);
      const response = await api.updateDoctor(id, updatedData);
      setDoctors(doctors.map((doc) => (doc.id === id ? response.data : doc)));
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

  // Save configuration
  const handleSaveConfiguration = async () => {
    try {
      setError(null);
      await api.saveConfiguration({ departments, doctors });
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
    fetchDoctors();
  };

  // Export configuration
  const handleExport = (format) => {
    const data = { departments, doctors, viewMode };
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
            Manage departments, doctors, and system configuration
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
          doctors={doctors}
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

        {/* Doctor Management Tab */}
        <TabPanel value={1} sx={{ p: 3 }}>
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Add Doctor Form */}
            <AddDoctorForm
              onAdd={handleAddDoctor}
              departments={departments}
            />

            {/* Doctor Table */}
            <DoctorTable
              doctors={doctors}
              departments={departments}
              onEdit={handleEditDoctor}
              onDelete={handleDeleteDoctor}
              loading={loading}
            />
          </Box>
        </TabPanel>
      </Tabs>
      </Box>
    </MainLayout>
  );
};

export default SettingPage;