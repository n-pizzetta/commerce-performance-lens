
import React from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';

interface ScatterPlotProps {
  data: any[];
  xAxisDataKey: string;
  yAxisDataKey: string;
  zAxisDataKey?: string;
  name: string;
  fill: string;
  height?: number;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ 
  data, 
  xAxisDataKey, 
  yAxisDataKey,
  zAxisDataKey,
  name,
  fill,
  height = 350 
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xAxisDataKey} 
          name={xAxisDataKey} 
          type="number"
        />
        <YAxis 
          dataKey={yAxisDataKey} 
          name={yAxisDataKey} 
          type="number"
        />
        {zAxisDataKey && (
          <ZAxis 
            dataKey={zAxisDataKey} 
            range={[50, 400]} 
            name={zAxisDataKey} 
          />
        )}
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ 
            backgroundColor: "#fff", 
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
          }} 
        />
        <Legend />
        <Scatter 
          name={name} 
          data={data} 
          fill={fill}
        />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlot;
