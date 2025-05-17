import React, { useMemo } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartProps {
  data: any[];
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  height?: number;
  title?: string;
  threshold?: number; // Seuil en pourcentage pour regrouper les petites valeurs
}

const PieChart: React.FC<PieChartProps> = ({ 
  data = [], 
  dataKey = "value", 
  nameKey = "name", 
  colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'],
  height = 300,
  title,
  threshold = 5 // Par défaut, regrouper les valeurs < 5%
}) => {
  // Guard against undefined or empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-lg bg-gray-50">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Traiter les données pour regrouper les petites valeurs
  const processedData = useMemo(() => {
    if (data.length <= 7) return data; // Ne pas regrouper si peu de données
    
    // Calculer le total
    const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
    
    // Séparer les données en deux groupes : principales et "Autres"
    const mainItems = [];
    let othersValue = 0;
    let othersCount = 0;
    
    // Trier les données par valeur décroissante
    const sortedData = [...data].sort((a, b) => b[dataKey] - a[dataKey]);
    
    for (const item of sortedData) {
      const percentage = (item[dataKey] / total) * 100;
      
      if (percentage >= threshold || mainItems.length < 6) { // Garder au max 6 segments principaux
        mainItems.push(item);
      } else {
        othersValue += item[dataKey];
        othersCount++;
      }
    }
    
    // Si nous avons des éléments à regrouper, ajouter la catégorie "Autres"
    if (othersCount > 0) {
      mainItems.push({
        [nameKey]: `Autres (${othersCount} régions)`,
        [dataKey]: othersValue
      });
    }
    
    return mainItems;
  }, [data, dataKey, nameKey, threshold]);

  // Couleurs personnalisées pour une meilleure distinction visuelle
  const customColors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#6366F1', // Violet
    '#0EA5E9', // Sky
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#8B5CF6', // Purple
    '#84CC16', // Lime
    '#06B6D4', // Cyan
    '#D946EF', // Fuchsia
    '#64748B'  // Slate (pour "Autres")
  ];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={90}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ name, percent }) => {
              // Afficher seulement le pourcentage pour les segments principaux
              if (name.includes('Autres')) {
                return `Autres: ${(percent * 100).toFixed(0)}%`;
              }
              return `${(percent * 100).toFixed(0)}%`;
            }}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={customColors[index % customColors.length]} 
                stroke="#fff"
                strokeWidth={1}
              />
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
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
