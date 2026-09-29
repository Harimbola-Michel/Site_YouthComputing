export const renderTemplate = (template: string, data: Record<string, any>): string => {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  }
  return result;
};

export const renderEmailTemplate = (template: string, data: Record<string, any>): string => {
  const content = renderTemplate(template, data);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title || 'Youth Computing'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 0;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #010B40, #0a1a6b);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0 0;
      opacity: 0.8;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #F13544;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 15px 0;
    }
    .button:hover {
      background: #d12e3c;
    }
    .text-center {
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #010B40;
      color: white;
      border-radius: 20px;
      font-size: 12px;
    }
    .divider {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Youth Computing</h1>
      <p>${data.subtitle || 'Association pour la promotion des NTIC'}</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Youth Computing - Tous droits réservés</p>
      <p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #010B40; text-decoration: none;">Site web</a> |
        <a href="mailto:${process.env.EMAIL_FROM || 'contact@youthcomputing.mg'}" style="color: #010B40; text-decoration: none;">Nous contacter</a>
      </p>
      <p style="font-size: 11px; color: #999;">
        Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

export const generateWelcomeEmail = (name: string): string => {
  return renderEmailTemplate(`
    <h2>Bienvenue ${name} !</h2>
    <p>Nous sommes ravis de vous compter parmi les membres de la communauté Youth Computing.</p>
    <p>Grâce à votre adhésion, vous pourrez :</p>
    <ul>
      <li>Participer à nos formations et ateliers</li>
      <li>Accéder à nos ressources exclusives</li>
      <li>Rejoindre notre réseau de professionnels</li>
      <li>Contribuer à nos projets communautaires</li>
    </ul>
    <div class="text-center">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Commencer</a>
    </div>
    <hr class="divider">
    <p style="font-size: 14px; color: #666;">
      N'hésitez pas à nous contacter si vous avez des questions.
    </p>
  `, { name });
};

export const generateRegistrationEmail = (name: string, formation: string): string => {
  return renderEmailTemplate(`
    <h2>Confirmation d'inscription</h2>
    <p>Bonjour ${name},</p>
    <p>Votre inscription à la formation <strong>${formation}</strong> a été confirmée.</p>
    <p>Vous recevrez prochainement tous les détails pratiques.</p>
    <div class="text-center">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/formations" class="button">Voir les formations</a>
    </div>
  `, { name, formation });
};

export const generatePaymentEmail = (name: string, amount: number, reference: string): string => {
  return renderEmailTemplate(`
    <h2>Confirmation de paiement</h2>
    <p>Bonjour ${name},</p>
    <p>Nous avons bien reçu votre paiement de <strong>${amount} MGA</strong>.</p>
    <p><strong>Référence :</strong> ${reference}</p>
    <p>Votre paiement a été traité avec succès.</p>
    <div class="text-center">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Voir mon compte</a>
    </div>
  `, { name, amount, reference });
};

export const generateResetPasswordEmail = (name: string, token: string): string => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  return renderEmailTemplate(`
    <h2>Réinitialisation de mot de passe</h2>
    <p>Bonjour ${name},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
    <div class="text-center">
      <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
    </div>
    <p style="font-size: 14px; color: #999;">
      Ce lien expirera dans <strong>15 minutes</strong>.
    </p>
    <hr class="divider">
    <p style="font-size: 13px; color: #999;">
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    </p>
  `, { name, resetUrl });
};

export const generateNewsletterEmail = (subject: string, content: string): string => {
  return renderEmailTemplate(`
    <h2>${subject}</h2>
    ${content}
    <hr class="divider">
    <p style="font-size: 13px; color: #999;">
      Vous recevez cet email car vous êtes abonné à notre newsletter.
      <br>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe" style="color: #010B40;">Se désabonner</a>
    </p>
  `, { subject, content });
};