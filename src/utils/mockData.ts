export interface Customer {
  customer_id: string;
  customer_unique_id: string;
  customer_zip_code_prefix: string;
  customer_city: string;
  customer_state: string;
}

export interface Geolocation {
  geolocation_zip_code_prefix: string;
  geolocation_lat: number;
  geolocation_lng: number;
  geolocation_city: string;
  geolocation_state: string;
}

export interface OrderItem {
  order_id: string;
  order_item_id: number;
  product_id: string;
  seller_id: string;
  shipping_limit_date: string;
  price: number;
  freight_value: number;
}

export interface OrderPayment {
  order_id: string;
  payment_sequential: number;
  payment_type: string;
  payment_installments: number;
  payment_value: number;
}

export interface OrderReview {
  review_id: string;
  order_id: string;
  review_score: number;
  review_comment_title: string;
  review_comment_message: string;
  review_creation_date: string;
  review_answer_timestamp: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  order_status: string;
  order_purchase_timestamp: string;
  order_approved_at: string;
  order_delivered_carrier_date: string;
  order_delivered_customer_date: string;
  order_estimated_delivery_date: string;
}

export interface Product {
  product_id: string;
  product_category_name: string;
  product_name_lenght: number;
  product_description_lenght: number;
  product_photos_qty: number;
  product_weight_g: number;
  product_length_cm: number;
  product_height_cm: number;
  product_width_cm: number;
  category_english?: string; // From translation table
}

export interface Seller {
  seller_id: string;
  seller_zip_code_prefix: string;
  seller_city: string;
  seller_state: string;
}

// Existing interfaces for the dashboard (these will bridge between CSV and UI)
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

export interface EnrichedProduct {
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
export interface FactsRow {
  ym:       string;   // "2024-03"
  year:     number;   // 2024
  state:    string;   // "SP"
  category: string;   // "Electronics"
  orders:   number;
  revenue:  number;
}

// Keep existing mock data for now - this will be replaced when CSV data is loaded
// Top categories by revenue from examples.json
export const categoryData: Category[] = [
  { id: 1, name: 'Electronics', revenue: 1250000, orders: 5200, averagePrice: 240, averageRating: 4.2, averageDeliveryTime: 3.1, profitRatio: 0.65 },
  { id: 2, name: 'Fashion', revenue: 980000, orders: 12400, averagePrice: 79, averageRating: 4.5, averageDeliveryTime: 2.1, profitRatio: 0.72 },
  { id: 3, name: 'Home & Kitchen', revenue: 870000, orders: 6800, averagePrice: 128, averageRating: 4.3, averageDeliveryTime: 4.2, profitRatio: 0.58 },
];

// Regional data from examples.json
export const regionData: Region[] = [
  { id: 1, name: 'SP', revenue: 1780000, orders: 14800 },
  { id: 2, name: 'RJ', revenue: 920000, orders: 9600 },
];

// Monthly trends from examples.json
export const monthlyData: MonthlyData[] = [
  { month: '2024-01', orders: 4820, revenue: 510000 },
  { month: '2024-02', orders: 4650, revenue: 498000 },
];

// Customer rating distribution from examples.json
export const ratingDistribution = [
  { rating: 1, count: 520 },
  { rating: 2, count: 1540 },
  { rating: 3, count: 3670 },
  { rating: 4, count: 18500 },
  { rating: 5, count: 25770 },
];

// Product data from examples.json
export const productData: EnrichedProduct[] = [
  // Best rated products
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 129, shippingCost: 8, weight: 0.3, rating: 4.9, deliveryTime: 2.1, estimatedDeliveryTime: 3, region: 'SP' },
  
  // Worst rated products
  { id: 2, name: 'Budget Blender', category: 'Home & Kitchen', price: 27, shippingCost: 12, weight: 2.8, rating: 2.1, deliveryTime: 6.5, estimatedDeliveryTime: 4, region: 'RJ' },
];

// Overall KPIs from examples.json
export const overallKpis = {
  totalOrders: 60234,
  totalRevenue: 6482103.42,
  averageProductPrice: 107.65,
  averageDeliveryTime: 3.1,
  averageCustomerRating: 4.42,
  percentLateDeliveries: 17.5,
  negativeReviews: 2180,
  averagePricePerCategory: 107.6,
  averageShippingCost: 9.8,
  averageProfitRatio: 0.65,
};

// Meta data for filters from examples.json
export const metaData = {
  years: [2022, 2023, 2024],
  months: ["01","02","03","04","05","06","07","08","09","10","11","12"],
  states: ["SP","RJ","MG"],
  categories: ["Electronics","Fashion","Home & Kitchen"]
};

// Profitability by category
export const profitabilityData = categoryData.map(category => ({
  name: category.name,
  profitRatio: category.profitRatio,
  averageRating: category.averageRating
}));

// Function to load and parse CSV files (to be implemented)
export const loadCsvData = async (fileName: string): Promise<any[]> => {
  // This is a placeholder - implementation will depend on how you plan to load the CSV
  // Could be via fetch from a server, or via file input
  console.log(`Loading ${fileName}...`);
  return [];
};

// Function to transform CSV data into dashboard format
export const transformData = (csvData: any): any => {
  // Placeholder for data transformation logic
  return csvData;
};
