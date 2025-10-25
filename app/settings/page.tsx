'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Link as LinkIcon, Check, AlertCircle, Loader } from 'lucide-react'

export default function SettingsPage() {
  const [ragWebhookUrl, setRagWebhookUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setRagWebhookUrl(data.settings.ragWebhookUrl || '')
    } catch (error) {
      console.error('Error fetching settings:', error)
      setError('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ragWebhookUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-white/10 backdrop-blur-xl bg-white/5"
        >
          <div className="max-w-4xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-white mb-1">Paramètres</h1>
            <p className="text-slate-400 text-sm">Configurez les webhooks pour votre dashboard</p>
          </div>
        </motion.header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Webhook RAG Section */}
            <div className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2">Webhook RAG</h2>
                  <p className="text-sm text-slate-400">
                    Configurez l'URL du webhook qui recevra les messages du chat RAG et retournera les réponses.
                    Ce webhook doit accepter un POST avec un body JSON contenant un champ "message".
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Erreur</p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {saved && (
                <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium">Paramètres sauvegardés</p>
                    <p className="text-green-300 text-sm mt-1">Les modifications ont été enregistrées avec succès</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    URL du Webhook
                  </label>
                  <input
                    type="url"
                    value={ragWebhookUrl}
                    onChange={(e) => setRagWebhookUrl(e.target.value)}
                    placeholder="https://votre-webhook.com/api/rag"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Exemple: https://your-n8n-instance.com/webhook/rag-chat
                  </p>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Format attendu de la requête</h3>
                  <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                    <pre className="text-xs text-slate-300 overflow-x-auto">
{`POST /webhook/rag-chat
Content-Type: application/json

{
  "message": "Votre question ici",
  "timestamp": "2025-01-01T00:00:00.000Z"
}`}
                    </pre>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-white mb-3">Format attendu de la réponse</h3>
                  <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                    <pre className="text-xs text-slate-300 overflow-x-auto">
{`{
  "response": "Réponse du RAG ici",
  // ou
  "message": "Réponse du RAG ici"
  // Le champ "response" ou "message" sera affiché
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => fetchSettings()}
                disabled={saving}
                className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
