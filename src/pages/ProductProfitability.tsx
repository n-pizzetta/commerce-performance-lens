
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import FilterSection from '@/components/FilterSection';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import HeatMap from '@/components/charts/HeatMap';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryData, productData } from '@/utils/mockData';
import { BarChart as BarChartIcon, ArrowRight, Filter } from 'lucide-react';

const ProductProfitability: React.FC = () => {
  // State for filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maxWeightFilter, setMaxWeightFilter] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState('all');
  const [onTimeDeliveryFilter, setOnTimeDeliveryFilter] = useState('all');

  // Filter options
  const filterOptions = [
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...categoryData.map(category => ({ value: category.name.toLowerCase(), label: category.name }))
      ],
      value: categoryFilter,
      onChange: setCategoryFilter
    },
    {
      name: 'Poids max/Prix min',
      options: [
        { value: 'all', label: 'Tous les poids' },
        { value: 'light', label: 'Léger (< 1kg)' },
        { value: 'medium', label: 'Moyen (1-3kg)' },
        { value: 'heavy', label: 'Lourd (> 3kg)' }
      ],
      value: maxWeightFilter,
      onChange: setMaxWeightFilter
    },
    {
      name: 'Score minimum',
      options: [
        { value: 'all', label: 'Tous les scores' },
        { value: '5', label: '5 étoiles' },
        { value: '4', label: '4+ étoiles' },
        { value: '3', label: '3+ étoiles' }
      ],
      value: minRatingFilter,
      onChange: setMinRatingFilter
    },
    {
      name: 'Livraison à temps',
      options: [
        { value: 'all', label: 'Toutes les livraisons' },
        { value: 'on_time', label: 'À temps' },
        { value: 'delayed', label: 'En retard' }
      ],
      value: onTimeDeliveryFilter,
      onChange: setOnTimeDeliveryFilter
    }
  ];

  // Calculate average values for categories
  const categoryAverages = categoryData.map(cat => ({
    name: cat.name,
    averagePrice: cat.averagePrice,
    shippingCost: cat.averagePrice * 0.1, // Mock data for shipping cost (10% of price)
    profitRatio: cat.profitRatio,
    rating: cat.averageRating
  }));

  // Prepare data for the heatmap
  const heatmapData = categoryData.map(cat => ({
    name: cat.name,
    values: [
      { x: 'Rentabilité', y: cat.profitRatio },
      { x: 'Note', y: cat.averageRating }
    ]
  }));

  // Calculate profitability metrics for each product
  const productsWithProfitability = productData.map(product => {
    const profitRatio = (product.price - product.shippingCost) / product.weight;
    const isOnTime = product.deliveryTime <= product.estimatedDeliveryTime;
    
    return {
      ...product,
      profitRatio: profitRatio,
      isOnTime: isOnTime
    };
  });

  // Sort products by profitability
  const topProfitableProducts = [...productsWithProfitability]
    .sort((a, b) => b.profitRatio - a.profitRatio)
    .filter(p => p.rating >= 4) // Only include well-rated products
    .slice(0, 10);

  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  
  return (
    <DashboardLayout title="Rentabilité produit / catégorie">
      {/* Filters */}
      <FilterSection filters={filterOptions} />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Prix moyen par catégorie"
          value={`${formatNumber(Math.round(categoryAverages.reduce((sum, cat) => sum + cat.averagePrice, 0) / categoryAverages.length))} €`}
        />
        <KpiCard
          title="Frais de port moyen"
          value={`${formatNumber(Math.round(categoryAverages.reduce((sum, cat) => sum + cat.shippingCost, 0) / categoryAverages.length))} €`}
        />
        <KpiCard
          title="Ratio rentabilité moyen"
          value={`${(categoryAverages.reduce((sum, cat) => sum + cat.profitRatio, 0) / categoryAverages.length).toFixed(2)}`}
          description="(Prix - Frais) / Poids"
        />
        <KpiCard
          title="Score client moyen"
          value={`${(categoryAverages.reduce((sum, cat) => sum + cat.rating, 0) / categoryAverages.length).toFixed(1)}/5`}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Categories by Profitability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <BarChartIcon className="mr-2 text-dashboard-purple" size={18} />
                Catégories par rentabilité
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[...categoryData].sort((a, b) => b.profitRatio - a.profitRatio)}
              xAxisDataKey="name"
              bars={[
                { dataKey: "profitRatio", name: "Ratio de rentabilité", fill: "#8b5cf6" }
              ]}
            />
          </CardContent>
        </Card>
        
        {/* Scatter Plot: Price vs Shipping with Rating */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <ArrowRight className="mr-2 text-dashboard-purple" size={18} />
                Prix vs Frais de port & Score client
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScatterPlot
              data={productData}
              xAxisDataKey="price"
              yAxisDataKey="shippingCost"
              zAxisDataKey="rating"
              name="Produits"
              fill="#8b5cf6"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Heatmap & Product Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Heatmap: Category vs Profitability & Rating */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <Filter className="mr-2 text-dashboard-purple" size={18} />
                Catégorie vs Rentabilité & Note
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeatMap 
              data={heatmapData}
              xLabels={['Rentabilité', 'Note']}
              colorRange={{ min: '#e5deff', max: '#8b5cf6' }}
            />
          </CardContent>
        </Card>
        
        {/* Products Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Top produits rentables & bien notés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Rentabilité</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProfitableProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      {product.profitRatio.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-dashboard-green">{product.rating}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProductProfitability;
