import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name' },
        { status: 400 }
      )
    }

    const result = await sendOrderConfirmationEmail(email, name, {
      orderNumber: "ADMIN-TEST-001",
      customerName: name,
      items: [
        { name: "Premium African Spices Set", quantity: 2, price: 25.00 },
        { name: "Organic Palm Oil", quantity: 1, price: 18.50 }
      ],
      total: 68.50,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })

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
    console.error('Admin order confirmation email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}