
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HeatMapProps {
  data: {
    name: string;
    values: {
      x: string;
      y: number;
    }[];
  }[];
  xLabels: string[];
  title?: string;
  colorRange?: {
    min: string;
    max: string;
  };
}

const HeatMap: React.FC<HeatMapProps> = ({ 
  data, 
  xLabels,
  title,
  colorRange = { min: '#e5f5ff', max: '#0084ff' }
}) => {
  const getColorIntensity = (value: number, minVal: number, maxVal: number) => {
    const percentage = (value - minVal) / (maxVal - minVal);
    return percentage;
  };

  // Find min and max values in the data
  let minVal = Infinity;
  let maxVal = -Infinity;
  
  data.forEach(row => {
    row.values.forEach(cell => {
      if (cell.y < minVal) minVal = cell.y;
      if (cell.y > maxVal) maxVal = cell.y;
    });
  });

  // Generate a color based on the value's position within the range
  const getBackgroundColor = (value: number) => {
    const percentage = getColorIntensity(value, minVal, maxVal);
    
    // Convert the color range to RGB for interpolation
    const minRGB = hexToRgb(colorRange.min);
    const maxRGB = hexToRgb(colorRange.max);
    
    if (!minRGB || !maxRGB) return colorRange.min;

    const r = Math.round(minRGB.r + percentage * (maxRGB.r - minRGB.r));
    const g = Math.round(minRGB.g + percentage * (maxRGB.g - minRGB.g));
    const b = Math.round(minRGB.b + percentage * (maxRGB.b - minRGB.b));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="p-2 text-left"></th>
                {xLabels.map((label, index) => (
                  <th key={index} className="p-2 text-sm font-medium text-center">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-2 text-sm font-medium whitespace-nowrap">
                    {row.name}
                  </td>
                  {xLabels.map((label, colIndex) => {
                    const cell = row.values.find(v => v.x === label);
                    const value = cell ? cell.y : 0;
                    return (
                      <td 
                        key={colIndex} 
                        className="p-2 text-center text-xs"
                        style={{ 
                          backgroundColor: getBackgroundColor(value),
                          color: getColorIntensity(value, minVal, maxVal) > 0.7 ? '#fff' : '#000',
                          borderRadius: '4px',
                          width: '60px',
                          height: '60px'
                        }}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatMap;
