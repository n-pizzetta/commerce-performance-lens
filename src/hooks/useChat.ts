import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import chatApi from '@/api/chatApi';

interface UseChatOptions {
  initialMessages?: Message[];
  persistSession?: boolean;
  sessionStorageKey?: string;
}

export function useChat({
  initialMessages = [],
  persistSession = true,
  sessionStorageKey = 'bagunca_chat_session'
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Récupérer ou créer une session au montage du composant
  useEffect(() => {
    // Ne rien faire si pas de persistance
    if (!persistSession) return;

    // Vérifier si un sessionId existe dans le localStorage
    const savedSessionId = localStorage.getItem(sessionStorageKey);
    if (savedSessionId) {
      setSessionId(savedSessionId);
      
      // Récupérer l'historique des messages pour cette session
      const history = chatApi.getHistory(savedSessionId);
      if (history && history.length > 0) {
        setMessages(history);
      }
    } else {
      // Initialiser une nouvelle session
      const newSession = chatApi.sendMessage({ message: '' });
      newSession.then(response => {
        setSessionId(response.sessionId);
        if (persistSession) {
          localStorage.setItem(sessionStorageKey, response.sessionId);
        }
      });
    }
  }, [persistSession, sessionStorageKey]);

  // Envoyer un message et obtenir une réponse
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    
    // Ajouter le message utilisateur à la liste locale
    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Appel à l'API du chatbot
      const response = await chatApi.sendMessage({
        message: messageContent,
        sessionId
      });
      
      // Sauvegarder le sessionId si nécessaire
      if (response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
        if (persistSession) {
          localStorage.setItem(sessionStorageKey, response.sessionId);
        }
      }
      
      // Ajouter la réponse à la liste locale
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError(error.message || 'Une erreur est survenue');
      
      // Ajouter un message d'erreur
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Effacer l'historique de la conversation
  const clearMessages = () => {
    // Garder uniquement le message initial de bienvenue
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Bonjour! Je suis l\'assistant IA de La Bagunça. Comment puis-je vous aider avec vos données?',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Créer une nouvelle session
    if (persistSession) {
      localStorage.removeItem(sessionStorageKey);
      const newSession = chatApi.sendMessage({ message: '' });
      newSession.then(response => {
        setSessionId(response.sessionId);
        localStorage.setItem(sessionStorageKey, response.sessionId);
      });
    }
  };

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages
  };
}

export default useChat; 