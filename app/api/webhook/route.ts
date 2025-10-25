import { NextRequest, NextResponse } from 'next/server'
import { createExecution, updateExecution, getWorkflow, updateWorkflow } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extraire les données du webhook n8n
    const {
      workflowId,
      workflowName,
      clientName,
      status = 'success',
      startedAt = new Date().toISOString(),
      finishedAt,
      duration,
      itemsProcessed = 0,
      errorMessage,
      metadata,
    } = body

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      )
    }

    // Vérifier si le workflow existe, sinon le créer
    let workflow = await getWorkflow(workflowId)
    if (!workflow) {
      // Si le workflow n'existe pas, on peut soit retourner une erreur
      // soit le créer automatiquement (option choisie ici)
      return NextResponse.json(
        {
          error: 'Workflow not found. Please create the workflow first using POST /api/workflows',
          workflowId
        },
        { status: 404 }
      )
    }

    // Créer l'exécution
    const execution = await createExecution({
      workflowId,
      status,
      startedAt,
      finishedAt,
      duration,
      itemsProcessed,
      errorMessage,
      metadata,
    })

    // Mettre à jour les statistiques du workflow si l'exécution est réussie
    if (status === 'success') {
      const currentValue = workflow.valueGenerated || 0
      const executionValue = workflow.costPerExecution || 0

      await updateWorkflow(workflowId, {
        valueGenerated: currentValue + executionValue,
      })
    }

    return NextResponse.json({
      success: true,
      execution,
      message: 'Execution recorded successfully',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
