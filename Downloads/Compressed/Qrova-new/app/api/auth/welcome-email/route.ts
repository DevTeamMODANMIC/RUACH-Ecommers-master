import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name' },
        { status: 400 }
      )
    }

    const result = await sendWelcomeEmail(email, name)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Welcome email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Welcome email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}