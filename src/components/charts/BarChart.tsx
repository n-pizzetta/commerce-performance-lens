import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: any[];
  xAxisDataKey: string;
  bars: {
    dataKey: string;
    name: string;
    fill?: string;
  }[];
  height?: number;
  formatTooltipValue?: (value: number, name: string) => string;
  showLegend?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  xAxisDataKey, 
  bars,
  height = 300,
  formatTooltipValue,
  showLegend = false
}) => {
  // Couleurs de La Bagunça
  const baguncaColors = ['#012169', '#009739', '#FEDD00'];
  
  // Fonction par défaut pour formatter les nombres avec des espaces comme séparateurs de milliers
  const defaultFormatter = (value: number, name: string) => {
    // Formatter toutes les valeurs numériques avec le format français
    return new Intl.NumberFormat('fr-FR', { 
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(value);
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
        padding: '2px 5px',
        fontSize: '13px',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        width: 'fit-content',
        display: 'inline-block',
        margin: 0
      }}>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} style={{ 
            display: 'flex',
            alignItems: 'center',
            margin: 0
          }}>
            <span style={{ 
              display: 'inline-block',
              width: '4px',
              height: '4px',
              marginRight: '3px',
              backgroundColor: entry.color,
              borderRadius: '50%'
            }}></span>
            <span style={{ color: '#666', fontSize: '14px', marginRight: '3px' }}>
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
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-stroke, #f0f0f0)" />
        <XAxis 
          dataKey={xAxisDataKey} 
          stroke="var(--axis-stroke, #666666)"
          angle={-45}
          textAnchor="end"
          interval={0}
          tick={{
            fontSize: 12,
            fontWeight: 500,
            dy: 10
          }}
          height={60}
        />
        <YAxis stroke="var(--axis-stroke, #666666)" tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 0 }).format(value)} />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar 
            key={index} 
            dataKey={bar.dataKey} 
            name={bar.name} 
            fill={bar.fill || baguncaColors[index % baguncaColors.length]} 
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
