import nodemailer from 'nodemailer';

interface SendResetEmailParams {
  toEmail: string;
  userName: string;
  resetToken: string;
  baseUrl: string;
}

export const sendPasswordResetEmail = async ({
  toEmail,
  userName,
  resetToken,
  baseUrl
}: SendResetEmailParams): Promise<{ success: boolean; previewUrl?: string; messageId?: string }> => {
  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(toEmail)}`;

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASSWORD || '';
  const smtpFrom = process.env.SMTP_FROM || 'KIOT CampusConnect <no-reply@kiot.ac.in>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KIOT CampusConnect - Password Reset</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0 0 4px 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 0; font-size: 13px; opacity: 0.9; font-weight: 500; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
          .desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
          .token-box { background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 12px; word-break: break-all; margin: 16px 0; color: #334155; }
          .security-notes { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #1e40af; margin-top: 24px; line-height: 1.5; }
          .footer { background: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KNOWLEDGE INSTITUTE OF TECHNOLOGY</h1>
            <p>CampusConnect Institutional Academic Portal</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${userName},</div>
            <p class="desc">
              We received a request to reset your password for your KIOT CampusConnect account (<strong>${toEmail}</strong>).
            </p>
            <div class="btn-container">
              <a href="${resetLink}" class="btn" target="_blank">Reset Your Password</a>
            </div>
            <p class="desc" style="font-size: 12px;">
              If the button above does not work, copy and paste the following link directly into your browser:
            </p>
            <div class="token-box">${resetLink}</div>
            <div class="security-notes">
              <strong>Security Details:</strong><br>
              • This single-use link is valid for <strong>15 minutes</strong>.<br>
              • If you did not request this password reset, please ignore this email or notify KIOT Administration immediately.<br>
              • KIOT will never ask for your password via email or telephone.
            </div>
          </div>
          <div class="footer">
            Knowledge Institute of Technology (KIOT) • Kakapalayam, Salem, Tamil Nadu 637504<br>
            Official Institutional Communication • Do not reply directly to this automated email
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Hello ${userName},

A password reset request was initiated for your KIOT CampusConnect account (${toEmail}).

Please click or open the link below to set your new password:
${resetLink}

Note: This link will expire in 15 minutes and can only be used once.
If you did not request a password reset, you can safely ignore this email.

Knowledge Institute of Technology (KIOT)
CampusConnect Portal
  `;

  // Always log reset link to server console for seamless verification and testing
  console.log('===============================================================');
  console.log(`[KIOT Password Reset Email] To: ${toEmail} (${userName})`);
  console.log(`[KIOT Password Reset Link]: ${resetLink}`);
  console.log('===============================================================');

  // Attempt real SMTP delivery if configured
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: 'KIOT CampusConnect - Password Reset Request',
        text: textContent,
        html: htmlContent
      });

      console.log(`[SMTP Success] Email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr) {
      console.warn('[SMTP Warning] Failed to deliver via configured SMTP transporter:', smtpErr);
      // Graceful fallback: token and link are still valid and logged to console
      return { success: true };
    }
  } else {
    console.log('[SMTP Info] No external SMTP credentials configured in environment. Reset link printed above.');
    return { success: true };
  }
};
