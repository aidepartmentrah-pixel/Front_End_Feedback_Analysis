// src/pages/DashboardPage.js
import React, { useState } from "react";
import { Box } from "@mui/joy";

// Components
import MainLayout from "../components/common/MainLayout";
import DepartmentSelector from "../components/dashboard/DepartmentSelector";
import DashboardTitle from "../components/dashboard/DashboardTitle";
import GlobalDashboardStats from "../components/dashboard/GlobalDashboardStats";
import IdaraDashboardStats from "../components/dashboard/IdaraDashboardStats";
import DayraDashboardStats from "../components/dashboard/DayraDashboardStats";
import QismDashboardStats from "../components/dashboard/QismDashboardStats";
import DashboardActions from "../components/dashboard/DashboardActions";

const DashboardPage = () => {
  // Simplified state structure
  const [scope, setScope] = useState("hospital");
  const [selectedAdministration, setSelectedAdministration] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  // Determine which view to show based on scope and selections
  const isGlobalView = scope === "hospital";
  const isIdaraView = scope === "administration" && selectedAdministration;
  const isDayraView = scope === "department" && selectedDepartment;
  const isQismView = scope === "section" && selectedSection;

  return (
    <MainLayout>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Simplified Cascading Selector */}
        <DepartmentSelector
          scope={scope}
          setScope={setScope}
          selectedAdministration={selectedAdministration}
          setSelectedAdministration={setSelectedAdministration}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />

        {/* Simplified Dashboard Title */}
        <DashboardTitle
          scope={scope}
          selectedAdministration={selectedAdministration}
          selectedDepartment={selectedDepartment}
          selectedSection={selectedSection}
        />

        {/* Conditional Dashboard Views */}
        {isGlobalView && <GlobalDashboardStats />}
        {isIdaraView && <IdaraDashboardStats idara={selectedAdministration} />}
        {isDayraView && <DayraDashboardStats dayra={selectedDepartment} />}
        {isQismView && <QismDashboardStats qism={selectedSection} />}

        {/* Dashboard Actions */}
        <Box sx={{ mt: 3 }}>
          <DashboardActions />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
