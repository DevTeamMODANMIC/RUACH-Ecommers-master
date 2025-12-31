import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/brevo'

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    
    const { name, email, subject, message } = formData

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send customer confirmation email
    const customerEmailResult = await sendEmail({
      to: email,
      subject: `Grova - Message Received: ${subject}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Message Received</h1>
          <p>Hi ${name},</p>
          <p>Thank you for contacting Grova! We've received your message and will get back to you within 24 hours.</p>

          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3>Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>

          <p>In the meantime, you can also reach us at:</p>
          <ul>
            <li>Phone: +44 20 1234 5678</li>
            <li>Email: support@grova.co.uk</li>
          </ul>

          <p>Best regards,<br>The Grova Team</p>
        </div>
      `,
      textContent: `Message Received

Hi ${name},

Thank you for contacting Grova! We've received your message and will get back to you within 24 hours.

Your Message:
Subject: ${subject}

${message}

In the meantime, you can also reach us at:
- Phone: +44 20 1234 5678
- Email: support@grova.co.uk

Best regards,
The Grova Team`
    })

    // Send admin notification email
    const adminEmailResult = await sendEmail({
      to: 'admin@grova.com',
      subject: `New Contact Form Message: ${subject}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Customer Message</h1>

          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>

          <p>Please respond to this customer within 24 hours.</p>
        </div>
      `,
      textContent: `New Customer Message

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

Please respond to this customer within 24 hours.`
    })

    if (customerEmailResult.success && adminEmailResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Message sent successfully" 
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: "Message sent but email delivery may have failed. We'll still respond to you.",
          error: customerEmailResult.error || adminEmailResult.error
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Contact form API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong. Please try again or contact us directly.",
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}