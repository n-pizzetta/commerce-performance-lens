
import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: any[];
  xAxisDataKey: string;
  bars: {
    dataKey: string;
    name: string;
    fill: string;
  }[];
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xAxisDataKey, 
  bars,
  height = 300 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-stroke, #f0f0f0)" />
        <XAxis dataKey={xAxisDataKey} stroke="var(--axis-stroke, #666666)" />
        <YAxis stroke="var(--axis-stroke, #666666)" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "var(--tooltip-bg, #fff)", 
            border: "1px solid var(--tooltip-border, #f0f0f0)",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            color: "var(--tooltip-text, #000)"
          }} 
        />
        <Legend />
        {bars.map((bar, index) => (
          <Bar 
            key={index} 
            dataKey={bar.dataKey} 
            name={bar.name} 
            fill={bar.fill} 
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
