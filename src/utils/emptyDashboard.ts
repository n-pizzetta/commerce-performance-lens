/* src/utils/emptyDashboard.ts */
import { DashboardData } from "@/services/jsonDataService";

export const emptyDashboard: DashboardData = {
  categories: [],
  regions: [],
  monthlyData: [],
  enrichedProducts: [],
  kpis: {
    totalOrders: 0,
    totalRevenue: 0,
    averageProductPrice: 0,
    averageDeliveryTime: 0,
    averageCustomerRating: 0,
    percentLateDeliveries: 0,
    negativeReviews: 0,
    averagePricePerCategory: 0,
    averageShippingCost: 0,
    averageProfitRatio: 0,
  },
  ratingDistribution: [],
  meta: { years: [], months: [], states: [], categories: [] },
};
