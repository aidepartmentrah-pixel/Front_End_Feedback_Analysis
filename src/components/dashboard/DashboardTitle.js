// src/components/dashboard/DashboardTitle.js
import React from "react";
import { Typography } from "@mui/joy";
import { mockDepartmentHierarchy } from "./DepartmentSelector";

const DashboardTitle = ({ 
  scope, 
  selectedAdministration, 
  selectedDepartment, 
  selectedSection 
}) => {
  // Helper to get entity name by ID
  const getEntityName = (type, id) => {
    if (!id) return null;

    if (type === "administration") {
      const entity = mockDepartmentHierarchy.idarat.find((i) => i.id === id);
      return entity ? entity.nameEn : null;
    }

    if (type === "department") {
      for (const key in mockDepartmentHierarchy.dayrat) {
        const entity = mockDepartmentHierarchy.dayrat[key].find((d) => d.id === id);
        if (entity) return entity.nameEn;
      }
      return null;
    }

    if (type === "section") {
      for (const key in mockDepartmentHierarchy.aqsam) {
        const entity = mockDepartmentHierarchy.aqsam[key].find((q) => q.id === id);
        if (entity) return entity.nameEn;
      }
      return null;
    }

    return null;
  };

  // Determine title based on scope and selections
  const getTitle = () => {
    if (scope === "hospital") {
      return "Hospital";
    } else if (scope === "administration" && selectedAdministration) {
      return getEntityName("administration", selectedAdministration);
    } else if (scope === "department" && selectedDepartment) {
      return getEntityName("department", selectedDepartment);
    } else if (scope === "section" && selectedSection) {
      return getEntityName("section", selectedSection);
    }
    return "Hospital";
  };

  return (
    <Typography
      level="h3"
      sx={{
        mb: 3,
        fontWeight: 800,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Dashboard — {getTitle()}
    </Typography>
  );
};

export default DashboardTitle;
