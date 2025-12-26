// src/components/redflags/Pagination.js
import React from "react";
import { Box, Button, Typography } from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const Pagination = ({ total, limit, offset, onPageChange }) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const handlePrevious = () => {
    if (offset > 0) {
      onPageChange(offset - limit);
    }
  };

  const handleNext = () => {
    if (offset + limit < total) {
      onPageChange(offset + limit);
    }
  };

  const handlePageClick = (page) => {
    onPageChange((page - 1) * limit);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        mt: 3,
        flexWrap: "wrap",
      }}
    >
      <Button
        variant="outlined"
        color="neutral"
        size="sm"
        onClick={handlePrevious}
        disabled={offset === 0}
        startDecorator={<ArrowForwardIcon />}
      >
        السابق
      </Button>

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <Typography key={`ellipsis-${index}`} sx={{ px: 1 }}>
            ...
          </Typography>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "solid" : "outlined"}
            color={currentPage === page ? "primary" : "neutral"}
            size="sm"
            onClick={() => handlePageClick(page)}
            sx={{ minWidth: 40 }}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outlined"
        color="neutral"
        size="sm"
        onClick={handleNext}
        disabled={offset + limit >= total}
        endDecorator={<ArrowBackIcon />}
      >
        التالي
      </Button>

      <Typography level="body-sm" sx={{ color: "text.secondary", ml: 2 }}>
        صفحة {currentPage} من {totalPages}
      </Typography>
    </Box>
  );
};

export default Pagination;
