import {
  Category,
  Region,
  MonthlyData,
  EnrichedProduct,
} from "@/utils/mockData"; 

/* -------- Types alignés sur le JSON real ------------------- */
interface DashboardJson {
  overview: {
    kpis: {
      totalOrders: number;
      totalRevenue: number;
      averageProductPrice: number;
      averageDeliveryTime: number;
      averageCustomerRating: number;
    };
    topCategories: Array<{
      product_category_name_english: string;
      revenue: number;
      orders: number;
    }>;
    regions: Array<{
      state: string;
      revenue: number;
      orders: number;
    }>;
    monthly: Array<{
      month: string; // "2024-03"
      orders: number;
      revenue: number;
    }>;
    meta: {
      years: number[];
      months: string[];
      states: string[];
      categories: string[];
    };
  };

  satisfaction: {
    kpis: {
      averageDeliveryTime: number;
      percentLateDeliveries: number;
      averageCustomerRating: number;
      negativeReviews: number;
    };
    ratingDistribution: Array<{ rating: number; count: number }>;
    deliveryVsRating: Array<{
      productId: string;
      deliveryTime: number;
      rating: number;
      price: number;
    }>;
    topRated: Array<any>;
    worstRated: Array<any>;
  };

  profitability: {
    kpis: {
      averagePricePerCategory: number;
      averageShippingCost: number;
      averageProfitRatio: number;
      averageRating: number;
    };
    categories: Array<{
      name: string;
      profitRatio: number;
      averageRating: number;
    }>;
    /* structure complète d'un produit enrichi */
    products: Array<{
      product_id: string;
      product_category_name_english: string;
      price: number;
      shippingCost: number;
      weight: number;
      rating: number;
      deliveryTime: number;
      estimatedDeliveryTime: number;
      profitRatio: number;
    }>;
  };

  facts?: Array<{
    product_id: string;
    orders: number;
    // autres champs potentiels ignorés ici
  }>;
}

/* -------- dashboard consumable par l'app ------------------------------- */
export interface DashboardData {
  categories: Category[];
  regions: Region[];
  monthlyData: MonthlyData[];
  enrichedProducts: EnrichedProduct[];
  kpis: {
    totalOrders: number;
    totalRevenue: number;
    averageProductPrice: number;
    averageDeliveryTime: number;
    averageCustomerRating: number;
    percentLateDeliveries: number;
    negativeReviews: number;
    averagePricePerCategory: number;
    averageShippingCost: number;
    averageProfitRatio: number;
  };
  ratingDistribution: Array<{ rating: number; count: number }>;
  meta: {
    years: number[];
    months: string[];
    states: string[];
    categories: string[];
  };
  topCategories: any[];
}

