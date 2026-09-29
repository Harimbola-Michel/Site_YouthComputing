import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

let transporter: nodemailer.Transporter | null = null;

if (env.ENABLE_EMAIL && env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection
  transporter.verify((error) => {
    if (error) {
      logger.error('SMTP connection failed:', error);
    } else {
      logger.info('SMTP configured successfully');
    }
  });
} else {
  logger.warn('Email service disabled or not configured');
}

// Fonction d'envoi réutilisable
const sendMail = async (options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}) => {
  if (!transporter) {
    logger.warn('Email service not available, skipping send');
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || env.EMAIL_FROM || 'noreply@youthcomputing.mg',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });

    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

export const mailer = {
  sendMail,
  sendTemplatedEmail: async (
    to: string,
    template: string,
    data: Record<string, any>
  ) => {
    // À terme, on utilisera de vrais templates
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #010B40; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Youth Computing</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${data.name || ''}</h2>
              ${data.content || ''}
            </div>
            <div class="footer">
              <p>&copy; 2024 Youth Computing. Tous droits réservés.</p>
              <p>
                <a href="${env.FRONTEND_URL}">Site web</a> |
                <a href="mailto:${env.EMAIL_FROM}">Nous contacter</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Appel direct à sendMail (sans this)
    return sendMail({
      to,
      subject: `Youth Computing - ${template}`,
      html,
    });
  },
};

export default mailer;