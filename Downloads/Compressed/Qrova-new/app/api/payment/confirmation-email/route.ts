import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email, orderId, amount, items } = await request.json()

    if (!email || !orderId || !amount || !items) {
      return NextResponse.json(
        { error: 'Missing required fields: email, orderId, amount, items' },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      to: email,
      subject: `Payment Confirmed - Order ${orderId}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Payment Confirmed!</h1>
          <p>Hi there,</p>
          <p>Great news! Your payment has been successfully processed and your order is now being prepared.</p>

          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount Paid:</strong> £${amount}</p>
            <p><strong>Items:</strong> ${items}</p>
          </div>

          <p>You'll receive another email with tracking information once your order ships.</p>
          <p>Thank you for choosing Grova!</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              If you have any questions, contact us at support@grova.co.uk
            </p>
          </div>
        </div>
      `,
      textContent: `Payment Confirmed!

Hi there,

Great news! Your payment has been successfully processed and your order is now being prepared.

Order Summary:
- Order ID: ${orderId}
- Amount Paid: £${amount}
- Items: ${items}

You'll receive another email with tracking information once your order ships.

Thank you for choosing Grova!

If you have any questions, contact us at support@grova.co.uk`
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Payment confirmation email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Payment confirmation email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}