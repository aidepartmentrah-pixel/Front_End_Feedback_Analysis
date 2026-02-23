import React from "react";
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";

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

const UniversalChart = ({ 
  data = [], 
  type = "bar", 
  height = 300,
  onBarClick,
  layout = "vertical"
}) => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  // Vibrant, professional color palette
  const COLORS = [
    "#2BBCC4",  // Primary Teal - bright and clear
    "#64A70B",  // Primary Green - vibrant
    "#FF6B6B",  // Coral Red - warm accent
    "#4ECDC4",  // Bright Cyan - fresh
    "#95E1D3",  // Mint Green - soft
    "#F38181",  // Salmon Pink - gentle
    "#AA96DA",  // Lavender - elegant
    "#FCBAD3",  // Rose Pink - playful
    "#A8E6CF",  // Light Green - soothing
    "#FFD93D",  // Golden Yellow - energetic
  ];

  const handleClick = (data, index) => {
    setActiveIndex(index);
    if (onBarClick) {
      onBarClick(data);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height, 
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

  // Bar Chart
  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          layout={layout}
          margin={{ top: 10, right: 30, left: layout === "vertical" ? 90 : 5, bottom: layout === "vertical" ? 20 : 100 }}
        >
          {layout === "horizontal" && (
            <XAxis 
              dataKey="name" 
              height={100}
              interval={0}
              tick={<CustomXAxisTick />}
              axisLine={{ stroke: '#ccc' }}
              tickLine={{ stroke: '#ccc' }}
            />
          )}
          {layout === "horizontal" && <YAxis />}
          {layout === "vertical" && <XAxis type="number" />}
          {layout === "vertical" && <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />}
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                return (
                  <div style={{ bgcolor: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                    <p style={{ margin: '0 0 4px 0' }}><strong>{payload[0].payload.name}</strong></p>
                    <p style={{ margin: '0' }}>Count: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" onClick={handleClick} cursor="pointer">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={activeIndex === index ? COLORS[0] : COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Pie Chart
  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, count }) => `${name}: ${count}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            onClick={(_, index) => handleClick(data[index], index)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                return (
                  <div style={{ bgcolor: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                    <p style={{ margin: '0 0 4px 0' }}><strong>{payload[0].payload.name}</strong></p>
                    <p style={{ margin: '0' }}>Count: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Donut Chart (Pie with inner radius)
  if (type === "donut") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            labelLine={false}
            label={({ name, count }) => `${name}: ${count}`}
            fill="#8884d8"
            dataKey="count"
            onClick={(_, index) => handleClick(data[index], index)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                return (
                  <div style={{ bgcolor: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                    <p style={{ margin: '0 0 4px 0' }}><strong>{payload[0].payload.name}</strong></p>
                    <p style={{ margin: '0' }}>Count: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Line Chart
  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart 
          data={data}
          margin={{ top: 10, right: 30, left: 60, bottom: 100 }}
        >
          <XAxis 
            dataKey="name" 
            height={100}
            interval={0}
            tick={<CustomXAxisTick />}
            axisLine={{ stroke: '#ccc' }}
            tickLine={{ stroke: '#ccc' }}
          />
          <YAxis />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                return (
                  <div style={{ bgcolor: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}>
                    <p style={{ margin: '0 0 4px 0' }}><strong>{payload[0].payload.name}</strong></p>
                    <p style={{ margin: '0' }}>Count: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#667eea" 
            strokeWidth={2}
            dot={{ fill: "#667eea", r: 5 }}
            activeDot={{ r: 8 }}
            onClick={(_, index) => handleClick(data[index], index)}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default UniversalChart;
