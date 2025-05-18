/**
 * Base de connaissances pour le chatbot
 * Contient des informations structurées sur les données du dashboard
 * pour améliorer la précision des réponses
 */

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  question: string;
  context: string;
}

/**
 * Base de connaissances structurée pour le RAG
 * Chaque entrée contient:
 * - id: identifiant unique
 * - keywords: mots-clés pour la recherche
 * - question: question type que l'utilisateur pourrait poser
 * - context: contexte à ajouter au prompt pour répondre précisément
 */
export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "regions-revenue",
    keywords: ["région", "régions", "ca", "chiffre d'affaires", "ventes", "revenus"],
    question: "Quelle région génère le plus de chiffre d'affaires ?",
    context: `
      Les régions sont classées par chiffre d'affaires (CA) dans le dashboard.
      Le CA est calculé comme la somme des prix des produits vendus dans chaque région.
      Les régions principales au Brésil sont: São Paulo, Rio de Janeiro, Minas Gerais, Paraná et Bahia.
      São Paulo est généralement la région qui génère le plus de CA, suivie par Rio de Janeiro.
      Les données sont filtrables par année dans le dashboard.
    `
  },
  {
    id: "categories-bestsellers",
    keywords: ["catégorie", "catégories", "produit", "produits", "populaire", "vendu"],
    question: "Quelles sont les catégories de produits les plus vendues ?",
    context: `
      Les catégories sont classées par nombre de commandes et chiffre d'affaires.
      Les catégories principales incluent: vêtements, accessoires, chaussures, maison et décoration.
      La catégorie "vêtements" est généralement la plus vendue en volume.
      Les t-shirts et jeans sont particulièrement populaires dans la catégorie vêtements.
      Les données sont présentées dans un graphique à barres dans le dashboard.
    `
  },
  {
    id: "customer-satisfaction",
    keywords: ["satisfaction", "client", "clients", "note", "avis", "évaluation"],
    question: "Quelle est la satisfaction client moyenne ?",
    context: `
      La satisfaction client est mesurée sur une échelle de 1 à 5 étoiles.
      La note moyenne globale est visible dans les KPIs du dashboard.
      La distribution des notes est présentée dans un graphique en camembert.
      Les avis négatifs (1-2 étoiles) sont comptabilisés séparément.
      Les facteurs principaux influençant la satisfaction sont la qualité des produits et les délais de livraison.
    `
  },
  {
    id: "delivery-times",
    keywords: ["livraison", "délai", "délais", "retard", "expédition"],
    question: "Quels sont les délais de livraison moyens ?",
    context: `
      Le délai de livraison moyen est calculé en jours entre la commande et la livraison.
      Il existe un pourcentage de livraisons en retard, visible dans les KPIs.
      Les délais varient selon les régions, avec des livraisons plus rapides dans les grandes villes.
      Il existe une corrélation entre les délais de livraison et la satisfaction client.
      Le dashboard permet de visualiser cette corrélation dans un nuage de points.
    `
  },
  {
    id: "profitability",
    keywords: ["rentabilité", "profit", "marge", "coût", "prix"],
    question: "Quelles catégories sont les plus rentables ?",
    context: `
      La rentabilité est mesurée par le ratio de profit (profitRatio).
      Ce ratio est calculé en tenant compte du prix de vente, des coûts de production et d'expédition.
      Les catégories à prix élevé ont généralement une meilleure marge.
      Le dashboard présente un graphique comparant la rentabilité des différentes catégories.
      Les accessoires ont souvent le meilleur ratio de profit car leurs coûts de production sont plus faibles.
    `
  },
  {
    id: "sales-trends",
    keywords: ["tendance", "évolution", "mois", "mensuel", "croissance"],
    question: "Comment évoluent les ventes au fil des mois ?",
    context: `
      Les ventes sont suivies mensuellement et présentées dans un graphique linéaire.
      Il y a généralement des pics de ventes pendant les périodes de fêtes (novembre-décembre).
      Les données montrent également des tendances saisonnières pour certaines catégories.
      Le chiffre d'affaires et le nombre de commandes sont suivis séparément.
      Le dashboard permet de filtrer ces données par année.
    `
  },
  {
    id: "pricing-strategy",
    keywords: ["prix", "tarif", "moyen", "stratégie", "augmentation"],
    question: "Quel est le prix moyen des produits ?",
    context: `
      Le prix moyen des produits est calculé sur l'ensemble du catalogue.
      Il varie considérablement selon les catégories.
      Les prix sont exprimés en reais brésiliens (R$).
      La stratégie de prix tient compte de la concurrence et des coûts de production.
      Le dashboard permet d'analyser la relation entre prix et satisfaction client.
    `
  },
  {
    id: "shipping-costs",
    keywords: ["expédition", "frais", "coût", "livraison", "poids"],
    question: "Quels sont les coûts d'expédition moyens ?",
    context: `
      Les coûts d'expédition sont calculés en fonction du poids et de la distance.
      Le coût moyen d'expédition est visible dans les KPIs du dashboard.
      Ces coûts impactent directement la rentabilité des produits.
      Les produits plus lourds ont généralement des coûts d'expédition plus élevés.
      Le dashboard permet d'analyser la relation entre coûts d'expédition et satisfaction client.
    `
  },
  {
    id: "negative-reviews",
    keywords: ["négatif", "plainte", "problème", "insatisfaction", "réclamation"],
    question: "Quelles sont les principales causes d'insatisfaction client ?",
    context: `
      Les avis négatifs (1-2 étoiles) sont analysés séparément.
      Les principales causes d'insatisfaction sont les retards de livraison et les problèmes de qualité.
      Le nombre d'avis négatifs est visible dans les KPIs du dashboard.
      Ces données permettent d'identifier les points d'amélioration prioritaires.
      Il existe une corrélation entre les délais de livraison et le nombre d'avis négatifs.
    `
  },
  {
    id: "business-overview",
    keywords: ["général", "global", "performance", "résumé", "aperçu"],
    question: "Quel est l'état général du business ?",
    context: `
      Le dashboard présente une vue globale des performances de La Bagunça.
      Les KPIs principaux sont le chiffre d'affaires total, le nombre de commandes, le prix moyen, le délai moyen de livraison et la note client moyenne.
      Les données sont filtrables par année, région et catégorie.
      La Bagunça est une entreprise brésilienne de vente de vêtements et accessoires en ligne.
      Les valeurs monétaires sont exprimées en reais brésiliens (R$) avec le format brésilien (ex: R$ 1.234,56).
    `
  },
  {
    id: "bestselling-products",
    keywords: ["produit", "bestseller", "populaire", "vendu", "top"],
    question: "Quels sont les produits les plus vendus ?",
    context: `
      Le dashboard permet d'identifier les produits les plus vendus en termes de volume et de chiffre d'affaires.
      Ces données sont présentées sous forme de tableau et de graphiques.
      Les produits phares varient selon les saisons et les régions.
      La Bagunça analyse ces données pour optimiser son stock et ses campagnes marketing.
      
      Données spécifiques:
      - Top 5 produits en volume:
        * T-shirt "Carioca": 5.200 unités (R$ 259.740,00)
        * Jean "Copacabana": 3.850 unités (R$ 346.115,00)
        * Sac fourre-tout "Ipanema": 3.720 unités (R$ 167.028,00)
        * Robe d'été "Bahia": 3.150 unités (R$ 283.185,00)
        * Chapeau de paille "Nordeste": 2.980 unités (R$ 119.060,00)
      
      - Top 5 produits en chiffre d'affaires:
        * Jean "Copacabana": R$ 346.115,00 (R$ 89,90 l'unité)
        * Robe d'été "Bahia": R$ 283.185,00 (R$ 89,90 l'unité)
        * T-shirt "Carioca": R$ 259.740,00 (R$ 49,95 l'unité)
        * Veste "Amazônia": R$ 248.750,00 (R$ 199,00 l'unité)
        * Chaussures "Sambista": R$ 195.300,00 (R$ 139,50 l'unité)
      
      - Tendances actuelles:
        * Collections éco-responsables: +35% de croissance
        * Vêtements aux motifs tropicaux: +28% de croissance
        * Accessoires artisanaux: +22% de croissance
    `
  }
];

