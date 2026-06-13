const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Load env vars
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM
} = process.env;

/**
 * Sends email reply to client using Nodemailer
 */
async function sendEmailNotification(toEmail, clientName, replyMessage) {
  const isSmtpConfigured = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS &&
    !SMTP_USER.includes('your-email@gmail.com') &&
    !SMTP_PASS.includes('your-email-app-password');

  const subject = `New Message from VIZO TECH Support`;
  const textContent = `Hello ${clientName},\n\nOur administrator has replied to your inquiry:\n\n"${replyMessage}"\n\nBest regards,\nVIZO TECH Engineering Team`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #0052FF;">VIZO TECH Support Response</h2>
      <p>Hello <strong>${clientName}</strong>,</p>
      <p>Our administrator has replied to your inquiry:</p>
      <blockquote style="background: #f9f9f9; border-left: 5px solid #0052FF; padding: 15px; margin: 20px 0; font-style: italic;">
        ${replyMessage.replace(/\n/g, '<br>')}
      </blockquote>
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

/**
 * Sends WhatsApp notification to client using Twilio
 */
async function sendWhatsAppNotification(toPhone, clientName, replyMessage) {
  const isTwilioConfigured = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM &&
    !TWILIO_ACCOUNT_SID.includes('ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') &&
    !TWILIO_AUTH_TOKEN.includes('your_twilio_auth_token');

  // Clean phone number (remove non-digits except +)
  let cleanPhone = toPhone.trim().replace(/[^\d+]/g, '');
  if (!cleanPhone.startsWith('+')) {
    // Add plus if it's missing (assume country code prefix or provide standard format)
    cleanPhone = '+' + cleanPhone;
  }

  const messageText = `Hello ${clientName}, VIZO TECH has replied to your inquiry: "${replyMessage}"`;

  if (isTwilioConfigured) {
    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

      const response = await client.messages.create({
        body: messageText,
        from: TWILIO_WHATSAPP_FROM, // e.g. 'whatsapp:+14155238886'
        to: `whatsapp:${cleanPhone}`
      });

      console.log(`[WHATSAPP] Successfully sent message to ${cleanPhone}. SID: ${response.sid}`);
    } catch (err) {
      console.error('[WHATSAPP ERROR] Failed to send WhatsApp via Twilio:', err.message);
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[WHATSAPP NOTIFICATION MOCK]`);
    console.log(`To: whatsapp:${cleanPhone}`);
    console.log(`Message: ${messageText}`);
    console.log(`======================================================\n`);
  }
}

module.exports = {
  sendEmailNotification,
  sendWhatsAppNotification
};
