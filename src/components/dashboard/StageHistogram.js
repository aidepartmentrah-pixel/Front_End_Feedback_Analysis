import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Custom tick component for vertical labels positioned below bars
const CustomXAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        fontSize={13}
        transform="rotate(-90)"
      >
        {payload.value}
      </text>
    </g>
  );
};

const StageHistogram = ({ data = [], onBarClick }) => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  const handleClick = (data, index) => {
    setActiveIndex(index);
    if (onBarClick) {
      onBarClick(data);
    }
  };

  // Truncate long labels for display
  const truncateLabel = (label, maxLength = 20) => {
    if (!label) return "Unknown";
    return label.length > maxLength ? label.substring(0, maxLength) + "..." : label;
  };

  // Ensure data is always an array and add truncated display names
  const chartData = Array.isArray(data) ? data.map(item => ({
    ...item,
    displayStage: truncateLabel(item.stage || item.name || "Unknown"),
    fullStage: item.stage || item.name || "Unknown"
  })) : [];

  if (chartData.length === 0) {
    return (
      <div style={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#999',
        fontSize: '14px'
      }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 5, bottom: 100 }}>
        <XAxis 
          dataKey="displayStage" 
          height={100}
          interval={0}
          tick={<CustomXAxisTick />}
          axisLine={{ stroke: '#ccc' }}
          tickLine={{ stroke: '#ccc' }}
        />
        <YAxis />
        <Tooltip 
          cursor={{ fill: '#ffa50215' }}
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              return (
                <div style={{ bgcolor: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                  <p style={{ margin: '0 0 4px 0' }}><strong>{payload[0].payload.fullStage}</strong></p>
                  <p style={{ margin: '0' }}>Count: {payload[0].value}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" onClick={handleClick} cursor="pointer">
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={activeIndex === index ? "#ffa502" : "#ff9800"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StageHistogram;
