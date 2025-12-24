// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { fetchDashboardHierarchy } from "../api/dashboard";

import { Box, Card, Typography } from "@mui/joy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

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
// ============================
  // STATE
  // ============================
  const [scope, setScope] = useState("hospital");
  const [selectedAdministration, setSelectedAdministration] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [hierarchy, setHierarchy] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  // ============================
  // FETCH HIERARCHY (NEW)
  // ============================
  useEffect(() => {
    fetchDashboardHierarchy()
      .then((data) => {
        setHierarchy(data);
        console.log("Hierarchy loaded:", data); // 👈 YOU WILL SEE DATA HERE
      })
      .catch(console.error)
      .finally(() => setLoadingHierarchy(false));
  }, []);

  // ============================
  // VIEW FLAGS
  // ============================
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

        {/* Trend Monitoring Link */}
        <Box sx={{ mt: 3 }}>
          <Card
            sx={{
              p: 2.5,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              border: "2px solid rgba(102, 126, 234, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.2)",
              },
            }}
            onClick={() => window.location.href = "/trend-monitoring"}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography level="h5" sx={{ fontWeight: 700, color: "#667eea", mb: 0.5 }}>
                  📊 عرض تحليل الاتجاهات (View Trend Analysis)
                </Typography>
                <Typography level="body-sm" sx={{ color: "#666" }}>
                  تتبع الاتجاهات الشهرية لاكتشاف أنماط التدهور والتحسين
                </Typography>
              </Box>
              <ArrowForwardIcon sx={{ fontSize: "32px", color: "#667eea" }} />
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default DashboardPage;
