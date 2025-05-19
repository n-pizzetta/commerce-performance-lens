import { useDashboardData } from "@/contexts/DataContext";
import { useMemo } from "react";

interface ProductRecommendation {
  productId: string;
  categoryName: string;
  rating: number;
  profitRatio: number;
  review: string;
  recommendation: string;
}

interface CategoryRecommendation {
  categoryName: string;
  recommendation: string;
}

export const useRecommendations = () => {
  const { raw, filters, enrichedProducts } = useDashboardData();

  // Récupération de la recommandation pour une catégorie spécifique
  const categoryRecommendation = useMemo(() => {
    if (!raw?.reviews?.resume_category || filters.category === 'all') {
      return null;
    }

    const recommendation = raw.reviews.resume_category.find(
      (cat: any) => cat.product_category_name_english?.toLowerCase() === filters.category.toLowerCase()
    );

    if (!recommendation) {
      return null;
    }

    return {
      categoryName: filters.category,
      recommendation: recommendation.résume_all_catego
    };
  }, [raw, filters.category]);

  // Récupération de la recommandation pour un produit spécifique
  const productRecommendation = useMemo(() => {
    if (!raw?.reviews?.resume_product || !enrichedProducts) {
      return null;
    }
    
    // Si on a un produit sélectionné
    const selectedProduct = enrichedProducts.find(p => p.id === filters.selectedProductId);
    if (!selectedProduct) {
      return null;
    }
    
    // Nous devons chercher dans les données brutes en utilisant l'ID du produit
    // comme les EnrichedProduct n'ont pas de productId
    const productId = String(selectedProduct.id);
    const recommendation = raw.reviews.resume_product.find(
      (prod: any) => prod.product_id === productId
    );
    
    if (!recommendation) {
      return null;
    }
    
    return {
      productId,
      categoryName: recommendation.product_category_name_english,
      rating: recommendation.rating,
      profitRatio: recommendation.profitRatio,
      review: recommendation.reviews,
      recommendation: recommendation.résume_all_prod
    };
  }, [raw, enrichedProducts, filters.selectedProductId]);

  return {
    categoryRecommendation,
    productRecommendation
  };
};
