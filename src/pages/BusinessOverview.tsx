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

import { useDashboardData }  from "@/contexts/DataContext";
import { Category, Region, MonthlyData } from "@/utils/mockData";

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
    resetFilters
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
    if (!monthlyData || monthlyData.length === 0) return [];
    
    const uniqueYears = new Set<string>();
    
    // Parcourir les données mensuelles pour trouver toutes les années uniques
    monthlyData.forEach(month => {
      const year = month.month.split('-')[0];
      if (year) {
        uniqueYears.add(year);
      }
    });
    
    return Array.from(uniqueYears).sort();
  }, [monthlyData]);

  /* ---- Obtenir les régions disponibles pour le filtre ---- */
  const availableRegions = useMemo(() => {
    if (!regions || regions.length === 0) return [];
    
    const uniqueRegions = new Set<string>();
    
    // Parcourir toutes les régions pour obtenir leurs noms uniques
    regions.forEach(region => {
      if (region.name) {
        uniqueRegions.add(region.name.toLowerCase());
      }
      // Limiter le nombre de régions pour des raisons de performance (si nécessaire, mais on veut toutes les afficher)
      // if (uniqueRegions.size >= MAX_FILTER_OPTIONS) return; // Commenté pour afficher toutes les régions
    });
    
    return Array.from(uniqueRegions).sort();
  }, [regions]);

  /* ---- Obtenir les catégories disponibles pour le filtre ---- */
  const availableCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // Toujours afficher toutes les catégories dans la liste déroulante
    // mais on peut filtrer selon l'année sélectionnée
    const uniqueCategories = new Set<string>();
    
    categories.forEach(category => {
      if (!category.name) return;
      
      // Vérifier si cette catégorie a des données pour l'année sélectionnée
      let shouldInclude = true;
      
      if (filters.year !== 'all') {
        const hasYearData = monthlyData.some(month => 
          month.month.startsWith(filters.year)
        );
        if (!hasYearData) shouldInclude = false;
      }
      
      if (shouldInclude) {
        uniqueCategories.add(category.name.toLowerCase());
      }
      
      // Limiter le nombre de catégories pour des raisons de performance
      if (uniqueCategories.size >= MAX_FILTER_OPTIONS) return;
    });
    
    return Array.from(uniqueCategories).sort();
  }, [categories, monthlyData, filters.year]);

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
  const filterOptions = useMemo(() => [
    {
      name: "Année",
      options: [
        { value: "all", label: "Toutes" },
        // Utiliser toutes les années de meta.years
        ...meta.years
          // .filter(y => availableYears.includes(String(y))) // Supprimer ce filtre pour toujours afficher toutes les années de meta
          .map((y) => ({ value: String(y), label: String(y) })),
      ],
      value: filters.year,
      onChange: (value: string) => setFilters({ year: value }),
    },
    {
      name: "Région",
      options: [
        { value: "all", label: "Toutes" },
        // Utiliser toutes les régions de meta.states
        ...meta.states
          // .filter(s => availableRegions.includes(s.toLowerCase())) // Supprimer ce filtre pour toujours afficher toutes les régions de meta
          .map((s) => ({ value: s.toLowerCase(), label: s })),
      ],
      value: filters.state,
      onChange: (value: string) => setFilters({ state: value }),
    },
    {
      name: "Catégorie",
      options: [
        { value: "all", label: "Toutes" },
        // Utiliser toutes les catégories de meta au lieu de filtrer par availableCategories
        // pour que toutes les catégories restent visibles dans la liste déroulante
        ...meta.categories
          .map((c) => ({ 
            value: c.toLowerCase(), 
            label: formatCategoryName(c) 
          })),
      ],
      value: filters.category,
      onChange: (value: string) => setFilters({ category: value }),
    },
  ], [meta, availableYears, availableRegions, filters, setFilters]);

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
      <FilterSection filters={filterOptions} onReset={resetFilters} />

      {/* KPI --------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Nombre total de commandes"
          value={fmt(localKpis.totalOrders)}
          icon={<ShoppingCart size={20} />}
        />
        <KpiCard
          title="Chiffre d'affaires total"
          value={`R$ ${fmtCurrency(localKpis.totalRevenue)}`}
          icon={<DollarSign size={20} />}
        />
        <KpiCard
          title="Délai moyen de livraison"
          value={`${localKpis.averageDeliveryTime.toFixed(1)} j`}
          icon={<Clock size={20} />}
        />
        <KpiCard
          title="Note client moyenne"
          value={`${localKpis.averageCustomerRating.toFixed(1)}/5`}
          icon={<Star size={20} />}
        />
      </div>

      {/* Graphiques -------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Top 10 Catégories par chiffre d'affaires</h3>
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
        </div>

        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <PieChart
            title="Répartition des ventes par région"
            data={regionFiltered
              .sort((a, b) => b.revenue - a.revenue)
              .map((r) => ({ 
                name: r.name, 
                value: r.revenue 
              }))}
            threshold={5}
            height={350}
          />
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
