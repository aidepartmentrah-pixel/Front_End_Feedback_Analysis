import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Top5ClassificationChart = ({ data, onBarClick }) => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  const handleClick = (data, index) => {
    setActiveIndex(index);
    if (onBarClick) {
      onBarClick(data);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="classification" />
        <Tooltip cursor={{ fill: '#667eea15' }} />
        <Bar dataKey="count" onClick={handleClick} cursor="pointer">
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={activeIndex === index ? "#667eea" : "#1976d2"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Top5ClassificationChart;
