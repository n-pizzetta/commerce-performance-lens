/*  ────────────────────────────────────────────────────────────────────
    src/pages/BusinessOverview.tsx
    Tableau de bord – Vue globale du business
   ──────────────────────────────────────────────────────────────────── */

import React, { useMemo, useEffect, useCallback } from "react";
import DashboardLayout       from "@/components/DashboardLayout";
import FilterSection         from "@/components/FilterSection";
import KpiCard               from "@/components/KpiCard";
import BarChart              from "@/components/charts/BarChart";
import PieChart              from "@/components/charts/PieChart";
import LineChart             from "@/components/charts/LineChart";
import Spinner               from "@/components/ui/Spinner";
import ErrorBanner           from "@/components/ui/ErrorBanner";
import { ShoppingCart, DollarSign, Clock, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MapClusters, { GeoCluster } from "@/components/charts/MapClusters";

import { useDashboardData }  from "@/contexts/DataContext";
import { Category, Region, MonthlyData } from "@/utils/mockData";
import { regionCoordinates } from "@/utils/regionCoordinates";

// Nombre maximum de régions/catégories à afficher dans les filtres
const MAX_FILTER_OPTIONS = 50;

/* -------------------------------------------------------------------------- */
/*  Utils                                                                     */
/* -------------------------------------------------------------------------- */
const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

/**
 * Formate une valeur monétaire en reais brésiliens
 */
const fmtCurrency = (n: number) => new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(n);

/**
 * Formate le nom d'une catégorie pour l'affichage
 */
const formatCategoryName = (name: string | undefined): string => {
  if (!name) return "Catégorie non spécifiée";
  
  // Convertir les underscores en espaces et mettre en majuscule les premières lettres
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const BusinessOverview: React.FC = () => {
  /* ---- données du contexte ---- */
  const {
    categories,
    regions,
    monthlyData,
    kpis,
    meta,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    enrichedProducts,
    topCategories
  } = useDashboardData();

  /* ---- filtrage des données mensuelles ---- */
  const monthFiltered = useMemo(() => {
    return monthlyData.filter((m) =>
      filters.year === "all" ? true : m.month.startsWith(filters.year)
    );
  }, [monthlyData, filters.year]);

  /* ---- filtrage des régions ---- */
  const regionFiltered = useMemo(() => {
    return regions.filter((r) => {
      if (filters.state === "all") return true;
      return (r.name ?? "").toLowerCase() === filters.state;
    });
  }, [regions, filters.state]);

  /* ---- filtrage des catégories ---- */
  const categoryFiltered = useMemo(() => {
    return categories.filter((c) => {
      if (filters.category === "all") return true;
      return (c.name ?? "").toLowerCase() === filters.category;
    });
  }, [categories, filters.category]);

  /* ---- Obtenir les années disponibles pour le filtre ---- */
  const availableYears = useMemo(() => {
    if (!enrichedProducts || enrichedProducts.length === 0) return [];

    const uniqueYears = new Set<string>();
    enrichedProducts.forEach(product => {
      if (
        product.orderDate &&
        (filters.state === 'all' || (product.region || '').toLowerCase() === filters.state) &&
        (filters.category === 'all' || (product.category || '').toLowerCase() === filters.category)
      ) {
        const year = new Date(product.orderDate).getFullYear().toString();
        if (year) {
          uniqueYears.add(year);
        }
      }
    });
    return Array.from(uniqueYears).sort();
  }, [enrichedProducts, filters.state, filters.category]);

  /* ---- Obtenir les régions disponibles pour le filtre ---- */
  const availableRegions = useMemo(() => {
    if (!enrichedProducts || enrichedProducts.length === 0) return [];

    const uniqueRegions = new Set<string>();
    enrichedProducts.forEach(product => {
      const productYear = product.orderDate ? new Date(product.orderDate).getFullYear().toString() : null;
      if (
        product.region &&
        (filters.year === 'all' || productYear === filters.year) &&
        (filters.category === 'all' || (product.category || '').toLowerCase() === filters.category)
      ) {
        uniqueRegions.add(product.region.toLowerCase());
      }
    });
    return Array.from(uniqueRegions).sort();
  }, [enrichedProducts, filters.year, filters.category]);

  /* ---- Obtenir les catégories disponibles en fonction de la sélection ---- */
  const availableCategories = useMemo(() => {
    if (!enrichedProducts || enrichedProducts.length === 0) return [];

    const uniqueCategories = new Set<string>();
    enrichedProducts.forEach(product => {
      const productYear = product.orderDate ? new Date(product.orderDate).getFullYear().toString() : null;
      if (
        product.category &&
        (filters.year === 'all' || productYear === filters.year) &&
        (filters.state === 'all' || (product.region || '').toLowerCase() === filters.state)
      ) {
        uniqueCategories.add(product.category.toLowerCase());
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [enrichedProducts, filters.year, filters.state]);

  /* ---- Vérifier si les filtres sélectionnés sont valides ---- */
  const isCategoryAvailable = useMemo(() => {
    if (filters.category === 'all') return true;
    return availableCategories.includes(filters.category);
  }, [filters.category, availableCategories]);

  const isRegionAvailable = useMemo(() => {
    if (filters.state === 'all') return true;
    return availableRegions.includes(filters.state);
  }, [filters.state, availableRegions]);

  const isYearAvailable = useMemo(() => {
    if (filters.year === 'all') return true;
    return availableYears.includes(filters.year);
  }, [filters.year, availableYears]);

  /* ---- Réinitialiser les filtres si la sélection n'est plus valide ---- */
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

  useEffect(() => {
    if (filters.year !== 'all' && !isYearAvailable) {
      setFilters({ year: 'all' });
    }
  }, [isYearAvailable, filters.year, setFilters]);

  /* ---- KPI recalculés sur l'échantillon courant ---- */
  const localKpis = useMemo(() => {
    const totOrders  = categoryFiltered.reduce((s, c) => s + c.orders,   0);
    const totRevenue = categoryFiltered.reduce((s, c) => s + c.revenue, 0);
    
    // Calculer la note client moyenne à partir des catégories filtrées
    const validRatings = categoryFiltered.filter(c => typeof c.averageRating === 'number' && !isNaN(c.averageRating));
    const avgRating = validRatings.length > 0 
      ? validRatings.reduce((sum, c) => sum + c.averageRating, 0) / validRatings.length 
      : kpis.averageCustomerRating;
    
    // Calculer le délai moyen de livraison à partir des catégories filtrées
    const validDeliveryTimes = categoryFiltered.filter(c => typeof c.averageDeliveryTime === 'number' && !isNaN(c.averageDeliveryTime));
    const avgDeliveryTime = validDeliveryTimes.length > 0
      ? validDeliveryTimes.reduce((sum, c) => sum + c.averageDeliveryTime, 0) / validDeliveryTimes.length
      : kpis.averageDeliveryTime;

    return {
      ...kpis,
      totalOrders:        totOrders  || kpis.totalOrders,
      totalRevenue:       totRevenue || kpis.totalRevenue,
      averageProductPrice:
        totOrders > 0 ? +(totRevenue / totOrders).toFixed(2) : kpis.averageProductPrice,
      averageCustomerRating: isNaN(avgRating) ? kpis.averageCustomerRating : avgRating,
      averageDeliveryTime: isNaN(avgDeliveryTime) ? kpis.averageDeliveryTime : avgDeliveryTime
    };
  }, [categoryFiltered, kpis]);

  /* ---- options des select ---- */
  const filterOptions = useMemo(() => {
    const options = [];

    // Year Filter
    // Visible if there are available years OR if a specific year is already selected.
    if (availableYears.length > 0 || filters.year !== 'all') {
      options.push({
        name: "Année",
        options: [
          { value: "all", label: "Toutes" },
          ...availableYears.map((y) => ({ value: String(y), label: String(y) })),
        ],
        value: filters.year,
        onChange: (value: string) => setFilters({ year: value }),
      });
    }

    // Region Filter
    // Visible if there are available regions OR if a specific region is already selected.
    if (availableRegions.length > 0 || filters.state !== 'all') {
      options.push({
        name: "Région",
        options: [
          { value: "all", label: "Toutes" },
          ...availableRegions.map((s) => ({ value: s.toLowerCase(), label: s.toUpperCase() })),
        ],
        value: filters.state,
        onChange: (value: string) => setFilters({ state: value }),
      });
    }

    // Category Filter
    // Visible if there are available categories OR if a specific category is already selected.
    if (availableCategories.length > 0 || filters.category !== 'all') {
      options.push({
        name: "Catégorie",
        options: [
          { value: "all", label: "Toutes" },
          ...availableCategories.map((c) => ({
            value: c.toLowerCase(),
            label: formatCategoryName(c)
          })),
        ],
        value: filters.category,
        onChange: (value: string) => setFilters({ category: value }),
      });
    }
    return options;
  }, [availableYears, availableRegions, availableCategories, filters, setFilters, formatCategoryName]);

  /* ---- Création de clusters géographiques à partir des catégories existantes ---- */
  const geoClusters = useMemo(() => {
    // Cas 1 : aucun filtre (tous)
    if (filters.state === "all" && filters.category === "all") {
      // Top 10 régions par CA
      return [...regionFiltered]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(region => ({
          region: region.name,
          lat: regionCoordinates[region.name]?.lat ?? -14.2350,
          lng: regionCoordinates[region.name]?.lng ?? -51.9253,
          topCategory: "Toutes catégories",
          revenue: region.revenue
        }));
    }
  
    // Cas 2 : filtre région uniquement (toutes catégories)
    if (filters.state !== "all" && filters.category === "all") {
      const regionName = filters.state;
      // Trouver la région sélectionnée
      const region = regions.find(r => (r.name ?? '').toLowerCase() === regionName);
      if (!region) return [];
      return [{
        region: region.name,
        lat: regionCoordinates[region.name]?.lat ?? -14.2350,
        lng: regionCoordinates[region.name]?.lng ?? -51.9253,
        topCategory: "Toutes catégories",
        revenue: region.revenue
      }];
    }
  
    // Cas 3 : filtre région + catégorie
    if (filters.state !== "all" && filters.category !== "all") {
      const regionName = filters.state;
      const categoryName = filters.category;
      // Trouver la région sélectionnée
      const region = regions.find(r => (r.name ?? '').toLowerCase() === regionName);
      if (!region) return [];
      // Trouver la catégorie sélectionnée dans cette région (si tu as ce croisement, sinon CA global de la catégorie)
      const category = categories.find(c => (c.name ?? '').toLowerCase() === categoryName);
      // Si tu as un croisement région/catégorie, adapte ici pour le CA précis
      // Ici, on prend le CA global de la catégorie
      return [{
        region: region.name,
        lat: regionCoordinates[region.name]?.lat ?? -14.2350,
        lng: regionCoordinates[region.name]?.lng ?? -51.9253,
        topCategory: formatCategoryName(categoryName),
        revenue: category ? category.revenue : 0
      }];
    }
  
    // Cas 4 : filtre catégorie uniquement (top 10 régions pour cette catégorie)
    if (filters.category !== "all") {
      const categoryName = filters.category;
      // Pour chaque région, trouver le CA de cette catégorie (ici CA global de la région)
      const regionsForCategory = regions
        .map(region => ({
          ...region,
          revenue: region.revenue // ou CA croisé si tu l'as
        }))
        .filter(region => region.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
  
      return regionsForCategory.map(region => ({
        region: region.name,
        lat: regionCoordinates[region.name]?.lat ?? -14.2350,
        lng: regionCoordinates[region.name]?.lng ?? -51.9253,
        topCategory: formatCategoryName(categoryName),
        revenue: region.revenue
      }));
    }
  
    // Fallback : rien
    return [];
  }, [filters, regionFiltered, categoryFiltered, categories, regions]);

  /* ---- loading / erreur ---- */
  if (isLoading)
    return (
      <DashboardLayout title="Vue globale">
        <Spinner />
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout title="Vue globale">
        <ErrorBanner error={error} />
      </DashboardLayout>
    );

  /* ---------------------------------------------------------------------- */
  /*  RENDER                                                                */
  /* ---------------------------------------------------------------------- */
  return (
    <DashboardLayout title="Vue globale du business">
      {/* Filtres ----------------------------------------------------------- */}
      <div className="relative">
        <FilterSection filters={filterOptions} onReset={resetFilters} />
      </div>

      {/* KPI --------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 z-[100]">
        <KpiCard
          title="Nombre total de commandes"
          value={fmt(localKpis.totalOrders)}
          icon={<ShoppingCart size={20} />}
          trend={{ direction: 'up', value: '+2% vs last month' }}
        />
        <KpiCard
          title="Chiffre d'affaires total (en R$)"
          value={
            isNaN(localKpis.totalRevenue) || localKpis.totalRevenue === undefined
              ? 'N/A'
              : fmtCurrency(localKpis.totalRevenue)
          }
          icon={<DollarSign size={20} />}
          trend={{ direction: 'up', value: '+1.8% vs last month' }}
        />
        <KpiCard
          title="Délai moyen de livraison"
          value={`${localKpis.averageDeliveryTime.toFixed(1)} j`}
          icon={<Clock size={20} />}
          trend={{ direction: 'down', value: '-0.5j vs last month' }}
        />
        <KpiCard
          title="Note client moyenne"
          value={`${localKpis.averageCustomerRating.toFixed(1)}/5`}
          icon={<Star size={20} />}
          trend={{ direction: 'up', value: '+0.1 vs last month' }}
        />
      </div>

      {/* Graphiques -------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-medium mb-4">
            {filters.category !== 'all' ? `Top 10 produits de la catégorie` : `Top 10 Catégories par chiffre d'affaires`}
          </h3>
          {filters.category !== 'all' ? (
            <BarChart
              data={[...enrichedProducts]
                .filter(p => (p.category || '').toLowerCase() === filters.category.toLowerCase())
                .sort((a, b) => b.price - a.price)
                .slice(0, 10)
                .map(product => ({
                  ...product,
                  name: product.name
                }))}
              xAxisDataKey="name"
              bars={[{ dataKey: "price", name: "CA" }]}
              formatTooltipValue={(value, name) => {
                if (name === "CA") {
                  return new Intl.NumberFormat('fr-FR', {
                    maximumFractionDigits: 0,
                    useGrouping: true
                  }).format(value);
                }
                return value.toString();
              }}
              showLegend={false}
            />
          ) : (
            <BarChart
              data={[...categoryFiltered]
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10)
                .map(category => ({
                  ...category,
                  name: formatCategoryName(category.name)
                }))}
              xAxisDataKey="name"
              bars={[{ dataKey: "revenue", name: "CA" }]}
              formatTooltipValue={(value, name) => {
                if (name === "CA") {
                  return new Intl.NumberFormat('fr-FR', {
                    maximumFractionDigits: 0,
                    useGrouping: true
                  }).format(value);
                }
                return value.toString();
              }}
            />
          )}
        </div>

        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm z-[10]">
          <h3 className="text-lg font-medium mb-4">Top catégories par région</h3>
          <MapClusters clusters={geoClusters} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Tendance mensuelle du chiffre d'affaires</h3>
          <LineChart
            data={monthFiltered}
            xAxisDataKey="month"
            lines={[
              { dataKey: "revenue", name: "CA" },
            ]}
            formatTooltipValue={(value, name) => {
              if (name === "CA") {
                return new Intl.NumberFormat('fr-FR', { 
                  maximumFractionDigits: 0,
                  useGrouping: true
                }).format(value);
              }
              return value.toString();
            }}
          />
        </div>
        
        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Tendance mensuelle des commandes</h3>
          <LineChart
            data={monthFiltered}
            xAxisDataKey="month"
            lines={[
              { dataKey: "orders", name: "Commandes" },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessOverview;
