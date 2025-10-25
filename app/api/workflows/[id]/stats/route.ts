import { NextRequest, NextResponse } from 'next/server'
import {
  getWorkflow,
  getExecutionsByWorkflow,
  getWeeklyStats,
} from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workflow = await getWorkflow(id)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Récupérer toutes les exécutions
    const executions = await getExecutionsByWorkflow(id)

    // Statistiques hebdomadaires
    const weeklyStats = await getWeeklyStats(id)

    // Calcul de la plus-value
    const totalValue = workflow.valueGenerated
    const totalCost = executions.length * workflow.costPerExecution
    const netValue = totalValue - totalCost

    // Temps total économisé
    const totalTimeSaved = executions.filter(e => e.status === 'success').length * workflow.timeSavedPerExecution

    // Grouper les exécutions par jour pour le graphique
    const executionsByDay = executions.reduce((acc: any, execution) => {
      const date = new Date(execution.startedAt).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { success: 0, error: 0, total: 0 }
      }
      acc[date].total++
      if (execution.status === 'success') {
        acc[date].success++
      } else if (execution.status === 'error') {
        acc[date].error++
      }
      return acc
    }, {})

    const dailyData = Object.entries(executionsByDay)
      .map(([date, stats]: [string, any]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // Derniers 30 jours

    return NextResponse.json({
      workflow,
      stats: {
        total: {
          executions: executions.length,
          successfulExecutions: executions.filter(e => e.status === 'success').length,
          failedExecutions: executions.filter(e => e.status === 'error').length,
          valueGenerated: totalValue,
          totalCost,
          netValue,
          totalTimeSaved,
        },
        weekly: weeklyStats,
        daily: dailyData,
      },
    })
  } catch (error) {
    console.error('Error fetching workflow stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