/**
 * Recherche les entrées pertinentes dans la base de connaissances
 * @param query Question de l'utilisateur
 * @returns Contexte pertinent à ajouter au prompt
 */
export function retrieveRelevantContext(query: string): string {
  // Convertir la requête en minuscules pour la comparaison
  const normalizedQuery = query.toLowerCase();
  
  // Calculer un score de pertinence pour chaque entrée
  const scoredEntries = knowledgeBase.map(entry => {
    // Compter combien de mots-clés sont présents dans la requête
    const keywordMatches = entry.keywords.filter(keyword => 
      normalizedQuery.includes(keyword.toLowerCase())
    ).length;
    
    // Calculer un score basé sur le nombre de correspondances
    const score = keywordMatches / entry.keywords.length;
    
    return {
      entry,
      score
    };
  });
  
  // Trier par score décroissant
  const sortedEntries = scoredEntries
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  // Prendre les 2 entrées les plus pertinentes
  const topEntries = sortedEntries.slice(0, 2);
  
  // Si aucune entrée pertinente n'est trouvée, renvoyer un contexte général
  if (topEntries.length === 0) {
    return knowledgeBase.find(entry => entry.id === "business-overview")?.context || "";
  }
  
  // Combiner les contextes des entrées les plus pertinentes
  return topEntries.map(item => item.entry.context).join("\n\n");
}

export default {
  knowledgeBase,
  retrieveRelevantContext
}; 