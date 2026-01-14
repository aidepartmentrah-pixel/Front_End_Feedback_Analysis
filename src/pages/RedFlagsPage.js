// src/pages/RedFlagsPage.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import MainLayout from "../components/common/MainLayout";
import StatisticsCards from "../components/redflags/StatisticsCards";
import FilterPanel from "../components/redflags/FilterPanel";
import RedFlagsTable from "../components/redflags/RedFlagsTable";
import TrendChart from "../components/redflags/TrendChart";
import DetailsModal from "../components/redflags/DetailsModal";
import Pagination from "../components/redflags/Pagination";
import CategoryBreakdownCard from "../components/redflags/CategoryBreakdownCard";
import DepartmentBreakdownCard from "../components/redflags/DepartmentBreakdownCard";
import {
  fetchRedFlags,
  fetchRedFlagStatistics,
  fetchRedFlagTrends,
  fetchRedFlagDetails,
  fetchRedFlagsCategoryBreakdown,
  fetchRedFlagsDepartmentBreakdown,
} from "../api/redFlags";

const RedFlagsPage = ({ embedded = false }) => {
  // State management
  const [redFlags, setRedFlags] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [departmentBreakdown, setDepartmentBreakdown] = useState(null);
  const [selectedRedFlag, setSelectedRedFlag] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Loading states
  const [loadingRedFlags, setLoadingRedFlags] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingCategoryBreakdown, setLoadingCategoryBreakdown] = useState(false);
  const [loadingDepartmentBreakdown, setLoadingDepartmentBreakdown] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    severity: "",
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

  // Pagination
  const [totalCount, setTotalCount] = useState(0);

  // Fetch red flags
  useEffect(() => {
    const loadRedFlags = async () => {
      setLoadingRedFlags(true);
      try {
        const data = await fetchRedFlags(filters);
        setRedFlags(data.red_flags || []);
        setTotalCount(data.total || 0);
      } catch (error) {
        console.error("Error loading red flags:", error);
      } finally {
        setLoadingRedFlags(false);
      }
    };

    loadRedFlags();
  }, [filters]);

  // Fetch statistics
  useEffect(() => {
    const loadStatistics = async () => {
      setLoadingStats(true);
      try {
        const data = await fetchRedFlagStatistics({
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
        const data = await fetchRedFlagTrends({
          from_date: filters.from_date,
          to_date: filters.to_date,
          granularity,
          group_by: groupBy,
        });
        setTrends(data.trends || []);
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
        const data = await fetchRedFlagsCategoryBreakdown({
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

  // Fetch department breakdown
  useEffect(() => {
    const loadDepartmentBreakdown = async () => {
      setLoadingDepartmentBreakdown(true);
      try {
        const data = await fetchRedFlagsDepartmentBreakdown({
          from_date: filters.from_date,
          to_date: filters.to_date,
          limit: 10,
        });
        setDepartmentBreakdown(data);
      } catch (error) {
        console.error("Error loading department breakdown:", error);
      } finally {
        setLoadingDepartmentBreakdown(false);
      }
    };

    loadDepartmentBreakdown();
  }, [filters.from_date, filters.to_date]);

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
      severity: "",
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
      const data = await fetchRedFlagDetails(id);
      setSelectedRedFlag(data);
    } catch (error) {
      console.error("Error loading red flag details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRedFlag(null);
  };

  const content = (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography level="h2" sx={{ fontWeight: 700 }}>
          🚩 الأعلام الحمراء (Critical Issues)
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<DownloadIcon />}
            disabled
            title="قريبًا"
          >
            تصدير PDF
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<DownloadIcon />}
            disabled
            title="قريبًا"
          >
            تصدير جماعي
          </Button>
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
        <DepartmentBreakdownCard 
          data={departmentBreakdown} 
          loading={loadingDepartmentBreakdown} 
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
          إجمالي النتائج: <strong>{totalCount}</strong> علم أحمر
        </Typography>
        {loadingRedFlags && <CircularProgress size="sm" />}
      </Box>

      {/* Red Flags Table */}
      <RedFlagsTable
        redFlags={redFlags}
        loading={loadingRedFlags}
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
        redFlag={selectedRedFlag}
        loading={loadingDetails}
      />
    </Box>
  );

  if (embedded) {
    return content;
  }

  return <MainLayout>{content}</MainLayout>;
};

export default RedFlagsPage;
