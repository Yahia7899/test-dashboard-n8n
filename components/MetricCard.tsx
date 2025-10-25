'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  total?: number
  icon: LucideIcon
  color: string
}

export default function MetricCard({ title, value, total, icon: Icon, color }: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
      ></div>

      <div className="relative p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {total !== undefined && (
            <div className="text-right">
              <div className="text-xs text-slate-400">sur {total}</div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>

        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-20`}></div>
        </div>
      </div>
    </motion.div>
  )
}
