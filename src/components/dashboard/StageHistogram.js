import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const StageHistogram = ({ data, onBarClick }) => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  const handleClick = (data, index) => {
    setActiveIndex(index);
    if (onBarClick) {
      onBarClick(data);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <XAxis dataKey="stage" />
        <YAxis />
        <Tooltip cursor={{ fill: '#ffa50215' }} />
        <Bar dataKey="count" onClick={handleClick} cursor="pointer">
          {data.map((entry, index) => (
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
