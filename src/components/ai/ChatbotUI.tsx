import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Loader, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/contexts/DataContext';
import { Message } from '@/types/chat';
import chatApi from '@/api/chatApi';

const ChatbotUI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showProactiveBubble, setShowProactiveBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour! Je suis l\'assistant IA de La Bagunça. Comment puis-je vous aider avec vos données?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { kpis, categories, regions } = useDashboardData();

  // Suggestion de question
  const suggestion = "Quelle région génère le plus de CA ?";

  // Initialiser ou récupérer la session au chargement
  useEffect(() => {
    // Vérifier si un sessionId existe dans le localStorage
    const savedSessionId = localStorage.getItem('bagunca_chat_session');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Récupérer l'historique des messages
      const history = chatApi.getHistory(savedSessionId);
      if (history && history.length > 0) {
        setMessages(history);
      }
    } else {
      // Créer une nouvelle session
      const newSession = chatApi.sendMessage({ message: '' });
      newSession.then(response => {
        setSessionId(response.sessionId);
        localStorage.setItem('bagunca_chat_session', response.sessionId);
      });
    }
  }, []);

  // Auto-scroll à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Afficher le message proactif après un délai
  useEffect(() => {
    // Attendre 5 secondes avant d'afficher la bulle proactive
    const timer1 = setTimeout(() => {
      setShowProactiveBubble(true);
    }, 5000);
    
    // Masquer la bulle après un délai
    const timer2 = setTimeout(() => {
      setShowProactiveBubble(false);
    }, 15000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || inputValue;
    if ((!messageToSend.trim() || isLoading) && !text) return;
    
    // Ajouter le message utilisateur
    const userMessage: Message = { 
      role: 'user', 
      content: messageToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Préparation du contexte des données pour enrichir la requête
      const dataContext = {
        kpis,
        topCategories: categories
          ?.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
          ?.slice(0, 5) || [],
        topRegions: regions
          ?.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
          ?.slice(0, 5) || []
      };
      
      console.log("Contexte des données envoyé au chatbot:", dataContext);
      
      // Appel à notre API de chatbot
      const response = await chatApi.sendMessage({
        message: messageToSend,
        sessionId,
        context: dataContext
      });
      
      // Sauvegarder le sessionId si nécessaire
      if (response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem('bagunca_chat_session', response.sessionId);
      }
      
      // Ajouter la réponse de l'assistant
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir le chatbot avec animation et bulle d'aide */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          {/* Bulle de message proactif simplifiée */}
          {showProactiveBubble && (
            <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-900 text-bagunca-navy dark:text-white p-4 rounded-lg shadow-lg border border-bagunca-green w-64 text-sm">
              <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white dark:bg-gray-900 border-r border-b border-bagunca-green transform rotate-45"></div>
              <div className="flex items-start gap-2">
                <div className="relative mt-1">
                  <img src="/shirt-labagunca.svg" alt="Logo" className="w-5 h-5" />
                  <Sparkles size={8} className="absolute -top-1 -right-1 text-bagunca-yellow" />
                </div>
                <p>Posez des questions à notre IA pour analyser vos données</p>
              </div>
            </div>
          )}
          
          {/* Bouton avec animation mais sans badge IA ni étincelles */}
          <Button
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
              setShowProactiveBubble(false);
            }}
            className="relative rounded-full w-14 h-14 p-0 bg-bagunca-navy hover:bg-bagunca-navy/90 text-white shadow-lg group overflow-hidden transition-all duration-300 hover:scale-110"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-bagunca-green to-bagunca-yellow opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <MessageSquare size={22} />
          </Button>
        </div>
      )}

      {/* Modal du chatbot */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] max-h-[80vh] bg-white dark:bg-gray-950 rounded-lg shadow-xl border border-bagunca-navy overflow-hidden flex flex-col z-50">
          {/* En-tête */}
          <div className="bg-bagunca-navy text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src="/shirt-labagunca.svg" alt="Logo" className="w-5 h-5" />
                <Sparkles size={10} className="absolute -top-1 -right-1 text-bagunca-yellow animate-pulse" />
              </div>
              <h3 className="text-sm font-medium">Assistant IA La Bagunça</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-white hover:bg-bagunca-navy/80 hover:text-white"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
          
          {/* Contenu des messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-bagunca-green text-white' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${
                    msg.role === 'user' 
                      ? 'text-white/70' 
                      : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Loader size={14} className="animate-spin text-bagunca-navy dark:text-bagunca-yellow" />
                  <span className="text-xs text-bagunca-navy/80 dark:text-white/80">Réflexion en cours...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Zone de suggestion et saisie */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            {/* Suggestion unique placée juste au-dessus de la barre de saisie */}
            {!isLoading && messages.length < 3 && (
              <div className="px-4 pt-2 pb-1">
                <button
                  onClick={() => handleSendMessage(suggestion)}
                  className="w-full text-center py-1.5 text-xs text-bagunca-navy/60 dark:text-white/60 
                  hover:text-bagunca-navy dark:hover:text-white transition-colors duration-200
                  border border-transparent hover:border-bagunca-green dark:hover:border-bagunca-yellow
                  rounded-md bg-transparent hover:bg-bagunca-navy/5 dark:hover:bg-bagunca-yellow/5"
                >
                  {suggestion}
                </button>
              </div>
            )}
            
            {/* Zone de saisie */}
            <div className="p-3 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Posez une question sur vos données..."
                className="flex-1 p-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-md focus:ring-1 focus:ring-bagunca-navy focus:outline-none"
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSendMessage()}
                size="icon" 
                className="bg-bagunca-navy text-white hover:bg-bagunca-navy/90 disabled:opacity-50 group relative overflow-hidden"
                disabled={!inputValue.trim() || isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-bagunca-green to-bagunca-yellow opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <Send size={16} className="relative z-10" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotUI; 