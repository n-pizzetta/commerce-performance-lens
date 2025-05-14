
import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: any[];
  xAxisDataKey: string;
  lines: {
    dataKey: string;
    name: string;
    stroke: string;
  }[];
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  xAxisDataKey, 
  lines,
  height = 300 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "#fff", 
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }} 
        />
        <Legend />
        {lines.map((line, index) => (
          <Line 
            key={index} 
            type="monotone" 
            dataKey={line.dataKey} 
            name={line.name}
            stroke={line.stroke} 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
