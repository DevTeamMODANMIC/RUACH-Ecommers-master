import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      to,
      subject: `[ADMIN TEST] ${subject}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Admin Test Email</h1>
          <p>This is a test email sent from your Grova admin panel.</p>
          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p><strong>Test Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p>Sent at: ${new Date().toLocaleString()}</p>
          <p><small>If you didn't request this test, please ignore this email.</small></p>
        </div>
      `,
      textContent: `Admin Test Email

This is a test email sent from your Grova admin panel.

Test Message:
${message}

Sent at: ${new Date().toLocaleString()}

If you didn't request this test, please ignore this email.`
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Test email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Admin test email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}