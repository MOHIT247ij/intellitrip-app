/**
 * email.provider.js
 * -----------------------------------------------------------------
 * Provider abstraction: EmailProvider
 *                          ├── MockEmailProvider  (console log only)
 *                          └── GmailEmailProvider (real send via
 *                                Nodemailer + Gmail SMTP, using a
 *                                Google Account "App Password" — not
 *                                your normal Gmail password)
 *
 * Controlled by env EMAIL_PROVIDER=mock|gmail. Selected automatically
 * by whether GMAIL_USER / GMAIL_APP_PASSWORD are configured; if the
 * real send throws for any reason (bad credentials, no network, Gmail
 * rate limit, etc.) we log the error and resolve `{ sent:false }`
 * instead of throwing, so a broken mail configuration never blocks
 * registration/login — the caller can still fall back to OTP_DEV_MODE.
 *
 * Setup (see README "Real Email OTP (Gmail SMTP)" section):
 *   1. Turn on 2-Step Verification on the Gmail account.
 *   2. Create an "App password" at https://myaccount.google.com/apppasswords
 *   3. Set EMAIL_PROVIDER=gmail, GMAIL_USER=you@gmail.com,
 *      GMAIL_APP_PASSWORD=<the 16-character app password>.
 * -----------------------------------------------------------------
 */
const env = require('../config/env');
const logger = require('../config/logger');

let nodemailer;
try {
  // Lazy require so the module still loads (in mock mode) even in an
  // environment where `npm install` hasn't pulled in nodemailer yet.
  // eslint-disable-next-line global-require
  nodemailer = require('nodemailer');
} catch (err) {
  nodemailer = null;
}

let cachedTransporter = null;
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  if (!nodemailer) throw new Error('nodemailer is not installed. Run `npm install` in /backend.');
  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.notifications.gmailUser,
      pass: env.notifications.gmailAppPassword,
    },
  });
  return cachedTransporter;
}

function otpEmailHtml({ name, otp, purpose, expiryMinutes }) {
  const action = purpose === 'LOGIN' ? 'log in to' : 'verify';
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
    <h2 style="color:#0d9488;margin:0 0 8px;">IntelliTrip</h2>
    <p style="color:#334155;font-size:14px;">Hi ${name || 'there'},</p>
    <p style="color:#334155;font-size:14px;">Use the code below to ${action} your IntelliTrip account:</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a;background:#f0fdfa;padding:16px;border-radius:12px;text-align:center;margin:16px 0;">${otp}</div>
    <p style="color:#64748b;font-size:12px;">This code expires in ${expiryMinutes} minutes. If you did not request this, you can safely ignore this email.</p>
  </div>`;
}

/**
 * sendOtpEmail — attempts a real send when EMAIL_PROVIDER=gmail and
 * credentials are configured; otherwise (or on any failure) falls
 * back to a console log and resolves { sent:false, mock:true }.
 */
async function sendOtpEmail({ to, name, otp, purpose, expiryMinutes }) {
  if (!to) return { sent: false, mock: true, reason: 'no-email-on-file' };

  const useGmail = env.notifications.emailProvider === 'gmail'
    && env.notifications.gmailUser
    && env.notifications.gmailAppPassword;

  if (!useGmail) {
    logger.info(`[MOCK EMAIL] to=${to} purpose=${purpose} otp=${otp}`);
    return { sent: false, mock: true, provider: 'MockEmailProvider' };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${env.notifications.emailFromName}" <${env.notifications.gmailUser}>`,
      to,
      subject: `Your IntelliTrip verification code: ${otp}`,
      html: otpEmailHtml({ name, otp, purpose, expiryMinutes }),
      text: `Your IntelliTrip verification code is ${otp}. It expires in ${expiryMinutes} minutes.`,
    });
    logger.info(`[EMAIL SENT] Gmail SMTP -> ${to} (purpose=${purpose})`);
    return { sent: true, mock: false, provider: 'GmailEmailProvider' };
  } catch (err) {
    logger.warn(`[EMAIL FAILED] Gmail SMTP send to ${to} failed: ${err.message}. Falling back silently — check GMAIL_USER/GMAIL_APP_PASSWORD.`);
    return { sent: false, mock: false, provider: 'GmailEmailProvider', error: err.message };
  }
}

module.exports = { sendOtpEmail };
