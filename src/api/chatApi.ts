import { Message } from '@/types/chat';
import geminiService from '@/services/geminiService';

// Types pour les requêtes du chatbot
export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: any;
}

export interface ChatResponse {
  answer: string;
  success: boolean;
  error?: string;
  sessionId: string;
}

// Interface pour le stockage temporaire des sessions
interface SessionStore {
  [sessionId: string]: {
    messages: Message[];
    createdAt: Date;
    lastActivity: Date;
  };
}

// Gestionnaire simple de sessions en mémoire (à remplacer par un stockage persistant dans une vraie application)
class SessionManager {
  private sessions: SessionStore = {};
  
  // Générer un ID de session unique
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // Créer ou récupérer une session existante
  getOrCreateSession(sessionId?: string): string {
    // Si pas d'ID fourni ou session expirée, en créer une nouvelle
    if (!sessionId || !this.sessions[sessionId]) {
      const newSessionId = this.generateSessionId();
      this.sessions[newSessionId] = {
        messages: [{
          role: 'assistant',
          content: 'Bonjour! Je suis l\'assistant IA de La Bagunça. Comment puis-je vous aider avec vos données?',
          timestamp: new Date()
        }],
        createdAt: new Date(),
        lastActivity: new Date()
      };
      return newSessionId;
    }
    
    // Mettre à jour l'horodatage de dernière activité
    this.sessions[sessionId].lastActivity = new Date();
    return sessionId;
  }
  
  // Ajouter un message à une session
  addMessage(sessionId: string, message: Message): void {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].messages.push(message);
      this.sessions[sessionId].lastActivity = new Date();
    }
  }
  
  // Récupérer les messages d'une session
  getMessages(sessionId: string): Message[] {
    return this.sessions[sessionId]?.messages || [];
  }
  
  // Nettoyer les sessions inactives (pourrait être appelé périodiquement)
  cleanupSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = new Date().getTime();
    Object.keys(this.sessions).forEach(sessionId => {
      const lastActivity = this.sessions[sessionId].lastActivity.getTime();
      if (now - lastActivity > maxAgeMs) {
        delete this.sessions[sessionId];
      }
    });
  }
}

// Instance unique du gestionnaire de sessions
const sessionManager = new SessionManager();

// API du chatbot
export const chatApi = {
  // Envoyer un message et obtenir une réponse
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const { message, sessionId: requestSessionId, context } = request;
      
      // Obtenir ou créer une session
      const sessionId = sessionManager.getOrCreateSession(requestSessionId);
      
      // Récupérer l'historique des messages
      const history = sessionManager.getMessages(sessionId);
      
      // Créer et ajouter le message utilisateur
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      sessionManager.addMessage(sessionId, userMessage);
      
      // Appeler le service Gemini
      const geminiResponse = await geminiService.callGeminiAPI({
        message,
        context,
        history: history.slice(-10) // Limiter l'historique aux 10 derniers messages
      });
      
      // Créer et ajouter la réponse de l'assistant
      const assistantMessage: Message = {
        role: 'assistant',
        content: geminiResponse.text,
        timestamp: new Date()
      };
      sessionManager.addMessage(sessionId, assistantMessage);
      
      // Nettoyer les sessions anciennes
      sessionManager.cleanupSessions();
      
      // Renvoyer la réponse
      return {
        answer: geminiResponse.text,
        success: geminiResponse.status === 'success',
        sessionId
      };
    } catch (error: any) {
      console.error('Erreur chatApi:', error);
      return {
        answer: "Une erreur est survenue lors du traitement de votre message.",
        success: false,
        error: error.message,
        sessionId: request.sessionId || ''
      };
    }
  },
  
  // Récupérer l'historique des messages d'une session
  getHistory: (sessionId: string): Message[] => {
    return sessionManager.getMessages(sessionId);
  }
};

export default chatApi; 