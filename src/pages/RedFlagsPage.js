// src/pages/RedFlagsPage.js
import React, { useState, useMemo } from "react";
import { Box, Typography, Modal, ModalDialog, ModalClose, DialogContent } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import RedFlagStats from "../components/redflags/RedFlagStats";
import RedFlagTrendChart from "../components/redflags/RedFlagTrendChart";
import RedFlagFilters from "../components/redflags/RedFlagFilters";
import RedFlagTable from "../components/redflags/RedFlagTable";
import RedFlagDetails from "../components/redflags/RedFlagDetails";
import NeverEventsSummaryCard from "../components/redflags/NeverEventsSummaryCard";
import { mockRedFlags } from "../data/redflagsData";

const RedFlagsPage = ({ embedded = false }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter red flags based on search query
  const filteredRedFlags = useMemo(() => {
    let filtered = [...mockRedFlags];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        flag =>
          flag.recordID.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flag.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [searchQuery]);

  // Split into unfinished and finished
  const unfinishedRedFlags = filteredRedFlags.filter(flag => flag.status !== "FINISHED");
  const finishedRedFlags = filteredRedFlags.filter(flag => flag.status === "FINISHED");

  // Handle view details
  const handleViewDetails = (flag) => {
    setSelectedFlag(flag);
    setModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFlag(null);
  };

  // Handle export PDF (mock function)
  const handleExportPDF = (flag) => {
    alert(`📄 تصدير PDF للسجل: ${flag.recordID}\n\nسيتم إنشاء تقرير PDF مفصل للعلامة الحمراء.`);
  };

  const content = (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #ff4757 0%, #e84118 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            🚩 العلامات الحمراء (Red Flags)
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            الحوادث الحرجة التي تتطلب اهتماماً فورياً ومتابعة دقيقة
          </Typography>
        </Box>

        {/* KPI Cards */}
        <RedFlagStats />

        {/* Trend Chart */}
        <RedFlagTrendChart />

        {/* Never Events Summary */}
        <NeverEventsSummaryCard />

        {/* Search Filter */}
        <RedFlagFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Red Flags Tables */}
        <RedFlagTable
          title="🚩 علامات حمراء غير منتهية (Unfinished Red Flags)"
          redflags={unfinishedRedFlags}
          loading={loading}
          onViewDetails={handleViewDetails}
          showStatus={true}
        />

        <RedFlagTable
          title="✅ علامات حمراف منتهية (Finished Red Flags)"
          redflags={finishedRedFlags}
          loading={loading}
          onViewDetails={handleViewDetails}
          showStatus={false}
          isFinished={true}
        />

        {/* Details Modal */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <ModalDialog
            sx={{
              maxWidth: "1400px",
              width: "85vw",
              maxHeight: "90vh",
              overflow: "hidden",
              p: 0,
            }}
          >
            <ModalClose />
            <DialogContent
              sx={{
                p: 4,
                overflow: "auto",
                maxHeight: "calc(90vh - 40px)",
              }}
            >
              {selectedFlag && (
                <RedFlagDetails
                  redflag={selectedFlag}
                  onExportPDF={handleExportPDF}
                />
              )}
            </DialogContent>
          </ModalDialog>
        </Modal>
      </Box>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default RedFlagsPage;
