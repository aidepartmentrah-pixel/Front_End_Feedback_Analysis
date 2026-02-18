// src/pages/HistoryPage.js
// Phase D — Added Worker History tab
// Phase D — role guard restricted to software_admin + complaint_department_worker
import React, { useState } from "react";
import { Box, Tabs, TabList, Tab, TabPanel } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import PatientHistoryPage from "./PatientHistoryPage";
import DoctorHistoryPage from "./DoctorHistoryPage";
import WorkerHistoryPage from "./WorkerHistoryPage";
import { useAuth } from "../context/AuthContext";
import { canViewPersonReporting } from "../utils/roleGuards";

const HistoryPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  
  // Phase D — role guard: Check if user can view person reporting
  const canViewReporting = canViewPersonReporting(user);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <TabList
            sx={{
              mb: 3,
              '--List-padding': '0px',
              '--ListItem-minHeight': '48px',
            }}
          >
            <Tab
              sx={{
                fontWeight: 700,
                fontSize: "15px",
                px: 4,
                py: 1.5,
                borderRadius: "8px 8px 0 0",
              }}
            >
              👤 تاريخ المريض (Patient History)
            </Tab>
            {/* Phase D — role guard: Only show Doctor tab if authorized */}
            {canViewReporting && (
              <Tab
                sx={{
                  fontWeight: 700,
                  fontSize: "15px",
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px 8px 0 0",
                }}
              >
                👨‍⚕️ تاريخ الطبيب (Doctor History)
              </Tab>
            )}
            {/* Phase D — role guard: Only show Worker tab if authorized */}
            {canViewReporting && (
              <Tab
                sx={{
                  fontWeight: 700,
                  fontSize: "15px",
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px 8px 0 0",
                }}
              >
                🧑‍💼 تاريخ الموظف (Worker History)
              </Tab>
            )}
          </TabList>

          <TabPanel value={0} sx={{ p: 0 }}>
            <PatientHistoryPage embedded={true} />
          </TabPanel>

          {/* Phase D — role guard: Only render Doctor panel if authorized */}
          {canViewReporting && (
            <TabPanel value={1} sx={{ p: 0 }}>
              <DoctorHistoryPage embedded={true} />
            </TabPanel>
          )}

          {/* Phase D — role guard: Only render Worker panel if authorized */}
          {canViewReporting && (
            <TabPanel value={2} sx={{ p: 0 }}>
              <WorkerHistoryPage embedded={true} />
            </TabPanel>
          )}
        </Tabs>
      </Box>
    </MainLayout>
  );
};

export default HistoryPage;
