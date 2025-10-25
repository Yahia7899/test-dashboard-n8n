import { NextRequest, NextResponse } from 'next/server'
import { getWorkflows, createWorkflow } from '@/lib/db'

export async function GET() {
  try {
    const workflows = await getWorkflows()
    return NextResponse.json({ workflows })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      clientName,
      isActive = true,
      valueGenerated = 0,
      costPerExecution = 0,
      timeSavedPerExecution = 0,
    } = body

    if (!name || !clientName) {
      return NextResponse.json(
        { error: 'name and clientName are required' },
        { status: 400 }
      )
    }

    const workflow = await createWorkflow({
      name,
      description,
      clientName,
      isActive,
      valueGenerated,
      costPerExecution,
      timeSavedPerExecution,
    })

    return NextResponse.json({
      success: true,
      workflow,
      message: 'Workflow created successfully',
    })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
