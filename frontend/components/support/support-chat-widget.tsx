'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, FileText, Maximize2, Minimize2, BookOpen } from 'lucide-react';
import { supportAPI } from '@/lib/api/support';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! 👋 Je suis votre assistant BetTracker Pro. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketOption, setShowTicketOption] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Appel à l'API du chatbot via le client API
      const data = await supportAPI.chat({
        message: inputMessage,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Afficher l'option de créer un ticket après quelques échanges
      if (messages.length > 4 && data.suggestTicket) {
        setShowTicketOption(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Voulez-vous créer un ticket de support ?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setShowTicketOption(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = () => {
    // Rediriger vers la page de création de ticket avec le contexte
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? 'Vous' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
    
    localStorage.setItem('support_conversation', conversationText);
    window.location.href = '/dashboard/support?action=create';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110"
          aria-label="Ouvrir le support"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 bg-white shadow-2xl flex flex-col border border-gray-200 transition-all duration-300 ${
          isFullscreen 
            ? 'inset-4 rounded-lg' 
            : 'bottom-6 right-6 w-96 h-[600px] rounded-lg'
        }`}>
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Support BetTracker</h3>
                <p className="text-xs text-primary-100">Assistant IA disponible 24/7</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowDocumentation(true)}
                className="text-white hover:bg-primary-700 rounded p-1 transition-colors"
                aria-label="Documentation"
                title="Documentation des outils"
              >
                <BookOpen className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-primary-700 rounded p-1 transition-colors"
                aria-label={isFullscreen ? 'Réduire' : 'Plein écran'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-primary-700 rounded p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                </div>
              </div>
            )}

            {showTicketOption && (
              <div className="flex justify-center">
                <button
                  onClick={handleCreateTicket}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span>Créer un ticket de support</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Propulsé par l'IA • Réponses instantanées
            </p>
          </div>
        </div>
      )}

      {/* Documentation Modal */}
      {showDocumentation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" onClick={() => setShowDocumentation(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-primary-600 text-white p-6 rounded-t-lg flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6" />
                <div>
                  <h2 className="text-2xl font-bold">Documentation du Chatbot</h2>
                  <p className="text-sm text-primary-100">Tous les outils disponibles pour vous aider</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocumentation(false)}
                className="text-white hover:bg-primary-700 rounded p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Introduction */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">🤖 À propos de l'assistant</h3>
                <p className="text-sm text-blue-800">
                  L'assistant BetTracker Pro est alimenté par l'IA et dispose de 12 outils pour vous aider à gérer vos paris, 
                  analyser vos statistiques et résoudre vos problèmes. Voici la liste complète des capacités.
                </p>
              </div>

              {/* Paris & Budget */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <span className="text-2xl">💰</span>
                  <span>Gestion des Paris & Budget</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Statistiques de paris</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Obtenez vos statistiques complètes : nombre de paris, taux de réussite, profit total, ROI.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      Exemple : "Montre-moi mes statistiques"
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-2">📝 Derniers paris</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Consultez vos 10 derniers paris avec leurs détails et résultats.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      Exemple : "Quels sont mes derniers paris ?"
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-2">💳 État du budget</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Vérifiez vos limites de budget, dépenses actuelles et montant disponible.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      Exemple : "Quel est mon budget restant ?"
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-2">⚙️ Paramètres utilisateur</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Consultez vos paramètres : mode bankroll, notifications, préférences.
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                      Exemple : "Quels sont mes paramètres ?"
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques PMU */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <span className="text-2xl">🏇</span>
                  <span>Statistiques PMU Avancées</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">📈 Stats PMU globales</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Vue d'ensemble : hippodromes suivis, courses enregistrées, total de paris PMU.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      Exemple : "Mes statistiques PMU"
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">🏟️ Liste des hippodromes</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Tous les hippodromes où vous avez parié avec le nombre de paris par lieu.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      Exemple : "Sur quels hippodromes j'ai parié ?"
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">📍 Stats par hippodrome</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Statistiques détaillées d'un hippodrome : taux de réussite, profit, ROI.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      Exemple : "Stats de l'hippodrome ENGHIEN"
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">🐴 Performances des chevaux</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Top 10 des chevaux sur lesquels vous avez parié avec leurs statistiques.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      Exemple : "Quels sont mes meilleurs chevaux ?"
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">👨‍🦱 Stats des jockeys</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Top 10 des jockeys dans vos courses avec taux de victoire et podiums.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      Exemple : "Statistiques des jockeys"
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">🤝 Combinaisons cheval-jockey</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Top 10 des meilleures combinaisons cheval-jockey dans vos paris.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      Exemple : "Meilleures combinaisons cheval-jockey"
                    </div>
                  </div>

                  <div className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50 md:col-span-2">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Statistiques croisées</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Combinaisons complètes hippodrome + jockey + cheval avec performances détaillées.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono">
                      Exemple : "Stats croisées hippodrome jockey cheval"
                    </div>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <span className="text-2xl">🎫</span>
                  <span>Support & Assistance</span>
                </h3>
                
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-semibold text-yellow-900 mb-2">📋 Créer un ticket de support</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Si l'assistant ne peut pas résoudre votre problème, il créera automatiquement un ticket 
                    de support avec tout le contexte de votre conversation.
                  </p>
                  <div className="bg-white p-2 rounded text-xs font-mono">
                    L'assistant décide automatiquement quand créer un ticket
                  </div>
                </div>
              </div>

              {/* Exemples de questions */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-semibold text-purple-900 mb-3">💡 Exemples de questions</h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li>• "Montre-moi mes statistiques du mois"</li>
                  <li>• "Quels sont mes derniers paris ?"</li>
                  <li>• "Quel est mon budget restant cette semaine ?"</li>
                  <li>• "Sur quels hippodromes j'ai le meilleur taux de réussite ?"</li>
                  <li>• "Quelles sont les meilleures combinaisons cheval-jockey ?"</li>
                  <li>• "Donne-moi les stats du jockey X"</li>
                  <li>• "Quels chevaux ont le meilleur taux de victoire ?"</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                <p>🤖 Propulsé par OpenAI GPT-4 • Réponses en temps réel</p>
                <p className="mt-1">Pour toute question, demandez simplement à l'assistant !</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
