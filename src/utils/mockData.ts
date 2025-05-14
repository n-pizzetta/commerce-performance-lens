
export interface Category {
  id: number;
  name: string;
  revenue: number;
  orders: number;
  averagePrice: number;
  averageRating: number;
  averageDeliveryTime: number;
  profitRatio: number;
}

export interface Region {
  id: number;
  name: string;
  revenue: number;
  orders: number;
}

export interface MonthlyData {
  month: string;
  orders: number;
  revenue: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  shippingCost: number;
  weight: number;
  rating: number;
  deliveryTime: number;
  estimatedDeliveryTime: number;
  region: string;
}

// Top categories by revenue
export const categoryData: Category[] = [
  { id: 1, name: 'Electronics', revenue: 1250000, orders: 5200, averagePrice: 240, averageRating: 4.2, averageDeliveryTime: 3.5, profitRatio: 0.65 },
  { id: 2, name: 'Fashion', revenue: 980000, orders: 12400, averagePrice: 79, averageRating: 4.5, averageDeliveryTime: 2.1, profitRatio: 0.72 },
  { id: 3, name: 'Home & Kitchen', revenue: 870000, orders: 6800, averagePrice: 128, averageRating: 4.3, averageDeliveryTime: 4.2, profitRatio: 0.58 },
  { id: 4, name: 'Beauty', revenue: 620000, orders: 9300, averagePrice: 67, averageRating: 4.7, averageDeliveryTime: 1.9, profitRatio: 0.81 },
  { id: 5, name: 'Sports', revenue: 580000, orders: 4100, averagePrice: 141, averageRating: 4.1, averageDeliveryTime: 3.7, profitRatio: 0.62 },
  { id: 6, name: 'Books', revenue: 410000, orders: 7800, averagePrice: 53, averageRating: 4.8, averageDeliveryTime: 2.3, profitRatio: 0.75 },
  { id: 7, name: 'Toys & Games', revenue: 390000, orders: 5600, averagePrice: 70, averageRating: 4.4, averageDeliveryTime: 2.8, profitRatio: 0.69 },
  { id: 8, name: 'Automotive', revenue: 350000, orders: 1900, averagePrice: 184, averageRating: 3.9, averageDeliveryTime: 5.1, profitRatio: 0.55 },
  { id: 9, name: 'Health', revenue: 320000, orders: 4800, averagePrice: 67, averageRating: 4.6, averageDeliveryTime: 2.5, profitRatio: 0.77 },
  { id: 10, name: 'Pet Supplies', revenue: 280000, orders: 3700, averagePrice: 76, averageRating: 4.5, averageDeliveryTime: 2.9, profitRatio: 0.68 },
];

// Regional data
export const regionData: Region[] = [
  { id: 1, name: 'California', revenue: 1450000, orders: 12600 },
  { id: 2, name: 'Texas', revenue: 980000, orders: 9800 },
  { id: 3, name: 'New York', revenue: 860000, orders: 7500 },
  { id: 4, name: 'Florida', revenue: 720000, orders: 6800 },
  { id: 5, name: 'Illinois', revenue: 510000, orders: 5100 },
  { id: 6, name: 'Pennsylvania', revenue: 410000, orders: 4300 },
  { id: 7, name: 'Ohio', revenue: 380000, orders: 4100 },
  { id: 8, name: 'Georgia', revenue: 370000, orders: 3900 },
  { id: 9, name: 'North Carolina', revenue: 340000, orders: 3600 },
  { id: 10, name: 'Michigan', revenue: 310000, orders: 3300 },
];

// Monthly trends
export const monthlyData: MonthlyData[] = [
  { month: 'Jan', orders: 4200, revenue: 420000 },
  { month: 'Feb', orders: 4500, revenue: 450000 },
  { month: 'Mar', orders: 4800, revenue: 510000 },
  { month: 'Apr', orders: 5300, revenue: 550000 },
  { month: 'May', orders: 5800, revenue: 610000 },
  { month: 'Jun', orders: 6200, revenue: 680000 },
  { month: 'Jul', orders: 6700, revenue: 720000 },
  { month: 'Aug', orders: 6500, revenue: 700000 },
  { month: 'Sep', orders: 6200, revenue: 650000 },
  { month: 'Oct', orders: 5900, revenue: 620000 },
  { month: 'Nov', orders: 6400, revenue: 690000 },
  { month: 'Dec', orders: 7100, revenue: 780000 },
];

