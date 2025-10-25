import { NextRequest, NextResponse } from 'next/server'
import { getMessages, createMessage, getSettings, clearMessages } from '@/lib/db'

export async function GET() {
  try {
    const messages = await getMessages()
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, action } = body

    // Handle clear action
    if (action === 'clear') {
      await clearMessages()
      return NextResponse.json({
        success: true,
        message: 'Chat history cleared',
      })
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'message is required and must be a string' },
        { status: 400 }
      )
    }

    // Save user message
    const userMessage = await createMessage({
      role: 'user',
      content: message,
    })

    // Get settings to find webhook URL
    const settings = await getSettings()

    if (!settings.ragWebhookUrl) {
      const errorMessage = await createMessage({
        role: 'assistant',
        content: 'Erreur : Aucune URL de webhook configurée. Veuillez configurer le webhook dans les paramètres.',
        error: 'No webhook URL configured',
      })

      return NextResponse.json({
        success: false,
        userMessage,
        assistantMessage: errorMessage,
        error: 'No webhook URL configured',
      })
    }

    // Send message to webhook
    try {
      const webhookResponse = await fetch(settings.ragWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!webhookResponse.ok) {
        throw new Error(`Webhook returned status ${webhookResponse.status}`)
      }

      const webhookData = await webhookResponse.json()

      // Extract response content - adapt this based on your webhook's response format
      const responseContent = webhookData.response || webhookData.message || JSON.stringify(webhookData)

      // Save assistant message with webhook response
      const assistantMessage = await createMessage({
        role: 'assistant',
        content: responseContent,
        webhookResponse: webhookData,
      })

      return NextResponse.json({
        success: true,
        userMessage,
        assistantMessage,
      })
    } catch (webhookError: any) {
      console.error('Webhook error:', webhookError)

      const errorMessage = await createMessage({
        role: 'assistant',
        content: `Erreur lors de la communication avec le webhook : ${webhookError.message}`,
        error: webhookError.message,
      })

      return NextResponse.json({
        success: false,
        userMessage,
        assistantMessage: errorMessage,
        error: webhookError.message,
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error processing chat message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await clearMessages()
    return NextResponse.json({
      success: true,
      message: 'Chat history cleared',
    })
  } catch (error) {
    console.error('Error clearing messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
