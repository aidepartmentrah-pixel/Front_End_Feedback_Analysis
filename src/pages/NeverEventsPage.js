// src/pages/NeverEventsPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/joy";
import MainLayout from "../components/common/MainLayout";
import StatisticsCards from "../components/neverEvents/StatisticsCards";
import FilterPanel from "../components/neverEvents/FilterPanel";
import NeverEventsTable from "../components/neverEvents/NeverEventsTable";
import TrendChart from "../components/neverEvents/TrendChart";
import DetailsModal from "../components/neverEvents/DetailsModal";
import Pagination from "../components/redflags/Pagination";
import CategoryBreakdownCard from "../components/neverEvents/CategoryBreakdownCard";
import TimelineComparisonCard from "../components/neverEvents/TimelineComparisonCard";
import {
  fetchNeverEvents,
  fetchNeverEventsStatistics,
  fetchNeverEventsTrends,
  fetchNeverEventDetails,
  fetchNeverEventsCategoryBreakdown,
  fetchNeverEventsTimelineComparison,
} from "../api/neverEvents";

const NeverEventsPage = ({ embedded = false }) => {
  // State management
  const [neverEvents, setNeverEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [timelineComparison, setTimelineComparison] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Loading states
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingCategoryBreakdown, setLoadingCategoryBreakdown] = useState(false);
  const [loadingTimelineComparison, setLoadingTimelineComparison] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    department: "",
    category: "",
    from_date: "",
    to_date: "",
    limit: 100,
    offset: 0,
  });

  // Trend controls
  const [granularity, setGranularity] = useState("monthly");
  const [groupBy, setGroupBy] = useState("none");
  const [comparisonPeriod, setComparisonPeriod] = useState("month");

  // Pagination
  const [totalCount, setTotalCount] = useState(0);

  // Fetch never events
  useEffect(() => {
    const loadNeverEvents = async () => {
      setLoadingEvents(true);
      try {
        const data = await fetchNeverEvents(filters);
        setNeverEvents(data.never_events || []);
        setTotalCount(data.total || 0);
      } catch (error) {
        console.error("Error loading never events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadNeverEvents();
  }, [filters]);

  // Fetch statistics
  useEffect(() => {
    const loadStatistics = async () => {
      setLoadingStats(true);
      try {
        const data = await fetchNeverEventsStatistics({
          from_date: filters.from_date,
          to_date: filters.to_date,
        });
        setStatistics(data);
      } catch (error) {
        console.error("Error loading statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStatistics();
  }, [filters.from_date, filters.to_date]);

  // Fetch trends
  useEffect(() => {
    const loadTrends = async () => {
      setLoadingTrends(true);
      try {
        const data = await fetchNeverEventsTrends({
          from_date: filters.from_date,
          to_date: filters.to_date,
          granularity,
          group_by: groupBy,
        });
        setTrends(data.data || []);
      } catch (error) {
        console.error("Error loading trends:", error);
      } finally {
        setLoadingTrends(false);
      }
    };

    loadTrends();
  }, [filters.from_date, filters.to_date, granularity, groupBy]);

  // Fetch category breakdown
  useEffect(() => {
    const loadCategoryBreakdown = async () => {
      setLoadingCategoryBreakdown(true);
      try {
        const data = await fetchNeverEventsCategoryBreakdown({
          from_date: filters.from_date,
          to_date: filters.to_date,
        });
        setCategoryBreakdown(data);
      } catch (error) {
        console.error("Error loading category breakdown:", error);
      } finally {
        setLoadingCategoryBreakdown(false);
      }
    };

    loadCategoryBreakdown();
  }, [filters.from_date, filters.to_date]);

  // Fetch timeline comparison
  useEffect(() => {
    const loadTimelineComparison = async () => {
      setLoadingTimelineComparison(true);
      try {
        const data = await fetchNeverEventsTimelineComparison(comparisonPeriod);
        setTimelineComparison(data);
      } catch (error) {
        console.error("Error loading timeline comparison:", error);
      } finally {
        setLoadingTimelineComparison(false);
      }
    };

    loadTimelineComparison();
  }, [comparisonPeriod]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset to first page when filters change
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      department: "",
      category: "",
      from_date: "",
      to_date: "",
      limit: 100,
      offset: 0,
    });
  };

  // Handle row click - open details modal
  const handleRowClick = async (id) => {
    setModalOpen(true);
    setLoadingDetails(true);
    try {
      const data = await fetchNeverEventDetails(id);
      setSelectedEvent(data);
    } catch (error) {
      console.error("Error loading never event details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const content = (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography level="h2" sx={{ fontWeight: 700 }}>
            ⚠️ الأحداث التي لا يجب أن تحدث (Never Events)
          </Typography>
          <Typography level="body-sm" sx={{ color: "#dc2626", fontWeight: 600 }}>
            معايير الصفرية - Zero Tolerance
          </Typography>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <StatisticsCards statistics={statistics} loading={loadingStats} />

      {/* Breakdown Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
        <CategoryBreakdownCard 
          data={categoryBreakdown} 
          loading={loadingCategoryBreakdown} 
        />
        <TimelineComparisonCard 
          data={timelineComparison} 
          loading={loadingTimelineComparison}
          period={comparisonPeriod}
          onPeriodChange={setComparisonPeriod}
        />
      </Box>

      {/* Trend Chart */}
      <Box sx={{ mt: 3 }}>
        <TrendChart
          trends={trends}
          loading={loadingTrends}
          granularity={granularity}
          groupBy={groupBy}
          onGranularityChange={setGranularity}
          onGroupByChange={setGroupBy}
        />
      </Box>

      <Box sx={{ mt: 3 }} />

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography level="body-md" sx={{ color: "text.secondary" }}>
          إجمالي النتائج: <strong>{totalCount}</strong> حدث
        </Typography>
        {loadingEvents && <CircularProgress size="sm" />}
      </Box>

      {/* Never Events Table */}
      <NeverEventsTable
        neverEvents={neverEvents}
        loading={loadingEvents}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      <Pagination
        total={totalCount}
        limit={filters.limit}
        offset={filters.offset}
        onPageChange={(newOffset) => handleFilterChange("offset", newOffset)}
      />

      {/* Details Modal */}
      <DetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        neverEvent={selectedEvent}
        loading={loadingDetails}
      />
    </Box>
  );

  if (embedded) {
    return content;
  }

  return <MainLayout>{content}</MainLayout>;
};

export default NeverEventsPage;
