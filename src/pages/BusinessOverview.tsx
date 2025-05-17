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
const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

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
    setFilters
  } = useDashboardData();

  /* ---- filtrage cumulatif ---- */
  const monthFiltered = useMemo(() => {
    return monthlyData.filter((m) =>
      filters.year === "all" ? true : m.month.startsWith(filters.year)
    );
  }, [monthlyData, filters.year]);

  const regionFiltered = useMemo(() => {
    return regions.filter((r) => {
      if (filters.state === "all") return true;
      return (r.name ?? "").toLowerCase() === filters.state;
    });
  }, [regions, filters.state]);

  const categoryFiltered = useMemo(() => {
    return categories.filter((c) => {
      if (filters.category === "all") return true;
      return (c.name ?? "").toLowerCase() === filters.category;
    });
  }, [categories, filters.category]);

  /* ---- Obtenir les années disponibles en fonction des filtres ---- */
  const availableYears = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    
    const uniqueYears = new Set<string>();
    
    // Parcourir les données mensuelles pour trouver les années disponibles
    for (const month of monthlyData) {
      // Extraire l'année du mois (format: "YYYY-MM")
      const year = month.month.split('-')[0];
      if (!year) continue;
      
      // Ajouter l'année au Set si elle correspond aux filtres actuels
      if ((filters.state === 'all' || regionFiltered.length > 0) && 
          (filters.category === 'all' || categoryFiltered.length > 0)) {
        uniqueYears.add(year);
      }
    }
    
    return Array.from(uniqueYears).sort();
  }, [monthlyData, filters.state, filters.category, regionFiltered, categoryFiltered]);

  /* ---- Obtenir les régions disponibles en fonction des filtres ---- */
  const availableRegions = useMemo(() => {
    if (!regions || regions.length === 0) return [];
    
    const uniqueRegions = new Set<string>();
    
    // Pour chaque région, vérifier si elle correspond aux filtres
    for (const region of regions) {
      if (!region.name) continue;
      
      // Si un filtre d'année est appliqué, vérifier si cette région a des données pour cette année
      if (filters.year !== 'all') {
        const hasData = monthlyData.some(month => 
          month.month.startsWith(filters.year) && 
          regionFiltered.some(r => r.name === region.name)
        );
        if (!hasData) continue;
      }
      
      // Si un filtre de catégorie est appliqué, vérifier si cette région a des données pour cette catégorie
      if (filters.category !== 'all') {
        // Vérifier si cette région a des données pour la catégorie sélectionnée
        const hasCategory = regionFiltered.some(r => 
          r.name === region.name && 
          categoryFiltered.some(c => c.name.toLowerCase() === filters.category)
        );
        
        if (!hasCategory) continue;
      }
      
      // Ajouter la région au Set
      uniqueRegions.add(region.name.toLowerCase());
      
      // Limiter le nombre de régions pour des raisons de performance
      if (uniqueRegions.size >= MAX_FILTER_OPTIONS) break;
    }
    
    return Array.from(uniqueRegions).sort();
  }, [regions, monthlyData, filters.year, filters.category, regionFiltered, categoryFiltered]);

  /* ---- Obtenir les catégories disponibles en fonction des filtres ---- */
  const availableCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    const uniqueCategories = new Set<string>();
    
    // Pour chaque catégorie, vérifier si elle correspond aux filtres
    for (const category of categories) {
      if (!category.name) continue;
      
      // Si un filtre d'année est appliqué, vérifier si cette catégorie a des données pour cette année
      if (filters.year !== 'all') {
        const hasData = monthlyData.some(month => 
          month.month.startsWith(filters.year) && 
          categoryFiltered.some(c => c.name === category.name)
        );
        if (!hasData) continue;
      }
      
      // Si un filtre de région est appliqué, vérifier si cette catégorie a des données pour cette région
      if (filters.state !== 'all') {
        // Vérifier si cette catégorie a des données pour la région sélectionnée
        const hasRegion = categoryFiltered.some(c => 
          c.name === category.name && 
          regionFiltered.some(r => r.name.toLowerCase() === filters.state)
        );
        
        if (!hasRegion) continue;
      }
      
      // Ajouter la catégorie au Set
      uniqueCategories.add(category.name.toLowerCase());
      
      // Limiter le nombre de catégories pour des raisons de performance
      if (uniqueCategories.size >= MAX_FILTER_OPTIONS) break;
    }
    
    return Array.from(uniqueCategories).sort();
  }, [categories, monthlyData, filters.year, filters.state, categoryFiltered, regionFiltered]);

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

    return {
      ...kpis,
      totalOrders:        totOrders  || kpis.totalOrders,
      totalRevenue:       totRevenue || kpis.totalRevenue,
      averageProductPrice:
        totOrders > 0 ? +(totRevenue / totOrders).toFixed(2) : kpis.averageProductPrice,
    };
  }, [categoryFiltered, kpis]);

  /* ---- options des select ---- */
  const filterOptions = [
    {
      name: "Année",
      options: [
        { value: "all", label: "Toutes" },
        ...meta.years
          .filter(y => availableYears.includes(String(y)))
          .map((y) => ({ value: String(y), label: String(y) })),
      ],
      value: filters.year,
      onChange: (value: string) => setFilters({ year: value }),
    },
    {
      name: "Région",
      options: [
        { value: "all", label: "Toutes" },
        ...meta.states
          .filter(s => availableRegions.includes(s.toLowerCase()))
          .map((s) => ({ value: s.toLowerCase(), label: s })),
      ],
      value: filters.state,
      onChange: (value: string) => setFilters({ state: value }),
    },
    {
      name: "Catégorie",
      options: [
        { value: "all", label: "Toutes" },
        ...meta.categories
          .filter(c => availableCategories.includes(c.toLowerCase()))
          .map((c) => ({ 
            value: c.toLowerCase(), 
            label: formatCategoryName(c) 
          })),
      ],
      value: filters.category,
      onChange: (value: string) => setFilters({ category: value }),
    },
  ];

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

  /* ---- fonction pour réinitialiser tous les filtres ---- */
  const resetAllFilters = () => {
    setFilters({
      year: "all",
      state: "all",
      category: "all"
    });
  };

  /* ---------------------------------------------------------------------- */
  /*  RENDER                                                                */
  /* ---------------------------------------------------------------------- */
  return (
    <DashboardLayout title="Vue globale du business">
      {/* Filtres ----------------------------------------------------------- */}
      <FilterSection filters={filterOptions} onReset={resetAllFilters} />

      {/* KPI --------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Nombre total de commandes"
          value={fmt(localKpis.totalOrders)}
          icon={<ShoppingCart size={20} />}
        />
        <KpiCard
          title="Chiffre d'affaires total"
          value={`${fmt(localKpis.totalRevenue)} €`}
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
            bars={[{ dataKey: "revenue", name: "CA", fill: "#8b5cf6" }]}
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

        <PieChart
          title="Répartition des ventes par région"
          data={regionFiltered.map((r) => ({ name: r.name, value: r.revenue }))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Tendance mensuelle du chiffre d'affaires</h3>
          <LineChart
            data={monthFiltered}
            xAxisDataKey="month"
            lines={[
              { dataKey: "revenue", name: "CA", stroke: "#8b5cf6" },
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
              { dataKey: "orders", name: "Commandes", stroke: "#22c55e" },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessOverview;
