// src/pages/NeverEventsPage.js
import React, { useState, useMemo } from "react";
import { Box, Typography, Modal, ModalDialog, ModalClose, DialogContent } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import NeverEventsStats from "../components/neverEvents/NeverEventsStats";
import NeverEventsTrendChart from "../components/neverEvents/NeverEventsTrendChart";
import RedFlagFilters from "../components/redflags/RedFlagFilters";
import NeverEventsTable from "../components/neverEvents/NeverEventsTable";
import NeverEventsDetails from "../components/neverEvents/NeverEventsDetails";
import { mockNeverEvents } from "../data/neverEventsData";

const NeverEventsPage = ({ embedded = false }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter never events based on search query
  const filteredEvents = useMemo(() => {
    let filtered = [...mockNeverEvents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        event =>
          event.recordID.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.neverEventTypeAr.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [searchQuery]);

  // Split into unfinished and finished
  const unfinishedEvents = filteredEvents.filter(event => event.status !== "FINISHED");
  const finishedEvents = filteredEvents.filter(event => event.status === "FINISHED");

  // Handle view details
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
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
            ⚠️ Never Events
          </Typography>
          <Typography level="body-md" sx={{ color: "#666" }}>
            الأحداث التي يجب ألا تحدث أبداً - Zero Tolerance Events
          </Typography>
        </Box>

        {/* KPI Cards */}
        <NeverEventsStats />

        {/* Trend Chart */}
        <NeverEventsTrendChart />

        {/* Search Filter */}
        <RedFlagFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Never Events Tables */}
        <NeverEventsTable
          title="⚠️ Never Events غير منتهية (Unfinished)"
          events={unfinishedEvents}
          loading={loading}
          onViewDetails={handleViewDetails}
          showStatus={true}
        />

        <NeverEventsTable
          title="✅ Never Events منتهية (Finished)"
          events={finishedEvents}
          loading={loading}
          onViewDetails={handleViewDetails}
          showStatus={false}
          isFinished={true}
        />

        {/* Details Modal */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <ModalDialog
            sx={{
              maxWidth: "900px",
              width: "95%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <ModalClose />
            <DialogContent>
              <NeverEventsDetails event={selectedEvent} />
            </DialogContent>
          </ModalDialog>
        </Modal>
      </Box>
  );

  return embedded ? content : <MainLayout>{content}</MainLayout>;
};

export default NeverEventsPage;
