'use client';

import { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { userSettingsAPI } from '@/lib/api/user-settings';

export function ApiKeySection() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedApiKey, setMaskedApiKey] = useState('');
  const [fullApiKey, setFullApiKey] = useState('');
  const [showFullKey, setShowFullKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      setIsLoading(true);
      const data = await userSettingsAPI.getApiKey();
      setHasApiKey(data.hasApiKey);
      if (data.hasApiKey && data.apiKey) {
        setMaskedApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = async () => {
    try {
      setIsGenerating(true);
      const data = await userSettingsAPI.generateApiKey();
      setFullApiKey(data.apiKey);
      setMaskedApiKey(`${data.apiKey.substring(0, 8)}...${data.apiKey.substring(data.apiKey.length - 4)}`);
      setHasApiKey(true);
      setShowFullKey(true);
    } catch (error) {
      console.error('Failed to generate API key:', error);
      alert('Erreur lors de la génération de la clé API');
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeApiKey = async () => {
    try {
      await userSettingsAPI.revokeApiKey();
      setHasApiKey(false);
      setMaskedApiKey('');
      setFullApiKey('');
      setShowFullKey(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      alert('Erreur lors de la révocation de la clé API');
    }
  };

  const copyToClipboard = () => {
    const keyToCopy = showFullKey ? fullApiKey : maskedApiKey;
    navigator.clipboard.writeText(keyToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Key className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Clé API</h2>
              <p className="text-sm text-gray-600">
                Pour intégrer BetTracker avec Claude, ChatGPT ou vos propres applications
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Info box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">À propos de la clé API</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Utilisez cette clé pour accéder à vos données depuis des applications externes</li>
                <li>Compatible avec Claude Desktop, ChatGPT et le serveur MCP</li>
                <li>Ne partagez jamais votre clé API publiquement</li>
                <li>Vous pouvez révoquer et régénérer votre clé à tout moment</li>
              </ul>
            </div>
          </div>
        </div>

        {!hasApiKey ? (
          /* No API key - Show generate button */
          <div className="text-center py-8">
            <div className="mb-4">
              <Key className="h-16 w-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune clé API générée
            </h3>
            <p className="text-gray-600 mb-6">
              Générez une clé API pour commencer à utiliser les intégrations externes
            </p>
            <button
              onClick={generateApiKey}
              disabled={isGenerating}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Key className="h-5 w-5 mr-2" />
                  Générer une clé API
                </>
              )}
            </button>
          </div>
        ) : (
          /* Has API key - Show key management */
          <div className="space-y-4">
            {/* API Key display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre clé API
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={showFullKey && fullApiKey ? fullApiKey : maskedApiKey}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  {fullApiKey && (
                    <button
                      onClick={() => setShowFullKey(!showFullKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showFullKey ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copier"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
              {fullApiKey && (
                <p className="mt-2 text-sm text-orange-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Sauvegardez cette clé maintenant ! Vous ne pourrez plus la voir en entier après avoir quitté cette page.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={generateApiKey}
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Régénérer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Révoquer
              </button>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-3">
                  Êtes-vous sûr de vouloir révoquer cette clé API ? Toutes les intégrations utilisant cette clé cesseront de fonctionner.
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={revokeApiKey}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Oui, révoquer
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documentation links */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">📚 Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="/docs/mcp-server"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">Serveur MCP (Claude Desktop)</span>
              <span className="text-xs text-gray-500">→</span>
            </a>
            <a
              href="/docs/api"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">API REST</span>
              <span className="text-xs text-gray-500">→</span>
            </a>
            <a
              href="/docs/chatgpt"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">Intégration ChatGPT</span>
              <span className="text-xs text-gray-500">→</span>
            </a>
            <a
              href="/docs/examples"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">Exemples de code</span>
              <span className="text-xs text-gray-500">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
