// src/services/EmailService.ts
import { mailer } from '@config/mailer';
import { logger } from '@config/logger';
import { env } from '@config/env';

export class EmailService {
  // ─── Layout commun (header + footer) ──────────────────────
  private getLayout(content: string, title: string): string {
    const siteName = 'Youth Computing';
    const siteUrl = env.FRONTEND_URL || 'https://youthcomputing.mg';
    const year = new Date().getFullYear();

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          /* Reset */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f7fc;
            padding: 20px;
            line-height: 1.6;
            color: #1e293b;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #0b1a4a, #1a3a8a);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .header h1 span { color: #ffd700; }
          .header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            margin: 8px 0 0;
          }
          .body { padding: 32px 28px; }
          .body h2 {
            font-size: 20px;
            font-weight: 600;
            color: #0b1a4a;
            margin-bottom: 16px;
          }
          .body p { margin-bottom: 12px; }
          .body .button {
            display: inline-block;
            padding: 10px 24px;
            background: #1a3a8a;
            color: #ffffff !important;
            border-radius: 40px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }
          .body .button:hover { background: #0b1a4a; }
          .body .info-box {
            background: #f1f5f9;
            border-radius: 10px;
            padding: 16px 20px;
            margin: 16px 0;
            font-size: 14px;
          }
          .body .info-box strong { color: #0b1a4a; }
          .footer {
            padding: 20px 28px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 13px;
            color: #94a3b8;
            background: #fafbfc;
          }
          .footer a { color: #1a3a8a; text-decoration: none; }
          .footer a:hover { text-decoration: underline; }
          .footer .social {
            margin-top: 8px;
            display: flex;
            justify-content: center;
            gap: 12px;
          }
          .footer .social a {
            color: #94a3b8;
            font-size: 18px;
            text-decoration: none;
          }
          .footer .social a:hover { color: #1a3a8a; }
          @media (max-width: 480px) {
            .body { padding: 20px; }
            .body .button { width: 100%; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ <span>Youth</span> Computing</h1>
            <p>${title}</p>
          </div>
          <div class="body">
            ${content}
          </div>
          <div class="footer">
            <p>
              Cet email a été envoyé par <strong>Youth Computing</strong>.<br />
              <a href="${siteUrl}">${siteUrl}</a>
            </p>
            <div class="social">
              <a href="https://facebook.com/youthcomputing" target="_blank">📘</a>
              <a href="https://twitter.com/youthcomputing" target="_blank">🐦</a>
              <a href="https://linkedin.com/company/youthcomputing" target="_blank">💼</a>
            </div>
            <p style="margin-top:10px; font-size:11px; color:#b0b8c4;">
              &copy; ${year} Youth Computing. Tous droits réservés.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ─── Email de bienvenue ────────────────────────────────────
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) {
        logger.warn(`📧 Welcome email not sent to ${email}: mailer unavailable`);
        return false;
      }

      const content = `
        <h2>Bienvenue, ${name} ! 👋</h2>
        <p>Nous sommes ravis de vous compter parmi la communauté <strong>Youth Computing</strong>.</p>
        <p>Sur notre plateforme, vous pourrez :</p>
        <ul>
          <li>🎓 Découvrir nos formations en NTIC</li>
          <li>📅 Participer à des événements exclusifs</li>
          <li>🤝 Échanger avec une communauté passionnée</li>
        </ul>
        <p style="text-align:center; margin-top:20px;">
          <a href="${env.FRONTEND_URL}/formations" class="button">Explorer les formations</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          Si vous avez des questions, n’hésitez pas à nous contacter.
        </p>
      `;

      await mailer.sendTemplatedEmail(email, 'welcome', {
        name,
        content,
        html: this.getLayout(content, 'Bienvenue sur Youth Computing'),
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  // ─── Confirmation d’inscription ────────────────────────────
  async sendRegistrationConfirmation(
    email: string,
    name: string,
    formation: string,
    date: string
  ): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;

      const content = `
        <h2>✅ Inscription confirmée</h2>
        <p>Bonjour ${name},</p>
        <p>Votre inscription à la formation <strong>« ${formation} »</strong> a bien été enregistrée.</p>
        <div class="info-box">
          <p><strong>📅 Date :</strong> ${date}</p>
          <p><strong>📍 Lieu :</strong> À venir (ou en ligne)</p>
        </div>
        <p>Nous vous enverrons tous les détails logistiques sous 48h.</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${env.FRONTEND_URL}/formations" class="button">Voir nos formations</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          À très bientôt sur Youth Computing !
        </p>
      `;

      await mailer.sendTemplatedEmail(email, 'registration-confirmation', {
        name,
        content,
        html: this.getLayout(content, 'Confirmation d’inscription'),
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send registration confirmation to ${email}:`, error);
      return false;
    }
  }

  // ─── Confirmation de paiement ──────────────────────────────
  async sendPaymentConfirmation(
    email: string,
    name: string,
    amount: number,
    reference: string
  ): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;

      const content = `
        <h2>💳 Paiement confirmé</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons bien reçu votre paiement de <strong>${amount.toLocaleString()} MGA</strong>.</p>
        <div class="info-box">
          <p><strong>Référence :</strong> ${reference}</p>
          <p><strong>Montant :</strong> ${amount.toLocaleString()} MGA</p>
        </div>
        <p>Votre inscription est désormais définitive.</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${env.FRONTEND_URL}/dashboard" class="button">Accéder à mon compte</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          Merci pour votre confiance.
        </p>
      `;

      await mailer.sendTemplatedEmail(email, 'payment-confirmation', {
        name,
        content,
        html: this.getLayout(content, 'Confirmation de paiement'),
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send payment confirmation to ${email}:`, error);
      return false;
    }
  }

  // ─── Réinitialisation de mot de passe ──────────────────────
  async sendPasswordReset(email: string, name: string, token: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;

      const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

      const content = `
        <h2>🔐 Réinitialisation du mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé une réinitialisation de votre mot de passe sur <strong>Youth Computing</strong>.</p>
        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          ⏳ Ce lien est valable <strong>15 minutes</strong>. Si vous n’avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
      `;

      await mailer.sendTemplatedEmail(email, 'reset-password', {
        name,
        content,
        html: this.getLayout(content, 'Réinitialisation du mot de passe'),
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  // ─── Newsletter ─────────────────────────────────────────────
  async sendNewsletter(email: string, subject: string, content: string): Promise<boolean> {
    try {
      if (!mailer.isAvailable()) return false;

      // On utilise le même layout pour la newsletter, mais on laisse le contenu libre
      const html = this.getLayout(content, subject);

      await mailer.sendMail({
        to: email,
        subject,
        html,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send newsletter to ${email}:`, error);
      return false;
    }
  }
}