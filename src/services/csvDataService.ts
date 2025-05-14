
import Papa from 'papaparse';
import { 
  Customer, 
  Geolocation, 
  OrderItem, 
  OrderPayment, 
  OrderReview, 
  Order,
  Product,
  Seller,
  Category,
  Region,
  MonthlyData,
  EnrichedProduct
} from '@/utils/mockData';

// Function to parse CSV files
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to load CSV file from user input
export const loadCsvFromInput = async (file: File): Promise<any[]> => {
  try {
    const data = await parseCSV(file);
    return data;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw error;
  }
};

// Transform customers data
export const transformCustomers = (data: any[]): Customer[] => {
  return data.map(item => ({
    customer_id: item.customer_id,
    customer_unique_id: item.customer_unique_id,
    customer_zip_code_prefix: item.customer_zip_code_prefix,
    customer_city: item.customer_city,
    customer_state: item.customer_state
  }));
};

// Transform geolocation data
export const transformGeolocation = (data: any[]): Geolocation[] => {
  return data.map(item => ({
    geolocation_zip_code_prefix: item.geolocation_zip_code_prefix,
    geolocation_lat: parseFloat(item.geolocation_lat),
    geolocation_lng: parseFloat(item.geolocation_lng),
    geolocation_city: item.geolocation_city,
    geolocation_state: item.geolocation_state
  }));
};

// Transform order items data
export const transformOrderItems = (data: any[]): OrderItem[] => {
  return data.map(item => ({
    order_id: item.order_id,
    order_item_id: parseInt(item.order_item_id),
    product_id: item.product_id,
    seller_id: item.seller_id,
    shipping_limit_date: item.shipping_limit_date,
    price: parseFloat(item.price),
    freight_value: parseFloat(item.freight_value)
  }));
};

// Transform order payments data
export const transformOrderPayments = (data: any[]): OrderPayment[] => {
  return data.map(item => ({
    order_id: item.order_id,
    payment_sequential: parseInt(item.payment_sequential),
    payment_type: item.payment_type,
    payment_installments: parseInt(item.payment_installments),
    payment_value: parseFloat(item.payment_value)
  }));
};

// Transform order reviews data
export const transformOrderReviews = (data: any[]): OrderReview[] => {
  return data.map(item => ({
    review_id: item.review_id,
    order_id: item.order_id,
    review_score: parseInt(item.review_score),
    review_comment_title: item.review_comment_title || '',
    review_comment_message: item.review_comment_message || '',
    review_creation_date: item.review_creation_date,
    review_answer_timestamp: item.review_answer_timestamp
  }));
};

// Transform orders data
export const transformOrders = (data: any[]): Order[] => {
  return data.map(item => ({
    order_id: item.order_id,
    customer_id: item.customer_id,
    order_status: item.order_status,
    order_purchase_timestamp: item.order_purchase_timestamp,
    order_approved_at: item.order_approved_at,
    order_delivered_carrier_date: item.order_delivered_carrier_date,
    order_delivered_customer_date: item.order_delivered_customer_date,
    order_estimated_delivery_date: item.order_estimated_delivery_date
  }));
};

// Transform products data
export const transformProducts = (data: any[], translations?: any[]): Product[] => {
  return data.map(item => {
    const product: Product = {
      product_id: item.product_id,
      product_category_name: item.product_category_name,
      product_name_lenght: parseInt(item.product_name_lenght || '0'),
      product_description_lenght: parseInt(item.product_description_lenght || '0'),
      product_photos_qty: parseInt(item.product_photos_qty || '0'),
      product_weight_g: parseFloat(item.product_weight_g || '0'),
      product_length_cm: parseFloat(item.product_length_cm || '0'),
      product_height_cm: parseFloat(item.product_height_cm || '0'),
      product_width_cm: parseFloat(item.product_width_cm || '0')
    };
    
    if (translations) {
      const translation = translations.find(t => t.product_category_name === item.product_category_name);
      if (translation) {
        product.category_english = translation.product_category_name_english;
      }
    }
    
    return product;
  });
};

// Transform sellers data
export const transformSellers = (data: any[]): Seller[] => {
  return data.map(item => ({
    seller_id: item.seller_id,
    seller_zip_code_prefix: item.seller_zip_code_prefix,
    seller_city: item.seller_city,
    seller_state: item.seller_state
  }));
};

// Generate dashboard data from raw data
export const generateDashboardData = (
  products: Product[],
  orderItems: OrderItem[],
  orders: Order[],
  reviews: OrderReview[]
): {
  categories: Category[];
  regions: Region[];
  monthlyData: MonthlyData[];
  enrichedProducts: EnrichedProduct[];
} => {
  // This is a simplified implementation - would need to be expanded based on your actual data
  
  // Group products by category
  const categoriesMap = new Map<string, {
    orders: number;
    revenue: number;
    totalPrice: number;
    totalRating: number;
    ratingCount: number;
    totalDeliveryTime: number;
    deliveryCount: number;
  }>();
  
  // For each order item, calculate metrics
  orderItems.forEach(item => {
    const product = products.find(p => p.product_id === item.product_id);
    if (!product) return;
    
    const category = product.category_english || product.product_category_name;
    const order = orders.find(o => o.order_id === item.order_id);
    const review = reviews.find(r => r.order_id === item.order_id);
    
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, {
        orders: 0,
        revenue: 0,
        totalPrice: 0,
        totalRating: 0,
        ratingCount: 0,
        totalDeliveryTime: 0,
        deliveryCount: 0
      });
    }
    
    const categoryData = categoriesMap.get(category)!;
    categoryData.orders += 1;
    categoryData.revenue += item.price;
    categoryData.totalPrice += item.price;
    
    if (review) {
      categoryData.totalRating += review.review_score;
      categoryData.ratingCount += 1;
    }
    
    if (order && order.order_delivered_customer_date && order.order_purchase_timestamp) {
      const deliveryTime = calculateDeliveryDays(order.order_purchase_timestamp, order.order_delivered_customer_date);
      categoryData.totalDeliveryTime += deliveryTime;
      categoryData.deliveryCount += 1;
    }
  });
  
  // Transform to Category array
  const categories: Category[] = Array.from(categoriesMap.entries()).map(([name, data], index) => ({
    id: index + 1,
    name,
    revenue: data.revenue,
    orders: data.orders,
    averagePrice: data.orders > 0 ? data.totalPrice / data.orders : 0,
    averageRating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
    averageDeliveryTime: data.deliveryCount > 0 ? data.totalDeliveryTime / data.deliveryCount : 0,
    profitRatio: 0.65 // This would need to be calculated based on your business logic
  }));
  
  // Simple placeholder for regions
  const regions: Region[] = [
    { id: 1, name: 'SP', revenue: 0, orders: 0 },
    { id: 2, name: 'RJ', revenue: 0, orders: 0 },
    // More would be generated from actual data
  ];
  
  // Simple placeholder for monthly data
  const monthlyData: MonthlyData[] = [
    { month: 'Jan', orders: 0, revenue: 0 },
    { month: 'Feb', orders: 0, revenue: 0 },
    // More would be generated from actual data
  ];
  
  // Sample enriched products
  const enrichedProducts: EnrichedProduct[] = [];
  // Would be populated from your actual data
  
  return {
    categories,
    regions,
    monthlyData,
    enrichedProducts
  };
};

// Helper function to calculate delivery days
const calculateDeliveryDays = (purchaseDate: string, deliveryDate: string): number => {
  const purchase = new Date(purchaseDate);
  const delivery = new Date(deliveryDate);
  const diffTime = Math.abs(delivery.getTime() - purchase.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
