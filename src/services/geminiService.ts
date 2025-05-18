import { Message } from '@/types/chat';
import { retrieveRelevantContext } from '@/utils/chatKnowledgeBase';

// Types pour l'API Gemini
interface GeminiRequest {
  message: string;
  context?: any;
  history?: Message[];
  options?: GeminiOptions;
}

interface GeminiResponse {
  text: string;
  status: 'success' | 'error';
  error?: string;
}

// Options de configuration pour l'API Gemini
interface GeminiOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

// Configuration par défaut
const DEFAULT_OPTIONS: GeminiOptions = {
  temperature: 0.2,
  maxTokens: 1024,
  topP: 0.95,
  topK: 40
};

const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

/**
 * Formate une valeur monétaire en reais brésiliens
 */
const fmtCurrency = (n: number) => new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(n);

// Simuler le système de prompting pour Gemini
const createPrompt = (request: GeminiRequest) => {
  // Construire un système de prompting efficace pour Gemini
  let prompt = `Tu es un assistant d'analyse de données pour La Bagunça, un E-commerce brésilien.
Ton rôle est d'aider les utilisateurs à analyser et comprendre leurs données commerciales.
Réponds de manière concise, précise et professionnelle en français.
Utilise toujours le symbole "R$" pour les valeurs monétaires car La Bagunça est une entreprise brésilienne qui utilise le real brésilien.
Formate les nombres au format brésilien : utilise des points comme séparateurs de milliers et des virgules pour les décimales (exemple : R$ 1.234,56).
`;

  // Récupérer le contexte pertinent de la base de connaissances
  const ragContext = retrieveRelevantContext(request.message);
  if (ragContext) {
    prompt += `Contexte spécifique pour cette question:
${ragContext}

`;
  }

  prompt += `Contexte des données actuelles:`;

  // Ajouter le contexte des données si disponible
  if (request.context) {
    console.log("Contexte des données reçu:", JSON.stringify(request.context, null, 2));
    
    const { kpis, topCategories, topRegions } = request.context;
    
    if (kpis) {
      prompt += `
- Chiffre d'affaires total: ${kpis.totalRevenue ? `R$ ${fmtCurrency(kpis.totalRevenue)}` : 'Non disponible'}
- Nombre total de commandes: ${kpis.totalOrders || 'Non disponible'}
- Prix moyen: ${kpis.averageProductPrice ? `R$ ${fmtCurrency(kpis.averageProductPrice)}` : 'Non disponible'}
- Délai moyen de livraison: ${kpis.averageDeliveryTime || 'Non disponible'}
- Note client moyenne: ${kpis.averageCustomerRating || 'Non disponible'}`;
    }

    if (topCategories && topCategories.length > 0) {
      prompt += `\n- Top catégories: ${topCategories.map((c: any) => `${c.name} (R$ ${fmtCurrency(c.revenue || 0)})`).join(', ')}`;
    }

    if (topRegions && topRegions.length > 0) {
      prompt += `\n- Top régions: ${topRegions.map((r: any) => `${r.name} (R$ ${fmtCurrency(r.revenue || 0)})`).join(', ')}`;
    }
  } else {
    console.warn("Aucun contexte de données n'a été fourni à l'API");
    prompt += "\nAucune donnée contextuelle n'est disponible actuellement.";
  }

  // Ajouter l'historique des messages
  if (request.history && request.history.length > 0) {
    prompt += '\n\nHistorique de la conversation:';
    request.history.forEach((msg) => {
      if (msg.role === 'user') {
        prompt += `\nUtilisateur: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        prompt += `\nAssistant: ${msg.content}`;
      }
    });
  }

  // Ajouter la question actuelle
  prompt += `\n\nQuestion de l'utilisateur: ${request.message}`;
  prompt += '\n\nRéponds de manière concise et factuelle en te basant sur les données fournies et le contexte spécifique. Si tu ne connais pas la réponse, indique-le clairement.';

  return prompt;
};

// Obtenir la clé API depuis les variables d'environnement
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('Clé API Gemini non trouvée ou vide dans les variables d\'environnement. La variable VITE_GEMINI_API_KEY est définie mais sans valeur.');
    return '';
  }
  
  return apiKey;
};

// Service pour Gemini API
export const geminiService = {
  // Appel à l'API Gemini
  callGeminiAPI: async (request: GeminiRequest): Promise<GeminiResponse> => {
    try {
      const apiKey = getApiKey();
      const options = { ...DEFAULT_OPTIONS, ...request.options };
      const prompt = createPrompt(request);
      
      console.log("📝 Prompt envoyé à Gemini:", prompt);
      
      // Si pas de clé API, on utilise la simulation
      if (!apiKey) {
        console.warn('Utilisation de la simulation car pas de clé API Gemini');
        return simulateResponse(request);
      }
      
      // Appel réel à l'API Gemini 1.5 Flash
      const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
      
      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: options.temperature,
            topK: options.topK,
            topP: options.topP,
            maxOutputTokens: options.maxTokens,
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Log pour debugging
        console.log("Réponse Gemini:", data);
        
        // Extraction du texte généré par Gemini
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        return {
          text: generatedText,
          status: 'success'
        };
      } else {
        console.error("Erreur API Gemini:", data);
        throw new Error(data.error?.message || 'Erreur lors de l\'appel à Gemini API');
      }
    } catch (error: any) {
      console.error('Erreur geminiService:', error);
      return {
        text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        status: 'error',
        error: error.message || 'Erreur inconnue'
      };
    }
  }
};

// Fonction de simulation pour le développement local sans clé API
const simulateResponse = (request: GeminiRequest): Promise<GeminiResponse> => {
  return new Promise((resolve) => {
    // Récupérer le contexte pertinent de la base de connaissances
    const ragContext = retrieveRelevantContext(request.message);
    
    // Simulation de réponses basées sur des mots-clés pour le développement
    let simulatedResponse = '';
    const question = request.message.toLowerCase();
    
    // Utiliser le contexte RAG pour déterminer la réponse la plus appropriée
    if (ragContext) {
      if (question.includes('région') && question.includes('ca')) {
        simulatedResponse = 'Selon les données actuelles, la région qui génère le plus de chiffre d\'affaires est São Paulo, suivie par Rio de Janeiro et Minas Gerais. São Paulo représente environ 35% du CA total avec R$ 1.245.000,00.';
      } else if (question.includes('catégorie') || question.includes('produit')) {
        simulatedResponse = 'Les vêtements sont la catégorie la plus vendue, représentant 28% du chiffre d\'affaires total avec R$ 850.000,00. Les t-shirts et les jeans sont particulièrement populaires, suivis par les accessoires avec 22% (R$ 670.000,00).';
      } else if (question.includes('satisfaction') || question.includes('client')) {
        simulatedResponse = 'La note moyenne de satisfaction client est de 4,3/5. Les aspects les mieux notés sont la qualité des produits (4,7/5) et la livraison (4,2/5). Nous avons identifié que les retards de livraison sont la principale cause d\'insatisfaction.';
      } else if (question.includes('livraison') || question.includes('délai')) {
        simulatedResponse = 'Le délai moyen de livraison est de 8,5 jours. 12% des livraisons sont considérées en retard (plus de 15 jours). Les livraisons sont plus rapides dans les grandes villes comme São Paulo (5,3 jours) et Rio de Janeiro (6,1 jours).';
      } else if (question.includes('rentabilité') || question.includes('profit')) {
        simulatedResponse = 'Les accessoires sont la catégorie la plus rentable avec un ratio de profit de 0,72, suivis par les chaussures (0,65). Les vêtements ont un ratio moyen de 0,58. La rentabilité est calculée en tenant compte du prix de vente, des coûts de production et d\'expédition.';
      } else if (question.includes('tendance') || question.includes('évolution')) {
        simulatedResponse = 'Les ventes montrent une tendance à la hausse avec des pics en novembre et décembre (période des fêtes). Le premier trimestre 2023 a connu une augmentation de 15% par rapport à la même période en 2022. Les catégories saisonnières comme les maillots de bain connaissent des variations importantes.';
      } else if (question.includes('prix') || question.includes('tarif')) {
        simulatedResponse = 'Le prix moyen des produits est de R$ 120,50. Il varie considérablement selon les catégories : vêtements (R$ 89,90), accessoires (R$ 45,75), chaussures (R$ 175,30). Les prix sont exprimés en reais brésiliens et suivent la stratégie de positionnement milieu de gamme de La Bagunça.';
      } else if (question.includes('expédition') || question.includes('frais')) {
        simulatedResponse = 'Le coût moyen d\'expédition est de R$ 18,75 par commande, soit environ 15% du prix moyen des produits. Ces coûts varient selon le poids et la distance, avec des frais plus élevés pour les régions éloignées comme l\'Amazonas et le Acre.';
      } else if (question.includes('négatif') || question.includes('insatisfaction')) {
        simulatedResponse = 'Les principales causes d\'insatisfaction client sont les retards de livraison (45% des avis négatifs), les problèmes de taille/ajustement (30%) et la qualité inférieure aux attentes (15%). Le dashboard indique 87 avis négatifs ce mois-ci, soit 7,5% du total des évaluations.';
      } else if (question.includes('bestseller') || question.includes('plus vendu')) {
        simulatedResponse = 'Le produit le plus vendu en volume est le T-shirt "Carioca" avec 5.200 unités vendues, générant R$ 259.740,00 de chiffre d\'affaires. En termes de CA, le Jean "Copacabana" est en tête avec R$ 346.115,00 pour 3.850 unités vendues. Les collections éco-responsables montrent la plus forte croissance (+35%).';
      } else {
        simulatedResponse = `Voici une analyse basée sur les données de La Bagunça concernant "${request.message}". Les KPIs principaux montrent un chiffre d'affaires total de R$ 3.560.000,00, avec 28.450 commandes et une note client moyenne de 4,3/5. Ces données sont filtrables par année, région et catégorie dans le dashboard.`;
      }
    } else {
      // Réponse par défaut si aucun contexte pertinent n'est trouvé
      simulatedResponse = `Voici une analyse basée sur les données de La Bagunça concernant "${request.message}". Cette réponse est simulée car aucune clé API Gemini n'est configurée.`;
    }
    
    setTimeout(() => {
      resolve({
        text: simulatedResponse,
        status: 'success',
      });
    }, 1500);
  });
};

export default geminiService; 