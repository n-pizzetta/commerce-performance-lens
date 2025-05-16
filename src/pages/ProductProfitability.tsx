import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import FilterSection from '@/components/FilterSection';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import HeatMap from '@/components/charts/HeatMap';
import CsvUploader from '@/components/CsvUploader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryData, productData, overallKpis, metaData } from '@/utils/mockData';
import { BarChart as BarChartIcon, ArrowRight, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProductProfitability: React.FC = () => {
  // Toast for notifications
  const { toast } = useToast();
  
  // State for filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maxWeightFilter, setMaxWeightFilter] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState('all');
  const [onTimeDeliveryFilter, setOnTimeDeliveryFilter] = useState('all');
  
  // State for data
  const [categories, setCategories] = useState(categoryData);
  const [products, setProducts] = useState(productData);
  const [filteredData, setFilteredData] = useState({
    categories: categoryData,
    products: productData,
    kpis: overallKpis
  });
  const [isUsingRealData, setIsUsingRealData] = useState(false);

  // Filter data based on current filters
  const filterData = (category: string, maxWeight: string, minRating: string, onTimeDelivery: string) => {
    let filteredProducts = [...productData];
    
    // Apply category filter
    if (category !== 'all') {
      filteredProducts = filteredProducts.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply weight/price filter
    if (maxWeight !== 'all') {
      filteredProducts = filteredProducts.filter(item => {
        switch(maxWeight) {
          case 'light': return item.weight < 1;
          case 'medium': return item.weight >= 1 && item.weight <= 3;
          case 'heavy': return item.weight > 3;
          default: return true;
        }
      });
    }

    // Apply rating filter
    if (minRating !== 'all') {
      const minRatingValue = parseInt(minRating);
      filteredProducts = filteredProducts.filter(item => item.rating >= minRatingValue);
    }

    // Apply delivery filter
    if (onTimeDelivery !== 'all') {
      filteredProducts = filteredProducts.filter(item => {
        const isOnTime = item.deliveryTime <= item.estimatedDeliveryTime;
        return onTimeDelivery === 'on_time' ? isOnTime : !isOnTime;
      });
    }

    // Calculate category metrics from filtered products
    const filteredCategories = [...categories].map(category => {
      const categoryProducts = filteredProducts.filter(p => p.category === category.name);
      if (categoryProducts.length === 0) return category;

      const totalRevenue = categoryProducts.reduce((sum, p) => sum + p.price, 0);
      const totalShippingCost = categoryProducts.reduce((sum, p) => sum + p.shippingCost, 0);
      const avgRating = categoryProducts.reduce((sum, p) => sum + p.rating, 0) / categoryProducts.length;
      const avgDeliveryTime = categoryProducts.reduce((sum, p) => sum + p.deliveryTime, 0) / categoryProducts.length;
      const profitRatio = categoryProducts.reduce((sum, p) => sum + (p.price - p.shippingCost) / p.weight, 0) / categoryProducts.length;

      return {
        ...category,
        revenue: totalRevenue,
        orders: categoryProducts.length,
        averagePrice: totalRevenue / categoryProducts.length,
        averageRating: avgRating,
        averageDeliveryTime: avgDeliveryTime,
        profitRatio
      };
    });

    // Calculate filtered KPIs
    const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.price, 0);
    const avgShippingCost = filteredProducts.reduce((sum, p) => sum + p.shippingCost, 0) / filteredProducts.length || 0;
    const avgRating = filteredProducts.reduce((sum, p) => sum + p.rating, 0) / filteredProducts.length || 0;
    const avgDeliveryTime = filteredProducts.reduce((sum, p) => sum + p.deliveryTime, 0) / filteredProducts.length || 0;
    const avgProfitRatio = filteredProducts.reduce((sum, p) => sum + (p.price - p.shippingCost) / p.weight, 0) / filteredProducts.length || 0;

    const filteredKpis = {
      ...overallKpis,
      totalOrders: filteredProducts.length,
      totalRevenue,
      averageProductPrice: totalRevenue / filteredProducts.length || 0,
      averageShippingCost: avgShippingCost,
      averageDeliveryTime: avgDeliveryTime,
      averageCustomerRating: avgRating,
      averageProfitRatio: avgProfitRatio,
      percentLateDeliveries: (filteredProducts.filter(p => p.deliveryTime > p.estimatedDeliveryTime).length / filteredProducts.length) * 100 || 0,
      negativeReviews: filteredProducts.filter(p => p.rating <= 2).length
    };

    // Update state with filtered data
    setFilteredData({
      categories: filteredCategories,
      products: filteredProducts,
      kpis: filteredKpis
    });
  };

  // Filter handlers with automatic application
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    filterData(value, maxWeightFilter, minRatingFilter, onTimeDeliveryFilter);
  };

  const handleMaxWeightFilter = (value: string) => {
    setMaxWeightFilter(value);
    filterData(categoryFilter, value, minRatingFilter, onTimeDeliveryFilter);
  };

  const handleMinRatingFilter = (value: string) => {
    setMinRatingFilter(value);
    filterData(categoryFilter, maxWeightFilter, value, onTimeDeliveryFilter);
  };

  const handleOnTimeDeliveryFilter = (value: string) => {
    setOnTimeDeliveryFilter(value);
    filterData(categoryFilter, maxWeightFilter, minRatingFilter, value);
  };

  // Handle CSV file load
  const handleCsvDataLoad = (fileName: string, data: any[]) => {
    try {
      // Here we would process and transform the data based on file name
      // For now, let's just show a success message
      console.log(`Loaded ${data.length} records from ${fileName}`);
      
      toast({
        title: "Données chargées",
        description: `${data.length} enregistrements chargés depuis ${fileName}`
      });
      
      // In a real implementation, we would update the state with transformed data
      // For demonstration purposes, we'll pretend we're using real data
      setIsUsingRealData(true);
      
      // This is where we would actually transform and set the data
      // For example: if it's a products file
      if (fileName.includes('products')) {
        // Process product data
        // setProducts(transformedProducts);
      }
      // Similarly for other file types
      
    } catch (error) {
      console.error("Error processing CSV data:", error);
      toast({
        title: "Erreur de traitement",
        description: "Une erreur s'est produite lors du traitement des données",
        variant: "destructive"
      });
    }
  };

  // Filter options from metaData
  const filterOptions = [
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...metaData.categories.map(category => ({ value: category.toLowerCase(), label: category }))
      ],
      value: categoryFilter,
      onChange: handleCategoryFilter
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
      onChange: handleMaxWeightFilter
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
      onChange: handleMinRatingFilter
    },
    {
      name: 'Livraison à temps',
      options: [
        { value: 'all', label: 'Toutes les livraisons' },
        { value: 'on_time', label: 'À temps' },
        { value: 'delayed', label: 'En retard' }
      ],
      value: onTimeDeliveryFilter,
      onChange: handleOnTimeDeliveryFilter
    }
  ];

  // Calculate average values for categories
  const categoryAverages = filteredData.categories.map(cat => ({
    name: cat.name,
    averagePrice: cat.averagePrice,
    shippingCost: cat.averagePrice * 0.1, // Mock data for shipping cost (10% of price)
    profitRatio: cat.profitRatio,
    rating: cat.averageRating
  }));

  // Prepare data for the heatmap
  const heatmapData = filteredData.categories.map(cat => ({
    name: cat.name,
    values: [
      { x: 'Rentabilité', y: cat.profitRatio },
      { x: 'Note', y: cat.averageRating }
    ]
  }));

  // Calculate profitability metrics for each product
  const productsWithProfitability = filteredData.products.map(product => {
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
          value={`${formatNumber(filteredData.kpis.averageProductPrice)} €`}
        />
        <KpiCard
          title="Frais de port moyen"
          value={`${formatNumber(filteredData.kpis.averageShippingCost)} €`}
        />
        <KpiCard
          title="Ratio rentabilité moyen"
          value={filteredData.kpis.averageProfitRatio.toFixed(2)}
          description="(Prix - Frais) / Poids"
        />
        <KpiCard
          title="Score client moyen"
          value={`${filteredData.kpis.averageCustomerRating.toFixed(1)}/5`}
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
              data={[...filteredData.categories].sort((a, b) => b.profitRatio - a.profitRatio)}
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
              data={filteredData.products}
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
