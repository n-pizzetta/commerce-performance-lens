import React from 'react';
import { AlertCircle, MessageSquare, TrendingUp } from 'lucide-react';

interface RecommendationCardProps {
  title?: string;
  recommendation: string | null;
  review?: string;
  categoryName?: string;
  productName?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  title,
  recommendation,
  review,
  categoryName,
  productName
}) => {
  // Si aucune recommandation n'est disponible
  if (!recommendation) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <p className="text-center text-gray-600 dark:text-gray-400">
          Pas de recommandation disponible pour {productName ? 'ce produit' : categoryName ? 'cette catégorie' : 'cette sélection'}.
        </p>
      </div>
    );
  }

  // Pour un produit (avec review)
  if (review) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border-l-4 border-amber-500">
          <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center">
            <MessageSquare size={18} className="mr-2" />
            Commentaire client
          </h4>
          <p className="italic text-gray-700 dark:text-gray-300 mb-4">
            {review}
          </p>
          <h4 className="font-medium text-emerald-700 dark:text-emerald-400 mb-1 flex items-center">
            <TrendingUp size={18} className="mr-2" />
            Recommandation
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            {recommendation}
          </p>
        </div>
      </div>
    );
  }

  // Pour une catégorie (sans review)
  return (
    <div className="flex flex-col space-y-4">
      {categoryName && (
        <div className="text-center mb-2">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {categoryName}
          </div>
        </div>
      )}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-md border-l-4 border-emerald-500">
        <h4 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2 flex items-center">
          <TrendingUp size={18} className="mr-2" />
          {title || "Recommandation"}
        </h4>
        <p className="text-gray-700 dark:text-gray-300">
          {recommendation}
        </p>
      </div>
    </div>
  );
};

export default RecommendationCard;
