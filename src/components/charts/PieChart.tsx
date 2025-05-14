
import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors: string[];
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  dataKey, 
  nameKey, 
  colors,
  height = 300 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => new Intl.NumberFormat('fr-FR').format(Number(value))}
          contentStyle={{ 
            backgroundColor: "#fff", 
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }} 
        />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;
