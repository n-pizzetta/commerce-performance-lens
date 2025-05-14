
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import FilterSection from '@/components/FilterSection';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ratingDistribution, productData, overallKpis, categoryData } from '@/utils/mockData';
import { Star, Clock, ArrowDown } from 'lucide-react';

const CustomerSatisfaction: React.FC = () => {
  // State for filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

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
      name: 'Région',
      options: [
        { value: 'all', label: 'Toutes les régions' },
        ...productData.map(product => product.region)
          .filter((value, index, self) => self.indexOf(value) === index)
          .map(region => ({ value: region.toLowerCase(), label: region }))
      ],
      value: regionFilter,
      onChange: setRegionFilter
    },
    {
      name: 'Période',
      options: [
        { value: 'all', label: 'Toute la période' },
        { value: 'this_month', label: 'Ce mois' },
        { value: 'last_month', label: 'Mois dernier' },
        { value: 'last_3_months', label: '3 derniers mois' },
      ],
      value: periodFilter,
      onChange: setPeriodFilter
    },
    {
      name: 'Note client',
      options: [
        { value: 'all', label: 'Toutes les notes' },
        { value: '5', label: '5 étoiles' },
        { value: '4_plus', label: '4+ étoiles' },
        { value: 'below_3', label: 'Moins de 3 étoiles' },
      ],
      value: ratingFilter,
      onChange: setRatingFilter
    }
  ];

  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  
  // Calculate total reviews
  const totalReviews = ratingDistribution.reduce((sum, item) => sum + item.count, 0);
  
  // Get best and worst rated products
  const bestRatedProducts = [...productData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
    
  const worstRatedProducts = [...productData]
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 5);
  
  return (
    <DashboardLayout title="Satisfaction client & Livraison">
      {/* Filters */}
      <FilterSection filters={filterOptions} />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Délai moyen livraison"
          value={`${overallKpis.averageDeliveryTime} jours`}
          trend={{ direction: 'down', value: '-0.3j vs last month' }}
          icon={<Clock size={18} />}
        />
        <KpiCard
          title="Livraisons en retard"
          value={`${overallKpis.percentLateDeliveries}%`}
          trend={{ direction: 'down', value: '-2.1% vs last month' }}
        />
        <KpiCard
          title="Note moyenne"
          value={`${overallKpis.averageCustomerRating}/5`}
          trend={{ direction: 'up', value: '+0.2 vs last month' }}
          icon={<Star size={18} />}
        />
        <KpiCard
          title="Retours/Avis négatifs"
          value={formatNumber(overallKpis.returnsCount)}
          trend={{ direction: 'down', value: '-5% vs last month' }}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Ratings Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <Star className="mr-2 text-dashboard-purple" size={18} />
                Distribution des scores clients
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={ratingDistribution.map(item => ({
                rating: `${item.rating} étoile${item.rating > 1 ? 's' : ''}`,
                count: item.count,
                percentage: (item.count / totalReviews * 100).toFixed(1)
              }))}
              xAxisDataKey="rating"
              bars={[
                { dataKey: "count", name: "Nombre d'avis", fill: "#8b5cf6" }
              ]}
            />
          </CardContent>
        </Card>
        
        {/* Delivery vs Rating Scatter Plot */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <Clock className="mr-2 text-dashboard-purple" size={18} />
                Délai de livraison vs Note client
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScatterPlot
              data={productData}
              xAxisDataKey="deliveryTime"
              yAxisDataKey="rating"
              zAxisDataKey="price"
              name="Produits"
              fill="#8b5cf6"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Best and Worst Rated Products Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Rated Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <Star className="mr-2 text-dashboard-green" size={18} />
                Top 5 produits les mieux notés
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                  <TableHead className="text-right">Délai (j)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestRatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-dashboard-green">{product.rating}</span>
                    </TableCell>
                    <TableCell className="text-right">{product.deliveryTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Worst Rated Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <ArrowDown className="mr-2 text-dashboard-red" size={18} />
                Top 5 produits les plus mal notés
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                  <TableHead className="text-right">Délai (j)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {worstRatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-dashboard-red">{product.rating}</span>
                    </TableCell>
                    <TableCell className="text-right">{product.deliveryTime}</TableCell>
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

export default CustomerSatisfaction;
