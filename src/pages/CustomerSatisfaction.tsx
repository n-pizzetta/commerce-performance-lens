import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import FilterSection from '@/components/FilterSection';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ratingDistribution, productData, overallKpis, metaData } from '@/utils/mockData';
import { Star, Clock, ArrowDown } from 'lucide-react';

const CustomerSatisfaction: React.FC = () => {
  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  
  // Calculate total reviews for the bar chart
  const totalReviews = ratingDistribution.reduce((sum, item) => sum + item.count, 0);

  // State for filters
  const [filters, setFilters] = useState({
    category: 'all',
    region: 'all',
    period: 'all',
    rating: 'all'
  });

  // State for filtered data
  const [filteredData, setFilteredData] = useState({
    bestRated: productData.slice(0, 5),
    worstRated: productData.slice(0, 5),
    kpis: overallKpis
  });

  // Filter options for the FilterSection component
  const filterOptions = [
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...metaData.categories.map(cat => ({ 
          value: cat.toLowerCase(), 
          label: cat 
        }))
      ],
      value: filters.category,
      onChange: (value: string) => handleFilterChange('category', value)
    },
    {
      name: 'Région',
      options: [
        { value: 'all', label: 'Toutes les régions' },
        ...metaData.states.map(state => ({ 
          value: state.toLowerCase(), 
          label: state 
        }))
      ],
      value: filters.region,
      onChange: (value: string) => handleFilterChange('region', value)
    },
    {
      name: 'Période',
      options: [
        { value: 'all', label: 'Toute la période' },
        { value: 'this_month', label: 'Ce mois' },
        { value: 'last_month', label: 'Mois dernier' },
        { value: 'last_3_months', label: '3 derniers mois' }
      ],
      value: filters.period,
      onChange: (value: string) => handleFilterChange('period', value)
    },
    {
      name: 'Note client',
      options: [
        { value: 'all', label: 'Toutes les notes' },
        { value: '5', label: '5 étoiles' },
        { value: '4_plus', label: '4+ étoiles' },
        { value: 'below_3', label: 'Moins de 3 étoiles' }
      ],
      value: filters.rating,
      onChange: (value: string) => handleFilterChange('rating', value)
    }
  ];

  // Handler for filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Apply all filters and update data
  const applyFilters = (currentFilters: typeof filters) => {
    let filtered = [...productData];

    // Apply category filter
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === currentFilters.category.toLowerCase()
      );
    }

    // Apply region filter
    if (currentFilters.region !== 'all') {
      filtered = filtered.filter(item => 
        item.region.toLowerCase() === currentFilters.region.toLowerCase()
      );
    }

    // Apply rating filter
    if (currentFilters.rating !== 'all') {
      switch (currentFilters.rating) {
        case '5':
          filtered = filtered.filter(item => item.rating === 5);
          break;
        case '4_plus':
          filtered = filtered.filter(item => item.rating >= 4);
          break;
        case 'below_3':
          filtered = filtered.filter(item => item.rating < 3);
          break;
      }
    }

    // Calculate KPIs from filtered data
    const avgRating = filtered.length > 0
      ? filtered.reduce((sum, p) => sum + p.rating, 0) / filtered.length
      : 0;
    
    const avgDeliveryTime = filtered.length > 0
      ? filtered.reduce((sum, p) => sum + p.deliveryTime, 0) / filtered.length
      : 0;

    const lateDeliveries = filtered.filter(p => p.deliveryTime > p.estimatedDeliveryTime);
    const percentLate = filtered.length > 0
      ? (lateDeliveries.length / filtered.length) * 100
      : 0;

    const negativeReviews = filtered.filter(p => p.rating <= 2).length;

    // Update filtered data state
    setFilteredData({
      bestRated: [...filtered].sort((a, b) => b.rating - a.rating).slice(0, 5),
      worstRated: [...filtered].sort((a, b) => a.rating - b.rating).slice(0, 5),
      kpis: {
        ...overallKpis,
        averageDeliveryTime: avgDeliveryTime,
        percentLateDeliveries: percentLate,
        averageCustomerRating: avgRating,
        negativeReviews: negativeReviews
      }
    });
  };

  // Initial filter application
  useEffect(() => {
    applyFilters(filters);
  }, []);

  return (
    <DashboardLayout title="Satisfaction client & Livraison">
      {/* Filters */}
      <FilterSection filters={filterOptions} />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Délai moyen livraison"
          value={`${filteredData.kpis.averageDeliveryTime.toFixed(1)} jours`}
          trend={{ direction: 'down', value: '-0.3j vs last month' }}
          icon={<Clock size={18} />}
        />
        <KpiCard
          title="Livraisons en retard"
          value={`${filteredData.kpis.percentLateDeliveries.toFixed(1)}%`}
          trend={{ direction: 'down', value: '-2.1% vs last month' }}
        />
        <KpiCard
          title="Note moyenne"
          value={`${filteredData.kpis.averageCustomerRating.toFixed(1)}/5`}
          trend={{ direction: 'up', value: '+0.2 vs last month' }}
          icon={<Star size={18} />}
        />
        <KpiCard
          title="Avis négatifs"
          value={formatNumber(filteredData.kpis.negativeReviews)}
          trend={{ direction: 'down', value: '-5% vs last month' }}
          description="Notes ≤ 2"
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
                {filteredData.bestRated.map((product) => (
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
                {filteredData.worstRated.map((product) => (
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
