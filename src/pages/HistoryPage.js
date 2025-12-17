// src/pages/HistoryPage.js
import React, { useState } from "react";
import { Box, Tabs, TabList, Tab, TabPanel } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import PatientHistoryPage from "./PatientHistoryPage";
import DoctorHistoryPage from "./DoctorHistoryPage";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState(0);

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
          </TabList>

          <TabPanel value={0} sx={{ p: 0 }}>
            <PatientHistoryPage embedded={true} />
          </TabPanel>

          <TabPanel value={1} sx={{ p: 0 }}>
            <DoctorHistoryPage embedded={true} />
          </TabPanel>
        </Tabs>
      </Box>
    </MainLayout>
  );
};

export default HistoryPage;
