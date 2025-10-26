import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://n8n.srv971532.hstgr.cloud/webhook/8d037ba8-73a9-4d3a-af62-393e2a1084c2'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      )
    }

    // Envoyer au webhook n8n
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(30000), // 30 secondes timeout
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook a retourné une erreur: ${webhookResponse.status}`)
    }

    const data = await webhookResponse.json()

    // Extraire la réponse (supporter différents formats)
    const responseContent = data.response || data.message || data.text || JSON.stringify(data)

    return NextResponse.json({
      success: true,
      response: responseContent,
    })
  } catch (error: any) {
    console.error('Erreur webhook:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la communication avec l\'IA',
        details: error.message
      },
      { status: 500 }
    )
  }
}
