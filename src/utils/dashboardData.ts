import { generateDashboardFromJson } from '@/services/jsonDataService';

const jsonData = {
  overview: {
    kpis: {
      totalOrders: 99441,
      totalRevenue: 13651923.47,
      averageProductPrice: 120.48,
      averageDeliveryTime: 12.5,
      averageCustomerRating: 4.03
    },
    topCategories: [
      { orders: 9727 },
      { orders: 6001 },
      { orders: 11270 },
      { orders: 8700 },
      { orders: 7894 },
      { orders: 8415 },
      { orders: 3806 },
      { orders: 6989 },
      { orders: 4256 }
    ],
    regions: [
      { orders: 92 }, { orders: 448 }, { orders: 166 }, { orders: 82 },
      { orders: 3819 }, { orders: 1483 }, { orders: 2433 }, { orders: 2269 },
      { orders: 2353 }, { orders: 829 }, { orders: 13209 }, { orders: 831 },
      { orders: 1058 }, { orders: 1087 }, { orders: 603 }, { orders: 1818 },
      { orders: 543 }, { orders: 5764 }, { orders: 14668 }, { orders: 531 },
      { orders: 278 }, { orders: 52 }, { orders: 6287 }, { orders: 4191 },
      { orders: 385 }, { orders: 47720 }
    ],
    monthly: [
      { revenue: 267.36 }, { revenue: 49634.35 }, { revenue: 10.9 },
      { revenue: 121087.9 }, { revenue: 248563.02 }, { revenue: 376010.7 },
      { revenue: 360738.17 }, { revenue: 509639.63 }, { revenue: 436550.89 },
      { revenue: 501299.7 }, { revenue: 578588.99 }, { revenue: 626752.17 },
      { revenue: 667869.15 }, { revenue: 1017758.83 }, { revenue: 746717.15 },
      { revenue: 955658.74 }, { revenue: 853591.21 }, { revenue: 986867.05 },
      { revenue: 998893.07 }, { revenue: 997066.66 }, { revenue: 865956.24 },
      { revenue: 897496.14 }, { revenue: 854760.45 }
    ],
    meta: {
      years: [2018],
      months: ["12"],
      states: ["TO"],
      categories: []
    }
  },
  satisfaction: {
    kpis: {
      averageDeliveryTime: 12.5,
      percentLateDeliveries: 7.7,
      averageCustomerRating: 4.09,
      negativeReviews: 14575
    },
    ratingDistribution: [
      { count: 11424 },
      { count: 3151 },
      { count: 8179 },
      { count: 19142 }
    ],
    deliveryVsRating: [
      { price: 58.9 }, { price: 239.9 }, { price: 199.0 }, { price: 12.99 },
      { price: 199.9 }, { price: 21.9 }, { price: 19.9 }, { price: 810.0 },
      { price: 145.95 }, { price: 53.99 }, { price: 59.99 }, { price: 45.0 },
      { price: 74.0 }, { price: 49.9 }, { price: 49.9 }, { price: 99.9 },
      { price: 639.0 }, { price: 144.0 }, { price: 99.0 }, { price: 25.0 }
    ]
  },
  profitability: {
    kpis: {
      averageRating: 4.05
    },
    categories: [],
    products: []
  }
};

// Générer toutes les données du dashboard à partir du JSON
const dashboardData = generateDashboardFromJson(jsonData);

// Exporter les données traitées
export const {
  categories: categoryData,
  regions: regionData,
  monthlyData,
  enrichedProducts: productData,
  kpis: overallKpis,
  ratingDistribution,
  meta: metaData
} = dashboardData;