/* -------- conversion JSON -> structures front -------------------------- */
export function generateDashboardFromJson(
  json: DashboardJson
): DashboardData {
  /* 1. Categories */
  const categories: Category[] = json.overview.topCategories.map(
    (c, idx): Category => ({
      id: idx + 1,
      name: c.product_category_name_english || `Catégorie ${idx + 1}`,
      revenue: c.revenue,
      orders: c.orders,
      averagePrice: +(c.revenue / c.orders).toFixed(2),
      averageRating: json.overview.kpis.averageCustomerRating, // pas d'info plus fine
      averageDeliveryTime: json.overview.kpis.averageDeliveryTime,
      profitRatio:
        json.profitability.categories.find(
          (pc) => pc.name === c.product_category_name_english
        )?.profitRatio ?? 0,
    })
  );

  /* 2. Regions */
  const regions: Region[] = json.overview.regions.map(
    (r, idx): Region => ({
      id: idx + 1,
      name: r.state,
      revenue: r.revenue,
      orders: r.orders,
    })
  );

  /* 3. Monthly */
  const monthlyData: MonthlyData[] = json.overview.monthly.map(
    (m, idx): MonthlyData => ({
      month: m.month || `2024-${String(idx + 1).padStart(2, '0')}`, // utiliser le mois fourni ou générer au format "YYYY-MM"
      orders: m.orders || Math.round(m.revenue / json.overview.kpis.averageProductPrice),
      revenue: m.revenue,
    })
  );

  /* 4. Products : ceux du bloc profitability.products, prêts à l'emploi */
  const enrichedProducts: EnrichedProduct[] = (json.profitability.products || []).map(
    (p, idx) => {
      // Créer un nom de produit basé sur l'ID si aucun nom n'est fourni
      const productName = `${p.product_category_name_english || 'Product'} #${idx + 1}`;
      
      // Utiliser la catégorie fournie ou une valeur par défaut
      const productCategory = p.product_category_name_english || "Catégorie non spécifiée";
      
      // Déterminer une région pour le produit (en alternant entre les régions disponibles)
      const region = regions.length > 0 
        ? regions[idx % regions.length].name 
        : "Région non spécifiée";

      // Derive orderDate from meta years and months for filter functionality
      const metaYears = json.overview.meta.years || [];
      const metaMonths = json.overview.meta.months || [];
      const yearForProduct = metaYears.length > 0 ? metaYears[idx % metaYears.length].toString() : "2023";
      const monthForProduct = metaMonths.length > 0 ? metaMonths[idx % metaMonths.length] : "01";
      const dayForProduct = ((idx % 28) + 1).toString().padStart(2, '0'); // Cycle days 01-28
      const derivedOrderDate = `${yearForProduct}-${monthForProduct}-${dayForProduct}`;
      
      return {
        id: idx + 1,
        name: productName,
        category: productCategory,
        price: p.price || 0,
        shippingCost: p.shippingCost || 0,
        weight: p.weight || 1, // Éviter les divisions par zéro
        rating: p.rating || 0,
        deliveryTime: p.deliveryTime || 0,
        estimatedDeliveryTime: p.estimatedDeliveryTime || 0,
        region: region,
        // product_id: p.product_id, // Not currently in EnrichedProduct interface, but p has it
        orders: 0, // p (from profitability.products) does not have 'orders'. Set to 0 or look up from facts if needed.
        orderDate: derivedOrderDate, // Added derived orderDate
        profitRatio: p.profitRatio || 0 // Added profitRatio from source
      };
    }
  );

  // Générer des produits si nécessaire (si la liste est vide)
  if (enrichedProducts.length === 0 && json.satisfaction.deliveryVsRating) {
    json.satisfaction.deliveryVsRating.forEach((item, idx) => {
      if (idx < 20) { // Limiter le nombre de produits générés
        enrichedProducts.push({
          id: idx + 1,
          name: `Produit ${idx + 1}`,
          category: `Catégorie ${Math.floor(idx / categories.length) + 1}`,
          price: item.price || json.overview.kpis.averageProductPrice,
          shippingCost: (item.price || json.overview.kpis.averageProductPrice) * 0.1,
          weight: Math.random() * 5 + 0.5,
          rating: item.rating || json.overview.kpis.averageCustomerRating,
          deliveryTime: item.deliveryTime || json.overview.kpis.averageDeliveryTime,
          estimatedDeliveryTime: 15,
          region: `Region ${Math.floor(Math.random() * regions.length) + 1}`
        });
      }
    });
  }

  /* 5. KPIs globaux */
  const kpis = {
    totalOrders: json.overview.kpis.totalOrders,
    totalRevenue: json.overview.kpis.totalRevenue,
    averageProductPrice: json.overview.kpis.averageProductPrice,
    averageDeliveryTime: json.overview.kpis.averageDeliveryTime,
    averageCustomerRating: json.overview.kpis.averageCustomerRating,
    percentLateDeliveries: json.satisfaction.kpis.percentLateDeliveries,
    negativeReviews: json.satisfaction.kpis.negativeReviews,
    averagePricePerCategory: json.profitability.kpis?.averagePricePerCategory || json.overview.kpis.averageProductPrice,
    averageShippingCost: json.profitability.kpis?.averageShippingCost || json.overview.kpis.averageProductPrice * 0.1,
    averageProfitRatio: json.profitability.kpis?.averageProfitRatio || 0.65,
  };

  /* 6. RatingDistribution : s'assurer qu'il est au bon format */
  const ratingDistribution = json.satisfaction.ratingDistribution.map((item, idx) => ({
    rating: item.rating || idx + 1,
    count: item.count
  }));

  /* 7. Meta (directement du JSON) */
  const meta = json.overview.meta;

  /* 8. Top Categories (directement du JSON, déjà utilisé pour construire `categories` mais requis par DashboardData) */
  const topCategories = json.overview.topCategories || [];

  // Logging pour débogage
  console.log("Données chargées:", {
    categoriesCount: categories.length,
    regionsCount: regions.length,
    monthlyDataCount: monthlyData.length,
    productsCount: enrichedProducts.length,
    metaYears: meta.years,
    metaStates: meta.states,
    metaCategories: meta.categories
  });

  return {
    categories,
    regions,
    monthlyData,
    enrichedProducts,
    kpis,
    ratingDistribution,
    meta,
    topCategories,
  };
}
