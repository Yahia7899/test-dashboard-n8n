'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, DollarSign, Activity, ArrowUpRight } from 'lucide-react'
import { Workflow } from '@/lib/db'
import Link from 'next/link'

interface WorkflowCardProps {
  workflow: Workflow
  index: number
}

export default function WorkflowCard({ workflow, index }: WorkflowCardProps) {
  const roi = workflow.valueGenerated - (workflow.costPerExecution * 10) // Estimation avec 10 exécutions

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <Link href={`/workflow/${workflow.id}`}>
        <div className="relative p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">{workflow.name}</h3>
                {workflow.isActive && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-green-400">Actif</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">{workflow.description || 'Aucune description'}</p>
              <p className="text-xs text-slate-500 mt-1">Client: {workflow.clientName}</p>
            </div>

            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <TrendingUp className="w-3 h-3" />
                <span>Valeur</span>
              </div>
              <p className="text-lg font-bold text-green-400">
                {workflow.valueGenerated.toFixed(0)}€
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <DollarSign className="w-3 h-3" />
                <span>Coût/exec</span>
              </div>
              <p className="text-lg font-bold text-orange-400">
                {workflow.costPerExecution.toFixed(2)}€
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Temps/exec</span>
              </div>
              <p className="text-lg font-bold text-blue-400">
                {workflow.timeSavedPerExecution}min
              </p>
            </div>
          </div>

          {/* ROI Badge */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">ROI estimé:</span>
              <span className={`text-sm font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(0)}€
              </span>
            </div>

            <div className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300 transition-colors">
              <span className="text-sm font-medium">Voir détails</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
