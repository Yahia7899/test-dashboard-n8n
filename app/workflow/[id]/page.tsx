'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Activity, TrendingUp, Clock, DollarSign, CheckCircle, XCircle, Zap } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import MetricCard from '@/components/MetricCard'

interface WorkflowStats {
  workflow: any
  stats: {
    total: {
      executions: number
      successfulExecutions: number
      failedExecutions: number
      valueGenerated: number
      totalCost: number
      netValue: number
      totalTimeSaved: number
    }
    weekly: {
      totalExecutions: number
      successfulExecutions: number
      failedExecutions: number
      averageDuration: number
    }
    daily: Array<{
      date: string
      success: number
      error: number
      total: number
    }>
  }
}

export default function WorkflowDetails() {
  const params = useParams()
  const router = useRouter()
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchStats()
    }
  }, [params.id])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/workflows/${params.id}/stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Workflow non trouvé</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-white font-semibold"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  const successRate = stats.stats.total.executions > 0
    ? (stats.stats.total.successfulExecutions / stats.stats.total.executions) * 100
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-white/10 backdrop-blur-xl bg-white/5"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </button>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">{stats.workflow.name}</h1>
                  {stats.workflow.isActive && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-green-400">Actif</span>
                    </span>
                  )}
                </div>
                <p className="text-slate-400 ml-14">{stats.workflow.description || 'Aucune description'}</p>
                <p className="text-slate-500 ml-14 text-sm">Client: {stats.workflow.clientName}</p>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Key metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <MetricCard
              title="Valeur Nette"
              value={`${stats.stats.total.netValue.toFixed(0)}€`}
              icon={TrendingUp}
              color="from-green-500 to-emerald-500"
            />
            <MetricCard
              title="Exécutions (7j)"
              value={stats.stats.weekly.totalExecutions}
              icon={Activity}
              color="from-purple-500 to-pink-500"
            />
            <MetricCard
              title="Temps Économisé"
              value={`${stats.stats.total.totalTimeSaved}min`}
              icon={Clock}
              color="from-blue-500 to-cyan-500"
            />
            <MetricCard
              title="Taux de Réussite"
              value={`${successRate.toFixed(1)}%`}
              icon={CheckCircle}
              color="from-yellow-500 to-orange-500"
            />
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Executions chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Exécutions Quotidiennes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.stats.daily}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="success"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorSuccess)"
                    name="Succès"
                  />
                  <Area
                    type="monotone"
                    dataKey="error"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorError)"
                    name="Erreurs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Success rate chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.stats.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#8b5cf6" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Summary stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <h4 className="text-white font-semibold">Exécutions Réussies</h4>
              </div>
              <p className="text-3xl font-bold text-green-400">{stats.stats.total.successfulExecutions}</p>
              <p className="text-sm text-slate-400 mt-1">sur {stats.stats.total.executions} au total</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-white font-semibold">Erreurs</h4>
              </div>
              <p className="text-3xl font-bold text-red-400">{stats.stats.total.failedExecutions}</p>
              <p className="text-sm text-slate-400 mt-1">{((stats.stats.total.failedExecutions / stats.stats.total.executions) * 100).toFixed(1)}% du total</p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold">Coût Total</h4>
              </div>
              <p className="text-3xl font-bold text-purple-400">{stats.stats.total.totalCost.toFixed(2)}€</p>
              <p className="text-sm text-slate-400 mt-1">Pour {stats.stats.total.executions} exécutions</p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
