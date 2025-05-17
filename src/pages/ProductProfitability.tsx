import React, { useMemo, useEffect, useCallback, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import FilterSection from '@/components/FilterSection';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardData } from '@/contexts/DataContext';
import { BarChart as BarChartIcon, ArrowRight, AlertCircle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import ErrorBanner from '@/components/ui/ErrorBanner';

// Nombre maximum d'options de filtres à afficher
const MAX_FILTER_OPTIONS = 50;

const ProductProfitability: React.FC = () => {
  // État local pour le filtre de produit
  const [productFilter, setProductFilter] = useState<string>('all');
  
  // Get data from context
  const {
    categories,
    enrichedProducts,
    kpis,
    meta,
    isLoading,
    error,
    filters,
    setFilters
  } = useDashboardData();
  
  // Fonction pour formater le nom d'une catégorie pour affichage
  const formatCategoryName = useCallback((name: string | undefined): string => {
    if (!name) return "Catégorie non spécifiée";
    
    // Convertir les underscores en espaces et mettre en majuscule les premières lettres
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);
  
  // Reset le filtre produit quand on change de catégorie ou de région
  useEffect(() => {
    setProductFilter('all');
  }, [filters.category, filters.state]);
  
  // Produits de base (non filtrés) pour calculer les options de filtres disponibles
  const baseProducts = useMemo(() => {
    if (!enrichedProducts || !Array.isArray(enrichedProducts)) return [];
    return [...enrichedProducts];
  }, [enrichedProducts]);
  
  // Obtenir les catégories disponibles en fonction de la région sélectionnée
  const availableCategories = useMemo(() => {
    if (!baseProducts || baseProducts.length === 0) return [];
    
    const uniqueCategories = new Set<string>();
    
    // Si un filtre de région est appliqué, ne prendre que les catégories pour cette région
    if (filters.state !== 'all') {
      for (let i = 0; i < baseProducts.length; i++) {
        const product = baseProducts[i];
        if (product && product.region && product.category && 
            product.region.toLowerCase() === filters.state.toLowerCase()) {
          uniqueCategories.add(product.category.toLowerCase());
        }
      }
    } else {
      // Sinon prendre toutes les catégories disponibles
      for (let i = 0; i < baseProducts.length; i++) {
        const product = baseProducts[i];
        if (product && product.category) {
          uniqueCategories.add(product.category.toLowerCase());
        }
      }
    }
    
    return Array.from(uniqueCategories).sort();
  }, [baseProducts, filters.state]);
  
  // Obtenir les régions disponibles en fonction de la catégorie sélectionnée
  const availableRegions = useMemo(() => {
    if (!baseProducts || baseProducts.length === 0) return [];
    
    const uniqueRegions = new Set<string>();
    const regionsToProcess = Math.min(baseProducts.length, 500);
    
    // Si un filtre de catégorie est appliqué, ne prendre que les régions pour cette catégorie
    if (filters.category !== 'all') {
      for (let i = 0; i < regionsToProcess; i++) {
        const product = baseProducts[i];
        if (product && product.region && product.category && 
            product.category.toLowerCase() === filters.category.toLowerCase()) {
          uniqueRegions.add(product.region.toLowerCase());
        }
        
        if (uniqueRegions.size >= MAX_FILTER_OPTIONS) break;
      }
    } else {
      // Sinon prendre toutes les régions disponibles
      for (let i = 0; i < regionsToProcess; i++) {
        const product = baseProducts[i];
        if (product && product.region) {
          uniqueRegions.add(product.region.toLowerCase());
        }
        
        if (uniqueRegions.size >= MAX_FILTER_OPTIONS) break;
      }
    }
    
    return Array.from(uniqueRegions).sort();
  }, [baseProducts, filters.category]);
  
  // Produits pré-filtrés par catégorie et région (pour le filtre produit)
  const productsFilteredByCategory = useMemo(() => {
    if (!baseProducts || baseProducts.length === 0) return [];
    
    let filtered = [...baseProducts];
    
    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => 
        item && (item.category || '').toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply region/state filter
    if (filters.state !== 'all') {
      filtered = filtered.filter(item => 
        item && (item.region || '').toLowerCase() === filters.state.toLowerCase()
      );
    }
    
    return filtered;
  }, [baseProducts, filters.category, filters.state]);

  // Liste des produits uniques pour le filtre - limitée à MAX_FILTER_OPTIONS
  const productOptions = useMemo(() => {
    if (!productsFilteredByCategory || productsFilteredByCategory.length === 0) return [];
    
    // Construire un Set pour éviter les doublons
    const uniqueProducts = new Set<string>();
    
    // N'examiner que les premiers produits pour éviter les performances excessives
    const productsToProcess = productsFilteredByCategory.slice(0, 300);
    
    productsToProcess.forEach(product => {
      if (product && product.name && uniqueProducts.size < MAX_FILTER_OPTIONS) {
        uniqueProducts.add(product.name);
      }
    });
    
    // Convertir en tableau et trier par ordre alphabétique
    return Array.from(uniqueProducts).sort();
  }, [productsFilteredByCategory]);
  
  // Vérifier si les filtres sélectionnés sont valides
  const isCategoryAvailable = useMemo(() => {
    if (filters.category === 'all') return true;
    return availableCategories.includes(filters.category);
  }, [filters.category, availableCategories]);
  
  const isRegionAvailable = useMemo(() => {
    if (filters.state === 'all') return true;
    return availableRegions.includes(filters.state);
  }, [filters.state, availableRegions]);
  
  // Réinitialiser les filtres si la sélection n'est plus valide
  useEffect(() => {
    if (filters.category !== 'all' && !isCategoryAvailable) {
      setFilters({ category: 'all' });
    }
  }, [isCategoryAvailable, filters.category, setFilters]);
  
  useEffect(() => {
    if (filters.state !== 'all' && !isRegionAvailable) {
      setFilters({ state: 'all' });
    }
  }, [isRegionAvailable, filters.state, setFilters]);

  // Filtered products based on all filters
  const filteredProducts = useMemo(() => {
    // Protection contre un tableau undefined ou null
    if (!productsFilteredByCategory || productsFilteredByCategory.length === 0) return [];
    
    // Limiter le nombre de produits traités pour améliorer les performances
    const productsToProcess = productsFilteredByCategory.length > 500 
      ? productsFilteredByCategory.slice(0, 500) 
      : productsFilteredByCategory;
    
    let filtered = [...productsToProcess];
    
    // Apply product filter (local)
    if (productFilter !== 'all') {
      filtered = filtered.filter(item => 
        item && item.name === productFilter
      );
    }

    // Filtrer les produits invalides (sans données numériques essentielles)
    return filtered.filter(product => 
      product && 
      typeof product.price === 'number' && !isNaN(product.price) &&
      typeof product.shippingCost === 'number' && !isNaN(product.shippingCost) &&
      typeof product.weight === 'number' && !isNaN(product.weight) && product.weight > 0
    );
  }, [productsFilteredByCategory, productFilter]);

  // Flag pour savoir s'il y a des produits après filtrage
  const hasProducts = useMemo(() => {
    return filteredProducts.length > 0;
  }, [filteredProducts]);

  // Calculate filtered categories metrics
  const filteredCategories = useMemo(() => {
    // Si pas de produits filtrés, retourner les catégories existantes
    if (!filteredProducts || filteredProducts.length === 0) return categories;
    
    // Group products by category and calculate metrics
    const categoryMap = new Map();
    
    filteredProducts.forEach(product => {
      const category = product.category || 'Non catégorisé';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          products: [],
          revenue: 0,
          orders: 0,
          shippingCost: 0,
          rating: 0,
          deliveryTime: 0
        });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.products.push(product);
      categoryData.revenue += product.price || 0;
      categoryData.orders += 1;
      categoryData.shippingCost += product.shippingCost || 0;
      categoryData.rating += typeof product.rating === 'number' ? product.rating : 0;
      categoryData.deliveryTime += typeof product.deliveryTime === 'number' ? product.deliveryTime : 0;
    });
    
    // Convert map to array of category objects
    const result = Array.from(categoryMap.entries()).map(([name, data], index) => {
      const count = data.products.length || 1; // Éviter division par zéro
      
      // Calculer le ratio de profit avec sécurité
      let profitRatio = 0;
      try {
        profitRatio = data.products.reduce((sum, p) => {
          if (typeof p.price !== 'number' || typeof p.shippingCost !== 'number' || typeof p.weight !== 'number' || p.weight <= 0) {
            return sum;
          }
          return sum + (p.price - p.shippingCost) / p.weight;
        }, 0) / count;
      } catch (e) {
        console.warn(`Erreur de calcul pour la catégorie ${name}:`, e);
      }
      
      return {
        id: index + 1,
        name: formatCategoryName(name),  // Formater le nom de catégorie pour l'affichage
        revenue: data.revenue,
        orders: count,
        averagePrice: data.revenue / count,
        averageRating: data.rating / count,
        averageDeliveryTime: data.deliveryTime / count,
        profitRatio: isNaN(profitRatio) ? 0 : profitRatio
      };
    });
    
    // If no filtered categories, return all categories
    return result.length > 0 ? result : categories;
  }, [filteredProducts, categories, formatCategoryName]);

  // Calculate KPIs from filtered products
  const filteredKpis = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return kpis;
    
    const productCount = filteredProducts.length || 1; // Eviter division par zéro
    
    // Calculer les métriques en sécurisant contre NaN
    let totalRevenue = 0;
    let avgShippingCost = 0;
    let avgRating = 0;
    let avgDeliveryTime = 0;
    let avgProfitRatio = 0;
    let percentLateDeliveries = 0;
    let negativeReviews = 0;
    
    try {
      // Total revenue
      totalRevenue = filteredProducts.reduce((sum, p) => 
        sum + (typeof p.price === 'number' ? p.price : 0), 0);
      
      // Shipping cost
      const totalShippingCost = filteredProducts.reduce((sum, p) => 
        sum + (typeof p.shippingCost === 'number' ? p.shippingCost : 0), 0);
      avgShippingCost = totalShippingCost / productCount;
      
      // Ratings
      const ratingProducts = filteredProducts.filter(p => typeof p.rating === 'number' && !isNaN(p.rating));
      avgRating = ratingProducts.length > 0 
        ? ratingProducts.reduce((sum, p) => sum + p.rating, 0) / ratingProducts.length 
        : kpis.averageCustomerRating;
      
      // Delivery time
      const deliveryProducts = filteredProducts.filter(p => typeof p.deliveryTime === 'number' && !isNaN(p.deliveryTime));
      avgDeliveryTime = deliveryProducts.length > 0 
        ? deliveryProducts.reduce((sum, p) => sum + p.deliveryTime, 0) / deliveryProducts.length 
        : kpis.averageDeliveryTime;
      
      // Profit ratio
      const validProducts = filteredProducts.filter(p => 
        typeof p.price === 'number' && !isNaN(p.price) &&
        typeof p.shippingCost === 'number' && !isNaN(p.shippingCost) &&
        typeof p.weight === 'number' && !isNaN(p.weight) && p.weight > 0
      );
      
      avgProfitRatio = validProducts.length > 0
        ? validProducts.reduce((sum, p) => sum + (p.price - p.shippingCost) / p.weight, 0) / validProducts.length
        : kpis.averageProfitRatio;
      
      // Late deliveries
      const lateDeliveries = filteredProducts.filter(p => 
        typeof p.deliveryTime === 'number' && !isNaN(p.deliveryTime) &&
        typeof p.estimatedDeliveryTime === 'number' && !isNaN(p.estimatedDeliveryTime) &&
        p.deliveryTime > p.estimatedDeliveryTime
      );
      percentLateDeliveries = (lateDeliveries.length / productCount) * 100;
      
      // Negative reviews
      negativeReviews = filteredProducts.filter(p => 
        typeof p.rating === 'number' && !isNaN(p.rating) && p.rating <= 2
      ).length;
    } catch (e) {
      console.error("Erreur dans le calcul des KPIs:", e);
    }
    
    return {
      ...kpis,
      totalOrders: filteredProducts.length,
      totalRevenue: isNaN(totalRevenue) ? kpis.totalRevenue : totalRevenue,
      averageProductPrice: isNaN(totalRevenue / productCount) ? kpis.averageProductPrice : totalRevenue / productCount,
      averageShippingCost: isNaN(avgShippingCost) ? kpis.averageShippingCost : avgShippingCost,
      averageDeliveryTime: isNaN(avgDeliveryTime) ? kpis.averageDeliveryTime : avgDeliveryTime,
      averageCustomerRating: isNaN(avgRating) ? kpis.averageCustomerRating : avgRating,
      averageProfitRatio: isNaN(avgProfitRatio) ? kpis.averageProfitRatio : avgProfitRatio,
      percentLateDeliveries: isNaN(percentLateDeliveries) ? 0 : percentLateDeliveries,
      negativeReviews: isNaN(negativeReviews) ? 0 : negativeReviews
    };
  }, [filteredProducts, kpis]);

  // Helper functions
  const formatNumber = (num: number) => {
    if (isNaN(num) || num === undefined) return "0";
    return new Intl.NumberFormat('fr-FR').format(num);
  };
  
  const formatCurrency = (num: number) => {
    if (isNaN(num) || num === undefined) return "0 €";
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(num);
  };
  
  const formatPercent = (num: number) => {
    if (isNaN(num) || num === undefined) return "0%";
    return `${num.toFixed(1)}%`;
  };

  // Filter options
  const filterOptions = [
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...meta.categories
          .filter(category => filters.state === 'all' || 
                  availableCategories.includes(category.toLowerCase()))
          .map(category => ({
            value: category.toLowerCase(),
            label: formatCategoryName(category)
          }))
      ],
      value: filters.category,
      onChange: (value: string) => setFilters({ category: value })
    },
    {
      name: 'Région',
      options: [
        { value: 'all', label: 'Toutes les régions' },
        ...meta.states
          .filter(state => filters.category === 'all' || 
                 availableRegions.includes(state.toLowerCase()))
          .map(state => ({ 
            value: state.toLowerCase(), 
            label: state 
          }))
      ],
      value: filters.state,
      onChange: (value: string) => setFilters({ state: value })
    },
    {
      name: 'Produit',
      options: [
        { value: 'all', label: 'Tous les produits' },
        ...productOptions.map(prod => ({ 
          value: prod, 
          label: prod 
        }))
      ],
      value: productFilter,
      onChange: (value: string) => setProductFilter(value)
    }
  ];

  // Message d'alerte quand aucun produit n'est disponible après filtrage
  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
      <AlertCircle size={48} className="text-orange-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Aucune donnée disponible</h3>
      <p className="text-muted-foreground max-w-md">
        Aucun produit ne correspond aux filtres sélectionnés. Veuillez modifier vos critères de filtrage.
      </p>
    </div>
  );

  if (isLoading)
    return (
      <DashboardLayout title="Profitabilité des produits">
        <Spinner />
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout title="Profitabilité des produits">
        <ErrorBanner error={error} />
      </DashboardLayout>
    );

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    setFilters({
      state: "all",
      category: "all"
    });
    setProductFilter("all");
  };

  return (
    <DashboardLayout title="Profitabilité des produits">
      {/* Filters */}
      <FilterSection filters={filterOptions} onReset={resetAllFilters} />
      
      {!hasProducts ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <NoDataMessage />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Prix moyen par catégorie"
              value={formatCurrency(filteredKpis.averagePricePerCategory)}
              icon={<BarChartIcon size={18} />}
            />
            <KpiCard
              title="Coût moyen d'expédition"
              value={formatCurrency(filteredKpis.averageShippingCost)}
            />
            <KpiCard
              title="Ratio de profit moyen"
              value={formatPercent(filteredKpis.averageProfitRatio * 100)}
              description="(Prix - Coût) / Poids"
            />
            <KpiCard
              title="Note moyenne"
              value={isNaN(filteredKpis.averageCustomerRating) ? "N/A" : filteredKpis.averageCustomerRating.toFixed(1)}
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category Performance */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Performance par catégorie</h3>
              <BarChart
                data={[...filteredCategories]
                  .filter(c => !isNaN(c.profitRatio))
                  .sort((a, b) => b.profitRatio - a.profitRatio)
                  .slice(0, 10)
                  .map(category => ({
                    ...category,
                    name: formatCategoryName(category.name),
                    profitRatio: parseFloat((category.profitRatio * 100).toFixed(1))
                  }))}
                xAxisDataKey="name"
                bars={[{ dataKey: "profitRatio", name: "Ratio de profit" }]}
                formatTooltipValue={(value, name) => {
                  if (name === "Ratio de profit") {
                    return `${value.toFixed(1)}%`;
                  }
                  return value.toString();
                }}
                showLegend={false}
              />
            </div>
            
            {/* Price vs Rating Scatter */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Prix vs Note client</h3>
              <ScatterPlot
                data={filteredProducts.filter(p => 
                  typeof p.price === 'number' && !isNaN(p.price) &&
                  typeof p.rating === 'number' && !isNaN(p.rating) &&
                  typeof p.shippingCost === 'number' && !isNaN(p.shippingCost)
                )}
                xAxisDataKey="price"
                yAxisDataKey="rating"
                zAxisDataKey="shippingCost"
                name="Produits"
              />
            </div>
          </div>
          
          {/* Top Products Table */}
          <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm mb-6">
            <h3 className="text-lg font-medium mb-4">Top 10 produits les plus rentables</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Coût expéd.</TableHead>
                  <TableHead className="text-right">Poids (kg)</TableHead>
                  <TableHead className="text-right">Ratio profit</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucune donnée disponible
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts
                    .filter(p => 
                      typeof p.price === 'number' && 
                      typeof p.shippingCost === 'number' && 
                      typeof p.weight === 'number' && p.weight > 0
                    )
                    .sort((a, b) => {
                      const ratioA = (a.price - a.shippingCost) / a.weight;
                      const ratioB = (b.price - b.shippingCost) / b.weight;
                      return ratioB - ratioA;
                    })
                    .slice(0, 10)
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name || "Sans nom"}</TableCell>
                        <TableCell>{formatCategoryName(product.category)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.shippingCost)}</TableCell>
                        <TableCell className="text-right">{(product.weight / 1000).toFixed(1)}</TableCell>
                        <TableCell className="text-right">
                          {formatPercent(((product.price - product.shippingCost) / product.weight) * 100)}
                        </TableCell>
                        <TableCell className="text-right">
                          {typeof product.rating === 'number' ? product.rating.toFixed(1) : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ProductProfitability;
