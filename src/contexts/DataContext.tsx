/* src/contexts/DataContext.tsx */
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
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
}

type Ctx = DashboardData & {
  isLoading: boolean;
  error: Error | null;
  filters: Filters;
  setFilters: (p: Partial<Filters>) => void;
};

const DataContext = createContext<Ctx | null>(null);
export const useDashboardData = () => {
  const v = useContext(DataContext);
  if (!v) throw new Error("useDashboardData must be used inside provider");
  return v;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raw, setRaw] = useState<any>(null);          // JSON original
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /* filtres globaux */
  const [filters, setFiltersState] = useState<Filters>({
    year: "all",
    state: "all",
    category: "all",
  });

  // Fonction wrapper pour gérer les mises à jour partielles des filtres
  const setFilters = (partialFilters: Partial<Filters>) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      ...partialFilters
    }));
  };

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

    /* -------- filtres appliqués sur facts -------- */
    const facts: FactsRow[] = raw.facts.filter((f: FactsRow) =>
      (filters.year     === "all" || String(f.year)               === filters.year) &&
      (filters.state    === "all" || f.state.toLowerCase()        === filters.state) &&
      (filters.category === "all" || f.category.toLowerCase()     === filters.category)
    );

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
      ([cat, rows], i) => ({
        id: i + 1,
        name: cat,
        orders:  sumBy(rows, "orders"),
        revenue: sumBy(rows, "revenue"),
        averagePrice: +(sumBy(rows, "revenue") / (sumBy(rows, "orders") || 1)).toFixed(2),
        averageRating: raw.overview.kpis.averageCustomerRating,        // faute de mieux
        averageDeliveryTime: raw.overview.kpis.averageDeliveryTime,
        profitRatio: raw.profitability.categories.find((c:any)=>c.name===cat)?.profitRatio ?? 0
      })
    );

    const kpiOrders  = sumBy(facts, "orders");
    const kpiRevenue = sumBy(facts, "revenue");

    const base = generateDashboardFromJson(raw); // donne enrichedProducts, meta, etc.

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
    };
  }, [raw, filters]);

  return (
    <DataContext.Provider value={{ ...data, isLoading, error, filters, setFilters }}>
      {children}
    </DataContext.Provider>
  );
};
