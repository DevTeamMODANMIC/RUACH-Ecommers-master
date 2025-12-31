import * as SibApiV3Sdk from '@sendinblue/client';

// Initialize Brevo API client
let apiInstance: SibApiV3Sdk.TransactionalEmailsApi | null = null;

function getBrevoClient() {
  if (!apiInstance) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY environment variable is not set');
    }

    // Create and configure the API client
    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  }
  return apiInstance;
}

// Email sending utility function
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: {
    name: string;
    email: string;
  };
  replyTo?: {
    name?: string;
    email: string;
  };
  tags?: string[];
}) {
  try {
    const client = getBrevoClient();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Set recipients
    if (Array.isArray(options.to)) {
      sendSmtpEmail.to = options.to.map(email => ({ email }));
    } else {
      sendSmtpEmail.to = [{ email: options.to }];
    }

    // Set sender
    sendSmtpEmail.sender = options.sender || {
      name: 'Grova',
      email: 'noreply@grova.com'
    };

    // Set content
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.htmlContent;
    if (options.textContent) {
      sendSmtpEmail.textContent = options.textContent;
    }

    // Set reply-to if provided
    if (options.replyTo) {
      sendSmtpEmail.replyTo = options.replyTo;
    }

    // Set tags if provided
    if (options.tags) {
      sendSmtpEmail.tags = options.tags;
    }

    const result = await client.sendTransacEmail(sendSmtpEmail);
    return {
      success: true,
      messageId: result.body.messageId,
      response: result.body
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Predefined email templates
export const emailTemplates = {
  welcome: (userName: string, verificationLink?: string) => ({
    subject: 'Welcome to Qrova!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Grova, ${userName}!</h1>
        <p>Thank you for joining our community. We're excited to have you on board!</p>
        <p>At Grova, you'll find the finest selection of groceries and products delivered right to your doorstep.</p>
        ${verificationLink ? `
          <p style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Verify Your Email
            </a>
          </p>
        ` : ''}
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy shopping!<br>The Grova Team</p>
      </div>
    `,
    textContent: `Welcome to Grova, ${userName}!

Thank you for joining our community. We're excited to have you on board!

At Grova, you'll find the finest selection of groceries and products delivered right to your doorstep.

${verificationLink ? `Please verify your email: ${verificationLink}` : ''}

If you have any questions, feel free to contact our support team.

Happy shopping!
The Grova Team`
  }),

  orderConfirmation: (orderDetails: {
    orderNumber: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    estimatedDelivery: string;
  }) => ({
    subject: `Order Confirmation - #${orderDetails.orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmed!</h1>
        <p>Hi ${orderDetails.customerName},</p>
        <p>Thank you for your order! We've received it and are preparing it for shipment.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Item</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">₦${item.price.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8f9fa;">
              <td colspan="2" style="padding: 12px; text-align: right; border: 1px solid #ddd;"><strong>Total:</strong></td>
              <td style="padding: 12px; text-align: right; border: 1px solid #ddd;"><strong>₦${orderDetails.total.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>

        <p>You'll receive another email with tracking information once your order ships.</p>
        <p>Thank you for choosing Grova!</p>
      </div>
    `,
    textContent: `Order Confirmed!

Hi ${orderDetails.customerName},

Thank you for your order! We've received it and are preparing it for shipment.

Order Details:
- Order Number: ${orderDetails.orderNumber}
- Estimated Delivery: ${orderDetails.estimatedDelivery}

Items:
${orderDetails.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₦${item.price.toLocaleString()}`).join('\n')}

Total: ₦${orderDetails.total.toLocaleString()}

You'll receive another email with tracking information once your order ships.

Thank you for choosing Grova!`
  }),

  passwordReset: (resetLink: string, userName: string) => ({
    subject: 'Password Reset Request - Qrova',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>

        <p style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>

        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>For security reasons, this link will expire in 1 hour.</p>
        <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
      </div>
    `,
    textContent: `Password Reset Request

Hi ${userName},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link will expire in 1 hour.`
  })
};

// Convenience functions for common email types
export async function sendWelcomeEmail(email: string, userName: string, verificationLink?: string) {
  const template = emailTemplates.welcome(userName, verificationLink);
  return sendEmail({
    to: email,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    tags: ['welcome', 'user-onboarding']
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderDetails: Parameters<typeof emailTemplates.orderConfirmation>[0]
) {
  const template = emailTemplates.orderConfirmation(orderDetails);
  return sendEmail({
    to: email,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    tags: ['order-confirmation', 'transactional']
  });
}

export async function sendPasswordResetEmail(email: string, userName: string, resetLink: string) {
  const template = emailTemplates.passwordReset(resetLink, userName);
  return sendEmail({
    to: email,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent,
    tags: ['password-reset', 'security']
  });
}

// Admin notification for new orders
export async function sendAdminOrderNotification(orderDetails: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemsCount: number;
  orderDate: string;
}) {
  return sendEmail({
    to: 'admin@grova.com',
    subject: `🆕 New Order Received - #${orderDetails.orderId}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Order Received!</h1>

        <div style="background-color: #f0f8ff; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #007bff;">
          <h2 style="margin-top: 0; color: #007bff;">Order #${orderDetails.orderId}</h2>
          <p><strong>Customer:</strong> ${orderDetails.customerName} (${orderDetails.customerEmail})</p>
          <p><strong>Items:</strong> ${orderDetails.itemsCount} items</p>
          <p><strong>Total:</strong> £${orderDetails.total}</p>
          <p><strong>Order Date:</strong> ${new Date(orderDetails.orderDate).toLocaleString()}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Action Required:</strong> Please process this order and update the status in the admin panel.</p>
        </div>

        <p>View order details in the <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderDetails.orderId}" style="color: #007bff;">admin panel</a>.</p>
      </div>
    `,
    textContent: `New Order Received!

Order #${orderDetails.orderId}
Customer: ${orderDetails.customerName} (${orderDetails.customerEmail})
Items: ${orderDetails.itemsCount} items
Total: £${orderDetails.total}
Order Date: ${new Date(orderDetails.orderDate).toLocaleString()}

Action Required: Please process this order and update the status in the admin panel.

View order details: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderDetails.orderId}`,
    tags: ['admin-notification', 'new-order']
  });
}

// Utility function to send admin notification when order is created
export async function notifyAdminOfNewOrder(orderData: {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  total: number;
  items: Array<{ quantity: number }>;
  createdAt: string;
}) {
  try {
    const itemsCount = orderData.items.reduce((total, item) => total + item.quantity, 0);

    await sendAdminOrderNotification({
      orderId: orderData.id,
      customerName: orderData.userName,
      customerEmail: orderData.userEmail,
      total: orderData.total,
      itemsCount,
      orderDate: orderData.createdAt
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send admin order notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}