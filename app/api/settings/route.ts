import { NextRequest, NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/db'

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ragWebhookUrl } = body

    if (ragWebhookUrl !== undefined && typeof ragWebhookUrl !== 'string') {
      return NextResponse.json(
        { error: 'ragWebhookUrl must be a string' },
        { status: 400 }
      )
    }

    const settings = await updateSettings({ ragWebhookUrl })

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
