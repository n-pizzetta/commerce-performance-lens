/* src/contexts/DataContext.tsx */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import groupBy from "lodash.groupby";          // installez : npm i lodash.groupby
import sumBy   from "lodash.sumby";
import { FactsRow } from "@/utils/mockData";
import { 
  DashboardData,
  generateDashboardFromJson 
} from "@/services/jsonDataService";
import { emptyDashboard } from "@/utils/emptyDashboard";

interface Filters {
  year: string;        // "all" ou "2024"
  state: string;       // "all" ou "sp"
  category: string;    // "all" ou "electronics"
  selectedProductId?: number; // ID du produit sélectionné (optionnel)
}

type Ctx = DashboardData & {
  isLoading: boolean;
  error: Error | null;
  filters: Filters;
  setFilters: (p: Partial<Filters>) => void;
  resetFilters: () => void;
  raw: any; // Données brutes du JSON
};

const DataContext = createContext<Ctx | null>(null);
export const useDashboardData = () => {
  const v = useContext(DataContext);
  if (!v) throw new Error("useDashboardData must be used inside provider");
  return v;
};

// Filtres par défaut
const DEFAULT_FILTERS: Filters = {
  year: "all",
  state: "all",
  category: "all",
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raw, setRaw] = useState<any>(null);          // JSON original
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /* filtres globaux */
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);

  // Fonction wrapper pour gérer les mises à jour partielles des filtres
  const setFilters = useCallback((partialFilters: Partial<Filters>) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      ...partialFilters
    }));
  }, []);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  /* 1. charge JSON */
  useEffect(() => {
    // Utiliser un chemin direct plutôt que la construction d'URL qui peut échouer
    const url = import.meta.env.BASE_URL + "data/dashboard.json";
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();           // ici r.json() fonctionnera
      })
      .then(setRaw)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  /* 2. transforme en DashboardData dynamique */
  const data: DashboardData = useMemo(() => {
    if (!raw) return emptyDashboard;  

    try {
      /* -------- filtres appliqués sur facts -------- */
      const facts: FactsRow[] = raw.facts.filter((f: FactsRow) =>
        (filters.year     === "all" || String(f.year)               === filters.year) &&
        (filters.state    === "all" || f.state.toLowerCase()        === filters.state) &&
        (filters.category === "all" || f.category.toLowerCase()     === filters.category)
      );

      // Initialize `base` first as other calculations depend on it.
      const base = generateDashboardFromJson(raw); // donne enrichedProducts, meta, etc.

      /* -------- agrégations -------- */
      const monthly = Object.entries(groupBy(facts, "ym")).map(([ym, rows]) => ({
        month: ym,
        orders:  sumBy(rows, "orders"),
        revenue: sumBy(rows, "revenue"),
      }));

      const regions = Object.entries(groupBy(facts, "state")).map(([state, rows], i) => ({
        id: i + 1,
        name: state,
        orders:  sumBy(rows, "orders"),
        revenue: sumBy(rows, "revenue"),
      }));

      const categories = Object.entries(groupBy(facts, "category")).map(
        ([cat, categoryFactsRows], i) => {
          // Filter enrichedProducts for the current category `cat`
          const productsInThisCategory = base.enrichedProducts.filter(
            p => (p.category?.toLowerCase() ?? "") === cat.toLowerCase()
          );

          // Calculate averageRating for this category based on its products
          const catValidRatings = productsInThisCategory.filter(p => typeof p.rating === 'number' && !isNaN(p.rating));
          const categoryOverallAverageRating = catValidRatings.length > 0
            ? sumBy(catValidRatings, 'rating') / catValidRatings.length
            : base.kpis.averageCustomerRating; // Fallback to global KPI for the category if no relevant products

          // Calculate averageDeliveryTime for this category based on its products
          const catValidDeliveryTimes = productsInThisCategory.filter(p => typeof p.deliveryTime === 'number' && !isNaN(p.deliveryTime));
          const categoryOverallAverageDeliveryTime = catValidDeliveryTimes.length > 0
            ? sumBy(catValidDeliveryTimes, 'deliveryTime') / catValidDeliveryTimes.length
            : base.kpis.averageDeliveryTime; // Fallback to global KPI for the category

          // Find profitRatio for the category, ensuring consistent lowercase comparison
          const profitRatioInfo = raw.profitability.categories.find(
            (c: any) => (c.name?.toLowerCase() ?? "") === cat.toLowerCase()
          );

          return {
            id: i + 1,
            name: cat,
            orders:  sumBy(categoryFactsRows, "orders"),
            revenue: sumBy(categoryFactsRows, "revenue"),
            averagePrice: +(sumBy(categoryFactsRows, "revenue") / (sumBy(categoryFactsRows, "orders") || 1)).toFixed(2),
            averageRating: categoryOverallAverageRating,
            averageDeliveryTime: categoryOverallAverageDeliveryTime,
            profitRatio: profitRatioInfo?.profitRatio ?? 0
          };
        }
      );

      const kpiOrders  = sumBy(facts, "orders");
      const kpiRevenue = sumBy(facts, "revenue");

      return {
        ...base,
        categories,
        regions,
        monthlyData: monthly,
        kpis: {
          ...base.kpis,
          totalOrders:        kpiOrders  || base.kpis.totalOrders,
          totalRevenue:       kpiRevenue || base.kpis.totalRevenue,
          averageProductPrice:
            kpiOrders ? +(kpiRevenue / kpiOrders).toFixed(2) : base.kpis.averageProductPrice,
        },
        topCategories: raw.topCategories || []
      };
    } catch (err) {
      console.error("Erreur lors du traitement des données:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return emptyDashboard;
    }
  }, [raw, filters]);

  // Valeur du contexte
  const contextValue = useMemo(() => ({
    ...data,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    raw  // Ajouter les données brutes au contexte
  }), [data, isLoading, error, filters, setFilters, resetFilters, raw]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
