
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import FilterSection from '@/components/FilterSection';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryData, regionData, monthlyData, overallKpis } from '@/utils/mockData';
import { ChartBar, MapPin, ArrowRight } from 'lucide-react';

const BusinessOverview: React.FC = () => {
  // State for filters
  const [yearFilter, setYearFilter] = useState('2023');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter options
  const filterOptions = [
    {
      name: 'Année',
      options: [
        { value: '2023', label: '2023' },
        { value: '2022', label: '2022' },
        { value: '2021', label: '2021' },
      ],
      value: yearFilter,
      onChange: setYearFilter
    },
    {
      name: 'Région',
      options: [
        { value: 'all', label: 'Toutes les régions' },
        ...regionData.map(region => ({ value: region.name.toLowerCase(), label: region.name }))
      ],
      value: regionFilter,
      onChange: setRegionFilter
    },
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...categoryData.map(category => ({ value: category.name.toLowerCase(), label: category.name }))
      ],
      value: categoryFilter,
      onChange: setCategoryFilter
    }
  ];

  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  
  return (
    <DashboardLayout title="Vue globale du business">
      {/* Filters */}
      <FilterSection filters={filterOptions} />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          title="Nombre de commandes"
          value={formatNumber(overallKpis.totalOrders)}
          trend={{ direction: 'up', value: '+12% vs last month' }}
        />
        <KpiCard
          title="Chiffre d'affaires"
          value={`${formatNumber(overallKpis.totalRevenue / 1000)} K€`}
          trend={{ direction: 'up', value: '+8% vs last month' }}
        />
        <KpiCard
          title="Prix moyen"
          value={`${formatNumber(overallKpis.averageProductPrice)} €`}
          trend={{ direction: 'neutral', value: '+1% vs last month' }}
        />
        <KpiCard
          title="Délai moyen livraison"
          value={`${overallKpis.averageDeliveryTime} jours`}
          trend={{ direction: 'down', value: '-0.3j vs last month' }}
        />
        <KpiCard
          title="Note client moyenne"
          value={`${overallKpis.averageCustomerRating}/5`}
          trend={{ direction: 'up', value: '+0.2 vs last month' }}
        />
      </div>
      
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Categories Chart */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                <div className="flex items-center">
                  <ChartBar className="mr-2 text-dashboard-purple" size={18} />
                  Top 10 catégories par CA
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart
              data={categoryData.slice(0, 10)}
              xAxisDataKey="name"
              bars={[
                { dataKey: "revenue", name: "Chiffre d'affaires (€)", fill: "#8b5cf6" }
              ]}
            />
          </CardContent>
        </Card>
        
        {/* Region Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                <div className="flex items-center">
                  <MapPin className="mr-2 text-dashboard-purple" size={18} />
                  Répartition des ventes par région
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <PieChart
              data={regionData.slice(0, 6)}
              dataKey="revenue"
              nameKey="name"
              colors={['#8b5cf6', '#4a72ff', '#3b82f6', '#06b6d4', '#10b981', '#6366f1']}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Trend Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              <div className="flex items-center">
                <ArrowRight className="mr-2 text-dashboard-purple" size={18} />
                Évolution mensuelle des commandes
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <LineChart
            data={monthlyData}
            xAxisDataKey="month"
            lines={[
              { dataKey: "orders", name: "Nombre de commandes", stroke: "#8b5cf6" },
              { dataKey: "revenue", name: "Chiffre d'affaires (€)", stroke: "#4a72ff" }
            ]}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default BusinessOverview;
