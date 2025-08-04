import { Resend } from 'resend'

// Initialize Resend with graceful fallback
let resend: Resend | null = null
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
} catch (error) {
  console.warn("⚠️ Resend not configured or failed to initialize")
}

export interface EmailData {
  to: string
  subject: string
  html: string
}

export class EmailService {
  /**
   * Send an email using Resend
   */
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn("⚠️ Resend not configured, email not sent")
      return false
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'JobsyAI <noreply@jobsyai.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      })

      if (error) {
        console.error("❌ Error sending email:", error)
        return false
      }

      console.log("✅ Email sent successfully:", data?.id)
      return true
    } catch (error) {
      console.error("❌ Error in sendEmail:", error)
      return false
    }
  }

  /**
   * Send subscription confirmation email
   */
  static async sendSubscriptionConfirmation(
    userEmail: string,
    planName: string,
    planFeatures: string[],
    subscriptionDate: string,
    nextBillingDate?: string
  ): Promise<boolean> {
    const subject = `Welcome to ${planName} - Your JobsyAI Subscription is Active!`
    
    // Create HTML content for the email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${planName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding: 40px 24px 24px; background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%); }
            .icon { width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
            .icon svg { width: 32px; height: 32px; color: #16a34a; }
            .title { font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 8px; }
            .subtitle { color: #6b7280; margin: 0 0 16px; }
            .email { color: #16a34a; font-weight: 500; font-size: 14px; }
            .content { padding: 0 24px 24px; }
            .benefits { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .benefits h3 { color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 8px; }
            .benefits ul { margin: 0; padding-left: 20px; }
            .benefits li { color: #166534; font-size: 14px; margin: 4px 0; }
            .details { margin: 24px 0; }
            .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { color: #6b7280; font-size: 14px; }
            .detail-value { color: #111827; font-size: 14px; font-weight: 500; }
            .cta { background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .cta h3 { color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 4px; }
            .cta p { color: #1e40af; font-size: 14px; margin: 0; }
            .footer { text-align: center; padding: 16px 24px; border-top: 1px solid #e5e7eb; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <h1 class="title">Welcome to ${planName}!</h1>
              <p class="subtitle">Your subscription has been successfully activated</p>
              <p class="email">${userEmail}</p>
            </div>
            
            <div class="content">
              <div class="benefits">
                <h3>Your ${planName} Benefits:</h3>
                <ul>
                  ${planFeatures.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Subscription Date:</span>
                  <span class="detail-value">${new Date(subscriptionDate).toLocaleDateString()}</span>
                </div>
                ${nextBillingDate ? `
                <div class="detail-row">
                  <span class="detail-label">Next Billing:</span>
                  <span class="detail-value">${new Date(nextBillingDate).toLocaleDateString()}</span>
                </div>
                ` : ''}
              </div>
              
              <div class="cta">
                <h3>Ready to get started?</h3>
                <p>Access your enhanced features in your dashboard and start creating AI-powered, ATS-optimized applications.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing JobsyAI. We're excited to help you land your dream job!</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }

  /**
   * Send role upgrade confirmation email
   */
  static async sendRoleUpgradeConfirmation(
    userEmail: string,
    roleName: string,
    grantedBy: string,
    grantedDate: string,
    expiresAt?: string,
    notes?: string
  ): Promise<boolean> {
    const subject = `Special Access Granted - You're now a ${roleName}!`
    
    const isSuperUser = roleName === "Super User"
    const isAdmin = roleName === "Admin"
    
    const getRoleFeatures = () => {
      if (isAdmin) {
        return [
          "Unlimited platform access",
          "Admin panel access",
          "User management capabilities",
          "System-wide privileges",
          "Permanent access"
        ]
      }
      return [
        "Unlimited platform access",
        "All premium features",
        "Priority support",
        "Advanced AI analysis",
        "30-day access period"
      ]
    }

    const roleFeatures = getRoleFeatures()
    
    // Create HTML content for the email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Special Access Granted</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding: 40px 24px 24px; background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%); }
            .icon { width: 64px; height: 64px; background: #f3e8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
            .icon svg { width: 32px; height: 32px; color: #9333ea; }
            .title { font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 8px; }
            .subtitle { color: #6b7280; margin: 0 0 16px; }
            .email { color: #9333ea; font-weight: 500; font-size: 14px; }
            .content { padding: 0 24px 24px; }
            .benefits { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .benefits h3 { color: #7c3aed; font-size: 14px; font-weight: 600; margin: 0 0 8px; }
            .benefits ul { margin: 0; padding-left: 20px; }
            .benefits li { color: #7c3aed; font-size: 14px; margin: 4px 0; }
            .details { margin: 24px 0; }
            .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { color: #6b7280; font-size: 14px; }
            .detail-value { color: #111827; font-size: 14px; font-weight: 500; }
            .notes { background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .notes h3 { color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 4px; }
            .notes p { color: #1e40af; font-size: 14px; margin: 0; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .warning h3 { color: #d97706; font-size: 14px; font-weight: 600; margin: 0 0 4px; }
            .warning p { color: #d97706; font-size: 14px; margin: 0; }
            .cta { background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .cta h3 { color: #16a34a; font-size: 14px; font-weight: 600; margin: 0 0 4px; }
            .cta p { color: #16a34a; font-size: 14px; margin: 0; }
            .footer { text-align: center; padding: 16px 24px; border-top: 1px solid #e5e7eb; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <h1 class="title">Special Access Granted!</h1>
              <p class="subtitle">You've been upgraded to ${roleName} status</p>
              <p class="email">${userEmail}</p>
            </div>
            
            <div class="content">
              <div class="benefits">
                <h3>Your ${roleName} Benefits:</h3>
                <ul>
                  ${roleFeatures.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
              </div>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Granted By:</span>
                  <span class="detail-value">${grantedBy}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Granted Date:</span>
                  <span class="detail-value">${new Date(grantedDate).toLocaleDateString()}</span>
                </div>
                ${expiresAt ? `
                <div class="detail-row">
                  <span class="detail-label">Expires:</span>
                  <span class="detail-value">${new Date(expiresAt).toLocaleDateString()}</span>
                </div>
                ` : ''}
              </div>
              
              ${notes ? `
              <div class="notes">
                <h3>Admin Notes:</h3>
                <p>${notes}</p>
              </div>
              ` : ''}
              
              ${isSuperUser ? `
              <div class="warning">
                <h3>Important:</h3>
                <p>Your Super User access will expire in 30 days. Make the most of your enhanced features!</p>
              </div>
              ` : ''}
              
              <div class="cta">
                <h3>Ready to explore?</h3>
                <p>Access your enhanced features in your dashboard and start creating AI-powered, ATS-optimized applications.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for being part of the JobsyAI community!</p>
            </div>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }
} 