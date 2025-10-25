'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, AlertCircle } from 'lucide-react'

interface WorkflowFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function WorkflowFormModal({ isOpen, onClose, onSuccess }: WorkflowFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    costPerExecution: '',
    timeSavedPerExecution: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdWorkflow, setCreatedWorkflow] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          clientName: formData.clientName,
          isActive: true,
          valueGenerated: 0,
          costPerExecution: parseFloat(formData.costPerExecution) || 0,
          timeSavedPerExecution: parseInt(formData.timeSavedPerExecution) || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du workflow')
      }

      setCreatedWorkflow(data.workflow)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = () => {
    if (createdWorkflow) {
      navigator.clipboard.writeText(createdWorkflow.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/webhook`
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      clientName: '',
      costPerExecution: '',
      timeSavedPerExecution: '',
    })
    setCreatedWorkflow(null)
    setError('')
    onClose()
    if (createdWorkflow) {
      onSuccess()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 backdrop-blur-xl bg-slate-900/90 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {createdWorkflow ? 'Workflow Enregistré !' : 'Enregistrer un Workflow n8n'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {createdWorkflow
                    ? 'Copiez ces informations pour configurer n8n'
                    : 'Connectez votre workflow n8n au dashboard'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!createdWorkflow ? (
                // Form
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium">Erreur</p>
                        <p className="text-red-300 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nom du workflow <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Automatisation Email Marketing"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nom du client <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Ex: Entreprise ABC"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez ce que fait ce workflow..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Coût par exécution (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPerExecution}
                        onChange={(e) => setFormData({ ...formData, costPerExecution: e.target.value })}
                        placeholder="0.05"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Temps économisé (min)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.timeSavedPerExecution}
                        onChange={(e) => setFormData({ ...formData, timeSavedPerExecution: e.target.value })}
                        placeholder="15"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer le workflow'}
                    </button>
                  </div>
                </form>
              ) : (
                // Success view
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-green-400 font-medium">
                      Workflow enregistré avec succès !
                    </p>
                    <p className="text-green-300 text-sm mt-1">
                      Suivez les étapes ci-dessous pour configurer n8n
                    </p>
                  </div>

                  {/* Step 1: Workflow ID */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm">1</div>
                      ID du Workflow
                    </h3>
                    <p className="text-sm text-slate-400">
                      Copiez cet ID, vous en aurez besoin dans n8n
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-purple-400">
                        {createdWorkflow.id}
                      </div>
                      <button
                        onClick={handleCopyId}
                        className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Webhook URL */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-sm">2</div>
                      URL du Webhook
                    </h3>
                    <p className="text-sm text-slate-400">
                      Utilisez cette URL dans le nœud HTTP Request de n8n
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-cyan-400 break-all">
                        {window.location.origin}/api/webhook
                      </div>
                      <button
                        onClick={handleCopyWebhookUrl}
                        className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Step 3: Configuration n8n */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-sm">3</div>
                      Configuration n8n
                    </h3>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                      <p className="text-sm text-slate-300">
                        Dans votre workflow n8n, ajoutez un nœud <span className="font-mono text-purple-400">HTTP Request</span> :
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="text-slate-500">•</span>
                          <div>
                            <span className="text-slate-400">Method:</span>
                            <span className="ml-2 text-white font-mono">POST</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-500">•</span>
                          <div>
                            <span className="text-slate-400">URL:</span>
                            <span className="ml-2 text-cyan-400 font-mono text-xs break-all">
                              {window.location.origin}/api/webhook
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-500">•</span>
                          <div>
                            <span className="text-slate-400">Body (JSON):</span>
                            <pre className="mt-2 p-3 rounded bg-black/30 text-xs text-slate-300 overflow-x-auto">
{`{
  "workflowId": "${createdWorkflow.id}",
  "status": "success",
  "itemsProcessed": 10
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    Terminer
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
