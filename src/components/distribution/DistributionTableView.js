// src/components/distribution/DistributionTableView.js
import React, { useState, memo } from 'react';
import { Box, Typography, Card, Sheet, Table, Chip } from '@mui/joy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

/**
 * Table View for distribution data with sorting
 * @param {Object} props
 * @param {Array} props.buckets - Array of bucket data
 */
const DistributionTableView = memo(({ buckets }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  if (!buckets || buckets.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="neutral">No data to display</Typography>
      </Card>
    );
  }

  // Flatten buckets data into rows
  const rows = [];
  buckets.forEach((bucket) => {
    bucket.values.forEach((value) => {
      rows.push({
        time_label: bucket.time_label,
        key: value.key,
        count: value.count,
        percent: value.percent,
        total: bucket.total,
      });
    });
  });

  // Calculate totals
  const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
  const totalPercent = rows.reduce((sum, row) => sum + row.percent, 0) / buckets.length;

  // Handle sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort rows
  let sortedRows = [...rows];
  if (sortColumn) {
    sortedRows.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle string comparison
      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle number comparison
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  // Render sort icon
  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
    );
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography level="title-lg" sx={{ fontWeight: 700 }}>
          Distribution Data Table
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          Detailed breakdown of all records
        </Typography>
      </Box>

      <Sheet
        variant="outlined"
        sx={{
          borderRadius: 'sm',
          overflow: 'auto',
          maxHeight: 500,
        }}
      >
        <Table
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '2px',
            '& thead th': { fontWeight: 700 },
          }}
        >
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('time_label')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Time Period
                  <SortIcon column="time_label" />
                </Box>
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('key')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Dimension
                  <SortIcon column="key" />
                </Box>
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                onClick={() => handleSort('count')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  Count
                  <SortIcon column="count" />
                </Box>
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                onClick={() => handleSort('percent')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  Percentage
                  <SortIcon column="percent" />
                </Box>
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}
                onClick={() => handleSort('total')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  Period Total
                  <SortIcon column="total" />
                </Box>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={index}>
                <td>{row.time_label}</td>
                <td>
                  <Chip variant="soft" size="sm">
                    {row.key}
                  </Chip>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Typography fontWeight={600}>{row.count}</Typography>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Typography color="primary">
                    {(row.percent * 100).toFixed(1)}%
                  </Typography>
                </td>
                <td style={{ textAlign: 'right' }}>{row.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ fontWeight: 700 }}>
                TOTAL
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>
                {totalCount}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>
                {((totalPercent) * 100).toFixed(1)}%
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>-</td>
            </tr>
          </tfoot>
        </Table>
      </Sheet>
    </Card>
  );
});

DistributionTableView.displayName = 'DistributionTableView';

export default DistributionTableView;
