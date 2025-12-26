// src/components/TableView/Pagination.js
import React from "react";
import { Box, Button, Typography } from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 4) {
        // Near start: [1, 2, 3, 4, 5, ..., last]
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end: [1, ..., last-4, last-3, last-2, last-1, last]
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // Middle: [1, ..., current-1, current, current+1, ..., last]
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {/* Left side: Page info */}
      <Typography level="body-sm" sx={{ color: "text.secondary" }}>
        Page {currentPage} of {totalPages}
      </Typography>

      {/* Center: Page numbers */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {/* First page */}
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <FirstPageIcon />
        </Button>

        {/* Previous */}
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ArrowBackIcon />
        </Button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <Typography key={`ellipsis-${index}`} level="body-sm" sx={{ px: 1, alignSelf: "center" }}>
              ...
            </Typography>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "solid" : "outlined"}
              color={page === currentPage ? "primary" : "neutral"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        )}

        {/* Next */}
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ArrowForwardIcon />
        </Button>

        {/* Last page */}
        <Button
          variant="outlined"
          color="neutral"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <LastPageIcon />
        </Button>
      </Box>

      {/* Right side: Quick jump (optional) */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
          Jump to:
        </Typography>
        <input
          type="number"
          min={1}
          max={totalPages}
          placeholder={currentPage.toString()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
                e.target.value = "";
              }
            }
          }}
          style={{
            width: "60px",
            padding: "4px 8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
      </Box>
    </Box>
  );
};

export default Pagination;
