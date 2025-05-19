import React, { useState, useMemo, useCallback, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/KpiCard';
import FilterSection from '@/components/FilterSection';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Clock, AlertCircle, ThumbsDown, MapPinX } from 'lucide-react';
import { useDashboardData } from '@/contexts/DataContext';
import Spinner from '@/components/ui/Spinner';
import ErrorBanner from '@/components/ui/ErrorBanner';

// Nombre maximum de produits à afficher dans le filtre pour éviter les performances excessives
const MAX_PRODUCT_OPTIONS = 50;
// Nombre maximum de régions à afficher dans le filtre
const MAX_REGION_OPTIONS = 50;

const CustomerSatisfaction: React.FC = () => {
  // État local pour le filtre de produit
  const [productFilter, setProductFilter] = useState<string>('all');
  
  // Format numbers for display - converti en fonction memoizée
  const formatNumber = useCallback((num: number) => {
    if (isNaN(num) || num === undefined) return "0";
    return new Intl.NumberFormat('fr-FR').format(num);
  }, []);
  
  // Fonction pour formater le nom d'une catégorie pour affichage - memoizée pour éviter les recalculs
  const formatCategoryName = useCallback((name: string | undefined): string => {
    if (!name) return "Catégorie non spécifiée";
    
    // Convertir les underscores en espaces et mettre en majuscule les premières lettres
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);
  
  // Get data from context
  const {
    enrichedProducts,
    ratingDistribution,
    kpis,
    meta,
    isLoading,
    error,
    filters,
    setFilters
  } = useDashboardData();

  // Reset le filtre produit quand on change de catégorie
  useEffect(() => {
    setProductFilter('all');
  }, [filters.category]);

  // Calculate total reviews for the bar chart
  const totalReviews = useMemo(() => 
    ratingDistribution.reduce((sum, item) => sum + (item.count || 0), 0) || 1, // Éviter division par zéro
    [ratingDistribution]
  );

  // Produits filtrés par région et catégorie (base pour les autres filtres)
  const baseFilteredProducts = useMemo(() => {
    if (!enrichedProducts || !Array.isArray(enrichedProducts)) return [];
    
    return [...enrichedProducts];
  }, [enrichedProducts]);

  // Obtenir les catégories disponibles en fonction de la région sélectionnée
  const availableCategories = useMemo(() => {
    if (!baseFilteredProducts || baseFilteredProducts.length === 0) return [];
    
    const uniqueCategories = new Set<string>();
    
    // Si un filtre de région est appliqué, ne prendre que les catégories pour cette région
    if (filters.state !== 'all') {
      for (let i = 0; i < baseFilteredProducts.length; i++) {
        const product = baseFilteredProducts[i];
        if (product && product.region && product.category && 
            product.region.toLowerCase() === filters.state.toLowerCase()) {
          uniqueCategories.add(product.category.trim().toLowerCase());
        }
      }
    } else {
      // Sinon prendre toutes les catégories disponibles
      for (let i = 0; i < baseFilteredProducts.length; i++) {
        const product = baseFilteredProducts[i];
        if (product && product.category) {
          uniqueCategories.add(product.category.trim().toLowerCase());
        }
      }
    }
    
    return Array.from(uniqueCategories);
  }, [baseFilteredProducts, filters.state]);

  // Obtenir les régions disponibles en fonction de la catégorie sélectionnée
  const availableRegions = useMemo(() => {
    if (!baseFilteredProducts || baseFilteredProducts.length === 0) return [];
    
    const uniqueRegions = new Set<string>();
    const regionsToProcess = Math.min(baseFilteredProducts.length, 500);
    
    // Si un filtre de catégorie est appliqué, ne prendre que les régions pour cette catégorie
    if (filters.category !== 'all') {
      for (let i = 0; i < regionsToProcess; i++) {
        const product = baseFilteredProducts[i];
        if (product && product.region && product.category && 
            product.category.trim().toLowerCase() === filters.category.trim().toLowerCase()) {
          uniqueRegions.add(product.region.toLowerCase());
        }
        
        if (uniqueRegions.size >= MAX_REGION_OPTIONS) break;
      }
    } else {
      // Sinon prendre toutes les régions disponibles
      for (let i = 0; i < regionsToProcess; i++) {
        const product = baseFilteredProducts[i];
        if (product && product.region) {
          uniqueRegions.add(product.region.toLowerCase());
        }
        
        if (uniqueRegions.size >= MAX_REGION_OPTIONS) break;
      }
    }
    
    return Array.from(uniqueRegions).sort();
  }, [baseFilteredProducts, filters.category]);

  // Produits pré-filtrés par catégorie et région (pour le filtre produit)
  const productsFilteredByCategory = useMemo(() => {
    if (!baseFilteredProducts || baseFilteredProducts.length === 0) return [];
    
    let filtered = [...baseFilteredProducts];
    
    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => 
        item && (item.category || '').trim().toLowerCase() === filters.category.trim().toLowerCase()
      );
    }

    // Apply region/state filter
    if (filters.state !== 'all') {
      filtered = filtered.filter(item => 
        item && (item.region || '').toLowerCase() === filters.state.toLowerCase()
      );
    }
    
    return filtered;
  }, [baseFilteredProducts, filters.category, filters.state]);

  // Liste des produits uniques pour le filtre - limitée à MAX_PRODUCT_OPTIONS et filtrée par catégorie
  const productOptions = useMemo(() => {
    if (!productsFilteredByCategory || productsFilteredByCategory.length === 0) return [];
    
    // Construire un Set pour éviter les doublons
    const uniqueProducts = new Set<string>();
    
    // N'examiner que les premiers produits pour éviter les performances excessives
    const productsToProcess = productsFilteredByCategory.slice(0, 300);
    
    productsToProcess.forEach(product => {
      if (product && product.name && uniqueProducts.size < MAX_PRODUCT_OPTIONS) {
        uniqueProducts.add(product.name);
      }
    });
    
    // Convertir en tableau et trier par ordre alphabétique
    return Array.from(uniqueProducts).sort();
  }, [productsFilteredByCategory]);

  // Filtered products based on filters - with optimization
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

    return filtered;
  }, [productsFilteredByCategory, productFilter]);

  // Flag pour savoir s'il y a des produits après filtrage
  const hasProducts = useMemo(() => {
    return filteredProducts.length > 0;
  }, [filteredProducts]);

  // Flag pour savoir s'il y a des produits avec des notes après filtrage
  const hasRatedProducts = useMemo(() => {
    return filteredProducts.some(p => typeof p.rating === 'number' && !isNaN(p.rating));
  }, [filteredProducts]);

  // Calculate KPIs from filtered data - optimized with early return if no changes
  const filteredKpis = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return kpis;

    // Calculer en protégeant contre les NaN et les divisions par zéro
    const productCount = filteredProducts.length || 1; // Éviter division par zéro
    
    const validRatings = filteredProducts.filter(p => typeof p.rating === 'number' && !isNaN(p.rating));
    const validDeliveryTimes = filteredProducts.filter(p => typeof p.deliveryTime === 'number' && !isNaN(p.deliveryTime));
    
    const avgRating = validRatings.length > 0 
      ? validRatings.reduce((sum, p) => sum + p.rating, 0) / validRatings.length 
      : kpis.averageCustomerRating;
    
    const avgDeliveryTime = validDeliveryTimes.length > 0 
      ? validDeliveryTimes.reduce((sum, p) => sum + p.deliveryTime, 0) / validDeliveryTimes.length 
      : kpis.averageDeliveryTime;
    
    // Calculer les livraisons en retard uniquement si nécessaire
    let percentLate = 0;
    let lateDeliveriesCount = 0;
    
    // Optimiser en utilisant un compteur au lieu de créer une liste temporaire
    let lateCount = 0;
    for (let i = 0; i < filteredProducts.length; i++) {
      const p = filteredProducts[i];
      if (typeof p.deliveryTime === 'number' && 
          typeof p.estimatedDeliveryTime === 'number' && 
          p.deliveryTime > p.estimatedDeliveryTime) {
        lateCount++;
      }
    }
    
    percentLate = lateCount > 0 ? (lateCount / productCount) * 100 : 0;
    
    // Calculer les avis négatifs uniquement si nécessaire
    let negativeCount = 0;
    for (let i = 0; i < filteredProducts.length; i++) {
      const p = filteredProducts[i];
      if (typeof p.rating === 'number' && p.rating <= 2) {
        negativeCount++;
      }
    }

    return {
      ...kpis,
      averageDeliveryTime: isNaN(avgDeliveryTime) ? kpis.averageDeliveryTime : avgDeliveryTime,
      percentLateDeliveries: isNaN(percentLate) ? 0 : percentLate,
      averageCustomerRating: isNaN(avgRating) ? kpis.averageCustomerRating : avgRating,
      negativeReviews: negativeCount
    };
  }, [filteredProducts, kpis]);

  // Best and worst rated products - limités à 5 pour la performance
  const bestRatedProducts = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];
    // Limiter le nombre de produits à traiter
    const maxProductsToProcess = Math.min(filteredProducts.length, 100);
    const productsToProcess = filteredProducts.slice(0, maxProductsToProcess);
    const validProducts = productsToProcess.filter(p =>
      p && typeof p.rating === 'number' && !isNaN(p.rating)
    );
    // Tri : d'abord par note décroissante, puis par nombre de ventes décroissant
    return [...validProducts]
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.orders || 0) - (a.orders || 0);
      })
      .slice(0, 5);
  }, [filteredProducts]);

  const worstRatedProducts = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];
    // Limiter le nombre de produits à traiter
    const maxProductsToProcess = Math.min(filteredProducts.length, 100);
    const productsToProcess = filteredProducts.slice(0, maxProductsToProcess);
    const validProducts = productsToProcess.filter(p =>
      p && typeof p.rating === 'number' && !isNaN(p.rating)
    );
    // Tri : d'abord par note croissante, puis par nombre de ventes décroissant
    return [...validProducts]
      .sort((a, b) => {
        if (a.rating !== b.rating) return a.rating - b.rating;
        return (b.orders || 0) - (a.orders || 0);
      })
      .slice(0, 5);
  }, [filteredProducts]);

  // Formatage sécurisé des valeurs pour les KPIs - converti en fonction mémoïsée
  const formatSafeValue = useCallback((value: number, format: (n: number) => string, fallback: string = "0") => {
    if (value === undefined || isNaN(value)) return fallback;
    return format(value);
  }, []);

  // Memoizing distribution data to avoid recalculations on every render
  const ratingDistributionData = useMemo(() => {
    // On ne garde que les produits avec une note valide
    const validRatings = filteredProducts.filter(p => typeof p.rating === 'number' && !isNaN(p.rating));
    if (validRatings.length === 0) return [];

    // Compter le nombre de produits pour chaque note (1 à 5)
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    validRatings.forEach(p => {
      const r = Math.round(p.rating);
      if (distribution[r] !== undefined) distribution[r] += 1;
    });
    const total = validRatings.length;
    return Object.entries(distribution).map(([rating, count]) => ({
      rating: `${rating} étoile${Number(rating) > 1 ? 's' : ''}`,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }));
  }, [filteredProducts]);

  // Vérifier si la catégorie est disponible dans les catégories filtrées
  const isCategoryAvailable = useMemo(() => {
    if (filters.category === 'all') return true;
    return availableCategories.includes(filters.category);
  }, [filters.category, availableCategories]);

  // Vérifier si la région est disponible dans les régions filtrées
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

  // Filter options for the FilterSection component
  const filterOptions = useMemo(() => [
    {
      name: 'Catégorie',
      options: [
        { value: 'all', label: 'Toutes les catégories' },
        ...meta.categories
          .filter(cat => filters.state === 'all' || availableCategories.includes(cat.toLowerCase()))
          .map(cat => ({ 
            value: cat.toLowerCase(), 
            label: formatCategoryName(cat) 
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
          .filter(state => filters.category === 'all' || availableRegions.includes(state.toLowerCase()))
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
  ], [meta, filters, productFilter, productOptions, formatCategoryName, setFilters, availableCategories, availableRegions]);

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    setFilters({
      state: "all",
      category: "all"
    });
    setProductFilter("all");
  };

  // Loading and error states
  if (isLoading)
    return (
      <DashboardLayout title="Satisfaction client">
        <Spinner />
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout title="Satisfaction client">
        <ErrorBanner error={error} />
      </DashboardLayout>
    );

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

  // Message d'alerte quand aucune notation n'est disponible
  const NoRatingsMessage = () => (
    <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
      <Star size={48} className="text-orange-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Aucune note disponible</h3>
      <p className="text-muted-foreground max-w-md">
        Les produits sélectionnés n'ont pas encore été notés par les clients.
      </p>
    </div>
  );

  // Optimiser en pré-filtrant les données pour le ScatterPlot
  const scatterPlotData = useMemo(() => {
    if (filters.category === 'all') return [];
    
    return filteredProducts.filter(p => 
      typeof p.deliveryTime === 'number' && !isNaN(p.deliveryTime) &&
      typeof p.rating === 'number' && !isNaN(p.rating) &&
      typeof p.price === 'number' && !isNaN(p.price)
    ).slice(0, 200); // Limiter à 200 points pour de meilleures performances
  }, [filteredProducts, filters.category]);

  // Vérifier si des données sont disponibles pour le ScatterPlot
  const hasScatterData = scatterPlotData.length > 0;

  return (
    <DashboardLayout title="Satisfaction client & Livraison">
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
              title="Délai moyen livraison"
              value={
                isNaN(filteredKpis.averageDeliveryTime) || filteredKpis.averageDeliveryTime === undefined
                  ? 'N/A'
                  : `${filteredKpis.averageDeliveryTime.toFixed(1)} jours`
              }
              trend={{ direction: 'down', value: '-0.3j vs last month' }}
              icon={<Clock size={20} />}
            />
            <KpiCard
              title="Livraisons en retard"
              value={
                isNaN(filteredKpis.percentLateDeliveries) || filteredKpis.percentLateDeliveries === undefined
                  ? 'N/A'
                  : `${filteredKpis.percentLateDeliveries.toFixed(1)}%`
              }
              trend={{ direction: 'down', value: '-2.1% vs last month' }}
              icon={<MapPinX size={20} />}
            />
            <KpiCard
              title="Note moyenne"
              value={
                isNaN(filteredKpis.averageCustomerRating) || filteredKpis.averageCustomerRating === undefined
                  ? 'N/A'
                  : `${filteredKpis.averageCustomerRating.toFixed(1)}/5`
              }
              trend={{ direction: 'up', value: '+0.2 vs last month' }}
              icon={<Star size={20} />}
            />
            <KpiCard
              title="Avis négatifs"
              value={
                isNaN(filteredKpis.negativeReviews) || filteredKpis.negativeReviews === undefined
                  ? 'N/A'
                  : formatNumber(filteredKpis.negativeReviews)
              }
              icon={<ThumbsDown size={20} />}
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
                {!hasRatedProducts ? (
                  <NoRatingsMessage />
                ) : (
                  <BarChart
                    data={ratingDistributionData}
                    xAxisDataKey="rating"
                    bars={[
                      { dataKey: "count", name: "Nombre d'avis" }
                    ]}
                  />
                )}
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
                {filters.category === 'all' ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                    <div className="text-muted-foreground mb-2">
                      <Clock size={40} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Graphique non affiché</p>
                      <p>Pour optimiser les performances, veuillez sélectionner une catégorie spécifique pour afficher ce graphique.</p>
                    </div>
                  </div>
                ) : !hasProducts ? (
                  <NoDataMessage />
                ) : !hasScatterData ? (
                  <NoRatingsMessage />
                ) : (
                  <ScatterPlot
                    data={scatterPlotData}
                    xAxisDataKey="deliveryTime"
                    yAxisDataKey="rating"
                    zAxisDataKey="price"
                    name="Produits"
                  />
                )}
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
                {!hasRatedProducts ? (
                  <div className="py-8">
                    <NoRatingsMessage />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Note</TableHead>
                        <TableHead className="text-right">Délai (j)</TableHead>
                        <TableHead className="text-right">Ventes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bestRatedProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Aucune donnée disponible
                          </TableCell>
                        </TableRow>
                      ) : (
                        bestRatedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name || "Sans nom"}</TableCell>
                            <TableCell>{formatCategoryName(product.category)}</TableCell>
                            <TableCell className="text-right">
                              <span className="flex items-center justify-end">
                                {typeof product.rating === 'number' ? product.rating.toFixed(1) : "N/A"} 
                                <Star size={14} className="ml-1 text-yellow-500" />
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {typeof product.deliveryTime === 'number' ? Math.ceil(product.deliveryTime) : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {typeof product.orders === 'number' ? Math.ceil(product.orders) : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            {/* Worst Rated Products */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  <div className="flex items-center">
                    <Star className="mr-2 text-dashboard-red" size={18} />
                    Top 5 produits les moins bien notés
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasRatedProducts ? (
                  <div className="py-8">
                    <NoRatingsMessage />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Note</TableHead>
                        <TableHead className="text-right">Délai (j)</TableHead>
                        <TableHead className="text-right">Ventes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {worstRatedProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Aucune donnée disponible
                          </TableCell>
                        </TableRow>
                      ) : (
                        worstRatedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name || "Sans nom"}</TableCell>
                            <TableCell>{formatCategoryName(product.category)}</TableCell>
                            <TableCell className="text-right">
                              <span className="flex items-center justify-end">
                                {typeof product.rating === 'number' ? product.rating.toFixed(1) : "N/A"} 
                                <Star size={14} className="ml-1 text-yellow-500" />
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {typeof product.deliveryTime === 'number' ? Math.ceil(product.deliveryTime) : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {typeof product.orders === 'number' ? Math.ceil(product.orders) : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default CustomerSatisfaction;
