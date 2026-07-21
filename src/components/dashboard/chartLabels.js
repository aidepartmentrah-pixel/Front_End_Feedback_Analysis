// Shared value-label renderer for the dashboard's bar charts.
// Renders the raw count (bold, larger) with the percentage-of-total
// (lighter, smaller) centered on a second line directly above each bar.
import React from "react";

export const renderBarValueLabel = (total) => (props) => {
  const { x, y, width, value } = props;
  if (value === undefined || value === null || width === undefined) return null;

  const cx = x + width / 2;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <g>
      <text x={cx} y={y - 21} textAnchor="middle" fontSize={13} fontWeight={700} fill="#2b2b3a">
        {value}
      </text>
      <text x={cx} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={500} fill="#8f8fa3">
        {`(${pct}%)`}
      </text>
    </g>
  );
};

// Push the tallest bar down ~20% so the two-line label above it never clips
// against the top of the chart, and reserve matching space in the margin.
export const BAR_LABEL_TOP_MARGIN = 34;
export const barLabelYAxisDomain = [0, (dataMax) => Math.ceil((dataMax || 0) * 1.2) || 1];

export const percentOf = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);
