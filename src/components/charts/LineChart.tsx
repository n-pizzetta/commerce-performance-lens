import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: any[];
  xAxisDataKey: string;
  lines: {
    dataKey: string;
    name: string;
    stroke?: string;
  }[];
  height?: number;
  formatTooltipValue?: (value: number, name: string) => string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  xAxisDataKey, 
  lines,
  height = 300,
  formatTooltipValue
}) => {
  // Couleurs de La Bagunça
  const baguncaColors = ['#012169', '#009739', '#FEDD00'];
  
  // Fonction par défaut pour formatter les nombres avec des espaces comme séparateurs de milliers
  const defaultFormatter = (value: number, name: string) => {
    if (name === "CA") {
      return new Intl.NumberFormat('fr-FR', { 
        maximumFractionDigits: 0,
        useGrouping: true
      }).format(value);
    }
    return value.toString();
  };

  // Utiliser le formatter personnalisé ou le formatter par défaut
  const formatter = formatTooltipValue || defaultFormatter;

  // Style personnalisé pour le contenu du tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
        padding: '2px 6px',
        fontSize: '13px',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        width: 'auto',
        display: 'inline-block'
      }}>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} style={{ 
            display: 'flex',
            alignItems: 'center',
            margin: '2px 0'
          }}>
            <span style={{ 
              display: 'inline-block',
              width: '4px',
              height: '4px',
              marginRight: '4px',
              backgroundColor: entry.color,
              borderRadius: '50%'
            }}></span>
            <span style={{ color: '#666', fontSize: '14px', marginRight: '4px' }}>
              {entry.name}:
            </span>
            <span style={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
              {formatter(entry.value, entry.name)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {lines.map((line, index) => (
          <Line 
            key={index} 
            type="monotone" 
            dataKey={line.dataKey} 
            name={line.name}
            stroke={line.stroke || baguncaColors[index % baguncaColors.length]} 
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
