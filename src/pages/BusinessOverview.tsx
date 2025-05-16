import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import FilterSection from '@/components/FilterSection';
import CsvUploader, { FileType } from '@/components/CsvUploader';
import { categoryData, regionData, monthlyData, overallKpis, metaData } from '@/utils/mockData';
import { ShoppingCart, DollarSign, Clock, Star } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { generateDashboardData } from '@/services/csvDataService';

// This can be moved to a context or state management solution in a more complex app
interface UploadedDataState {
  customers: any[];
  geolocation: any[];
  orderItems: any[];
  orderPayments: any[];
  orderReviews: any[];
  orders: any[];
  products: any[];
  sellers: any[];
  categoryTranslation: any[];
}

const BusinessOverview: React.FC = () => {
  const { toast } = useToast();
  
  // State for filters
  const [yearFilter, setYearFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // State for data
  const [categories, setCategories] = useState(categoryData);
  const [regions, setRegions] = useState(regionData);
  const [monthly, setMonthly] = useState(monthlyData);
  const [kpis, setKpis] = useState(overallKpis);
  
  // Track which data has been uploaded
  const [uploadedData, setUploadedData] = useState<UploadedDataState>({
    customers: [],
    geolocation: [],
    orderItems: [],
    orderPayments: [],
    orderReviews: [],
    orders: [],
    products: [],
    sellers: [],
    categoryTranslation: []
  });
  
  const [uploadCounts, setUploadCounts] = useState<Record<string, number>>({});
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  
  // Handle CSV file load
  const handleCsvDataLoad = (fileType: FileType, data: any[]) => {
    // Update the uploaded data state
    setUploadedData(prev => ({
      ...prev,
      [fileType]: data
    }));
    
    // Track upload counts
    setUploadCounts(prev => ({
      ...prev,
      [fileType]: data.length
    }));
    
    // Set flag to indicate real data is being used
    setIsUsingRealData(true);
    
    // If we have enough data, we can generate dashboard data
    const hasEnoughData = checkIfEnoughDataForDashboard({
      ...uploadedData,
      [fileType]: data
    });
    
    if (hasEnoughData) {
      try {
        const dashboardData = generateDashboardData(
          uploadedData.products.length > 0 ? uploadedData.products : data.length > 0 && fileType === 'products' ? data : [],
          uploadedData.orderItems.length > 0 ? uploadedData.orderItems : data.length > 0 && fileType === 'order_items' ? data : [],
          uploadedData.orders.length > 0 ? uploadedData.orders : data.length > 0 && fileType === 'orders' ? data : [],
          uploadedData.orderReviews.length > 0 ? uploadedData.orderReviews : data.length > 0 && fileType === 'order_reviews' ? data : []
        );
        
        // Update the dashboard data
        setCategories(dashboardData.categories);
        setRegions(dashboardData.regions);
        setMonthly(dashboardData.monthlyData);
        
        // Calculate new KPIs
        if (dashboardData.categories.length > 0) {
          const totalOrders = dashboardData.categories.reduce((sum, cat) => sum + cat.orders, 0);
          const totalRevenue = dashboardData.categories.reduce((sum, cat) => sum + cat.revenue, 0);
          const avgRating = dashboardData.categories.reduce((sum, cat) => sum + cat.averageRating * cat.orders, 0) / totalOrders;
          const avgDelivery = dashboardData.categories.reduce((sum, cat) => sum + cat.averageDeliveryTime * cat.orders, 0) / totalOrders;
          
          setKpis({
            totalOrders,
            totalRevenue,
            averageProductPrice: totalRevenue / totalOrders,
            averageDeliveryTime: avgDelivery,
            averageCustomerRating: avgRating,
            percentLateDeliveries: 0, // Need to calculate from data
            returnsCount: 0 // Need to calculate from data
          });
        }
        
        toast({
          title: "Dashboard mis à jour",
          description: "Les graphiques ont été mis à jour avec vos données"
        });
      } catch (error) {
        console.error("Error generating dashboard data:", error);
      }
    }
  };

  // Check if we have enough data to generate the dashboard
  const checkIfEnoughDataForDashboard = (data: UploadedDataState): boolean => {
    // At minimum we need products, order items, and orders
    return (
      data.products.length > 0 &&
      data.orderItems.length > 0 &&
      data.orders.length > 0
    );
  };
  
  // Filter data based on current filters
  const filterData = (year: string, region: string, category: string) => {
    // Filter monthly data by year
    const filteredMonthly = monthlyData.filter(item => {
      if (year === 'all') return true;
      return item.month.startsWith(year);
    });

    // Filter regions
    const filteredRegions = regionData.filter(item => {
      if (region === 'all') return true;
      return item.name.toLowerCase() === region.toLowerCase();
    });

    // Filter categories
    const filteredCategories = categoryData.filter(item => {
      if (category === 'all') return true;
      return item.name.toLowerCase() === category.toLowerCase();
    });

    // Update state with filtered data
    setMonthly(filteredMonthly);
    setRegions(filteredRegions);
    setCategories(filteredCategories);

    // Update KPIs based on filtered data
    if (category !== 'all' || region !== 'all' || year !== 'all') {
      const filteredKpis = {
        ...overallKpis,
        totalOrders: filteredCategories.reduce((sum, cat) => sum + cat.orders, 0),
        totalRevenue: filteredCategories.reduce((sum, cat) => sum + cat.revenue, 0),
        averageProductPrice: filteredCategories.reduce((sum, cat) => sum + cat.averagePrice, 0) / filteredCategories.length,
        averageCustomerRating: filteredCategories.reduce((sum, cat) => sum + cat.averageRating, 0) / filteredCategories.length,
      };
      setKpis(filteredKpis);
    } else {
      setKpis(overallKpis);
    }
  };

  // Update filters and filter data
  const handleYearFilter = (value: string) => {
    setYearFilter(value);
    filterData(value, regionFilter, categoryFilter);
  };

  const handleRegionFilter = (value: string) => {
    setRegionFilter(value);
    filterData(yearFilter, value, categoryFilter);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    filterData(yearFilter, regionFilter, value);
  };

  // Filter options for the filter section from metaData
  const filterOptions = [
    {
      name: 'Année',
      options: [
        { value: 'all', label: 'Toutes les années' },
        ...metaData.years.map(year => ({ value: year.toString(), label: year.toString() }))
      ],
      value: yearFilter,
      onChange: handleYearFilter
    },
    {
      name: 'Région',
      options: [
        { value: 'all', label: 'Toutes les régions' },
        ...metaData.states.map(state => ({ value: state.toLowerCase(), label: state }))
      ],
      value: regionFilter,
      onChange: handleRegionFilter
    },
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...metaData.categories.map(category => ({ value: category.toLowerCase(), label: category }))
      ],
      value: categoryFilter,
      onChange: handleCategoryFilter
    }
  ];

  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

  return (
    <DashboardLayout title="Vue globale du business">
      {/* Filters */}
      <FilterSection filters={filterOptions} />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Nombre total de commandes"
          value={formatNumber(kpis.totalOrders)}
          icon={<ShoppingCart size={20} />}
        />
        <KpiCard 
          title="Chiffre d'affaires total"
          value={`${formatNumber(kpis.totalRevenue)} €`}
          icon={<DollarSign size={20} />}
        />
        <KpiCard 
          title="Délai moyen de livraison"
          value={`${kpis.averageDeliveryTime.toFixed(1)} jours`}
          icon={<Clock size={20} />}
        />
        <KpiCard 
          title="Note client moyenne"
          value={`${kpis.averageCustomerRating.toFixed(1)}/5`}
          icon={<Star size={20} />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Top 10 Catégories par Chiffre d'Affaires</h3>
          <BarChart 
            data={[...categories].sort((a, b) => b.revenue - a.revenue).slice(0, 10)}
            xAxisDataKey="name"
            bars={[
              { dataKey: "revenue", name: "Chiffre d'affaires", fill: "#8b5cf6" }
            ]}
          />
        </div>
        
        <PieChart 
          title="Répartition des Ventes par Région"
          data={regions.map(region => ({
            name: region.name,
            value: region.revenue
          }))}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Évolution Mensuelle des Commandes</h3>
          <LineChart 
            data={monthly}
            xAxisDataKey="month"
            lines={[
              { dataKey: "orders", name: "Commandes", stroke: "#8b5cf6" },
              { dataKey: "revenue", name: "Chiffre d'affaires", stroke: "#0ea5e9" }
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessOverview;