// Customer rating distribution
export const ratingDistribution = [
  { rating: 1, count: 520 },
  { rating: 2, count: 1540 },
  { rating: 3, count: 3670 },
  { rating: 4, count: 18500 },
  { rating: 5, count: 25770 },
];

// Product data
export const productData: Product[] = [
  // Best rated products
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 129, shippingCost: 8, weight: 0.3, rating: 4.9, deliveryTime: 2.1, estimatedDeliveryTime: 3, region: 'California' },
  { id: 2, name: 'Cotton T-Shirt', category: 'Fashion', price: 25, shippingCost: 5, weight: 0.2, rating: 4.8, deliveryTime: 1.5, estimatedDeliveryTime: 2, region: 'Texas' },
  { id: 3, name: 'Classic Novel Collection', category: 'Books', price: 49, shippingCost: 7, weight: 1.2, rating: 4.9, deliveryTime: 2.0, estimatedDeliveryTime: 2.5, region: 'New York' },
  { id: 4, name: 'Organic Face Cream', category: 'Beauty', price: 35, shippingCost: 4, weight: 0.15, rating: 4.9, deliveryTime: 1.8, estimatedDeliveryTime: 2, region: 'Florida' },
  { id: 5, name: 'Smart Watch', category: 'Electronics', price: 199, shippingCost: 6, weight: 0.25, rating: 4.8, deliveryTime: 2.3, estimatedDeliveryTime: 3, region: 'California' },
  
  // Worst rated products
  { id: 6, name: 'Budget Blender', category: 'Home & Kitchen', price: 27, shippingCost: 12, weight: 2.8, rating: 2.1, deliveryTime: 6.5, estimatedDeliveryTime: 4, region: 'Texas' },
  { id: 7, name: 'Generic Phone Case', category: 'Electronics', price: 12, shippingCost: 6, weight: 0.1, rating: 2.3, deliveryTime: 5.7, estimatedDeliveryTime: 3, region: 'Illinois' },
  { id: 8, name: 'Synthetic Rug', category: 'Home & Kitchen', price: 79, shippingCost: 18, weight: 4.5, rating: 2.4, deliveryTime: 7.2, estimatedDeliveryTime: 5, region: 'Georgia' },
  { id: 9, name: 'Basic Car Charger', category: 'Automotive', price: 15, shippingCost: 5, weight: 0.2, rating: 2.6, deliveryTime: 4.8, estimatedDeliveryTime: 3, region: 'Michigan' },
  { id: 10, name: 'Non-Stick Pan', category: 'Home & Kitchen', price: 22, shippingCost: 9, weight: 1.3, rating: 2.7, deliveryTime: 5.1, estimatedDeliveryTime: 4, region: 'Ohio' },
  
  // Additional products for variety
  { id: 11, name: 'Yoga Mat', category: 'Sports', price: 45, shippingCost: 8, weight: 1.8, rating: 4.5, deliveryTime: 2.7, estimatedDeliveryTime: 3, region: 'California' },
  { id: 12, name: 'Pet Food Bowl', category: 'Pet Supplies', price: 18, shippingCost: 6, weight: 0.6, rating: 4.4, deliveryTime: 2.9, estimatedDeliveryTime: 3, region: 'Texas' },
  { id: 13, name: 'Protein Supplements', category: 'Health', price: 55, shippingCost: 7, weight: 1.1, rating: 4.6, deliveryTime: 2.4, estimatedDeliveryTime: 3, region: 'Florida' },
  { id: 14, name: 'Board Game', category: 'Toys & Games', price: 37, shippingCost: 9, weight: 1.4, rating: 4.7, deliveryTime: 2.6, estimatedDeliveryTime: 3, region: 'New York' },
  { id: 15, name: 'Desk Lamp', category: 'Home & Kitchen', price: 42, shippingCost: 10, weight: 1.2, rating: 4.1, deliveryTime: 3.2, estimatedDeliveryTime: 3, region: 'Illinois' },
];

// Overall KPIs
export const overallKpis = {
  totalOrders: 60000,
  totalRevenue: 6500000,
  averageProductPrice: 108,
  averageDeliveryTime: 3.1,
  averageCustomerRating: 4.4,
  percentLateDeliveries: 17.5,
  returnsCount: 2180,
};

// Profitability by category
export const profitabilityData = categoryData.map(category => ({
  name: category.name,
  profitRatio: category.profitRatio,
  averageRating: category.averageRating
}));
