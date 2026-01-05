import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email, name, orderDetails } = await request.json()

    if (!email || !name || !orderDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, orderDetails' },
        { status: 400 }
      )
    }

    const result = await sendOrderConfirmationEmail(email, name, orderDetails)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Order confirmation email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Order confirmation email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}