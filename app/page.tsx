'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Clock, DollarSign, Zap } from 'lucide-react'
import WorkflowCard from '@/components/WorkflowCard'
import MetricCard from '@/components/MetricCard'
import { Workflow } from '@/lib/db'

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows')
      const data = await response.json()
      setWorkflows(data.workflows || [])
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculer les métriques globales
  const totalValue = workflows.reduce((acc, w) => acc + w.valueGenerated, 0)
  const totalWorkflows = workflows.length
  const activeWorkflows = workflows.filter(w => w.isActive).length
  const totalTimeSaved = workflows.reduce((acc, w) => acc + w.timeSavedPerExecution, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background animated grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-white/10 backdrop-blur-xl bg-white/5"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                n8n Dashboard
              </h1>
            </div>
            <p className="text-slate-400 ml-14">Suivez la performance de vos automatisations en temps réel</p>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Global metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <MetricCard
              title="Workflows Actifs"
              value={activeWorkflows}
              total={totalWorkflows}
              icon={Activity}
              color="from-purple-500 to-pink-500"
            />
            <MetricCard
              title="Valeur Générée"
              value={`${totalValue.toFixed(0)}€`}
              icon={TrendingUp}
              color="from-cyan-500 to-blue-500"
            />
            <MetricCard
              title="Temps Économisé"
              value={`${totalTimeSaved}min`}
              icon={Clock}
              color="from-green-500 to-emerald-500"
            />
            <MetricCard
              title="ROI Moyen"
              value={workflows.length > 0 ? `${((totalValue / workflows.length) * 100).toFixed(0)}%` : '0%'}
              icon={DollarSign}
              color="from-yellow-500 to-orange-500"
            />
          </motion.div>

          {/* Workflows list */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Vos Workflows</h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-16 px-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5">
                <Zap className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucun workflow</h3>
                <p className="text-slate-400 mb-6">
                  Créez votre premier workflow pour commencer à suivre vos automatisations
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                  Créer un workflow
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workflows.map((workflow, index) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
