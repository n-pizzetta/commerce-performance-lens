
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import FilterSection from '@/components/FilterSection';
import CsvUploader, { FileType } from '@/components/CsvUploader';
import { categoryData, regionData, monthlyData, overallKpis } from '@/utils/mockData';
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
  
  // Filter options for the filter section
  const filterOptions = [
    {
      name: 'Année',
      options: [
        { value: 'all', label: 'Toutes les années' },
        { value: '2022', label: '2022' },
        { value: '2021', label: '2021' },
        { value: '2020', label: '2020' }
      ],
      value: yearFilter,
      onChange: setYearFilter
    },
    {
      name: 'Région',
      options: [
        { value: 'all', label: 'Toutes les régions' },
        ...regions.map(region => ({ value: region.name.toLowerCase(), label: region.name }))
      ],
      value: regionFilter,
      onChange: setRegionFilter
    },
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...categories.map(category => ({ value: category.name.toLowerCase(), label: category.name }))
      ],
      value: categoryFilter,
      onChange: setCategoryFilter
    }
  ];

  // Format numbers for display
  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

  return (
    <DashboardLayout title="Vue globale du business">
      {/* CSV Upload Button */}
      <div className="flex justify-end mb-4">
        <CsvUploader onFileLoad={handleCsvDataLoad} />
      </div>
      
      {/* Data Upload Status */}
      {isUsingRealData && (
        <div className="mb-6">
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>
              <div className="font-medium">Fichiers chargés :</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
                {Object.entries(uploadCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="capitalize">{type.replace('_', ' ')}: </span>
                    <span className="font-medium">{count}</span> enregistrements
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
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
        <BarChart 
          title="Top 10 Catégories par Chiffre d'Affaires"
          data={[...categories].sort((a, b) => b.revenue - a.revenue).slice(0, 10)}
          xAxisDataKey="name"
          bars={[
            { dataKey: "revenue", name: "Chiffre d'affaires", fill: "#8b5cf6" }
          ]}
        />
        <PieChart 
          title="Répartition des Ventes par Région"
          data={regions.map(region => ({
            name: region.name,
            value: region.revenue
          }))}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <LineChart 
          title="Évolution Mensuelle des Commandes"
          data={monthly}
          xAxisDataKey="month"
          lines={[
            { dataKey: "orders", name: "Commandes", stroke: "#8b5cf6" },
            { dataKey: "revenue", name: "Chiffre d'affaires", stroke: "#0ea5e9", yAxisId: "right" }
          ]}
        />
      </div>
    </DashboardLayout>
  );
};

export default BusinessOverview;
