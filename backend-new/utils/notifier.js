const nodemailer = require('nodemailer');

// Load env vars
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

/**
 * Sends email reply to client using Nodemailer
 */
async function sendEmailNotification(toEmail, clientName, replyMessage, attachmentUrl = '') {
  const isSmtpConfigured = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS &&
    !SMTP_USER.includes('your-email@gmail.com') &&
    !SMTP_PASS.includes('your-email-app-password');

  let attachmentHtml = '';
  let attachmentText = '';
  if (attachmentUrl) {
    const fileName = attachmentUrl.split('/').pop() || 'Attached File';
    attachmentHtml = `
      <div style="margin: 20px 0; padding: 12px; background: #f0f4ff; border-radius: 8px; border: 1px dashed #0052FF; text-align: center;">
        <span style="font-size: 13px; color: #555; display: block; margin-bottom: 6px;">📎 The administrator attached a file:</span>
        <a href="${attachmentUrl}" target="_blank" style="color: #0052FF; text-decoration: none; font-weight: bold; font-size: 14px; border: 1px solid #0052FF; padding: 6px 12px; border-radius: 4px; display: inline-block; background: #fff;">
          Download Attachment
        </a>
      </div>
    `;
    attachmentText = `\n\n📎 Attached File: ${attachmentUrl}`;
  }

  const subject = `New Message from VIZO TECH Support`;
  const textContent = `Hello ${clientName},\n\nOur administrator has replied to your inquiry:\n\n"${replyMessage}"${attachmentText}\n\nBest regards,\nVIZO TECH Engineering Team`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #0052FF;">VIZO TECH Support Response</h2>
      <p>Hello <strong>${clientName}</strong>,</p>
      <p>Our administrator has replied to your inquiry:</p>
      <blockquote style="background: #f9f9f9; border-left: 5px solid #0052FF; padding: 15px; margin: 20px 0; font-style: italic;">
        ${replyMessage.replace(/\n/g, '<br>')}
      </blockquote>
      ${attachmentHtml}
      <p>Best regards,<br><strong>VIZO TECH Engineering Team</strong></p>
    </div>
  `;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: SMTP_FROM || '"VIZO TECH" <admin@vizotech.agency>',
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`[EMAIL] Successfully sent email to ${toEmail}`);
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send email via SMTP:', err.message);
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[EMAIL NOTIFICATION MOCK]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${textContent}`);
    console.log(`======================================================\n`);
  }
}

module.exports = {
  sendEmailNotification
};
