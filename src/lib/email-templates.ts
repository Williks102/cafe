import { EmailOrderData } from '@/types/email-types';

// Template de base pour tous les emails
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MosesCafe</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fef3c7;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef3c7; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
                                ☕ MosesCafe
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 16px;">
                                CAFÉ D'EXCEPTION
                            </p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #fef3c7; padding: 20px; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px;">
                                © 2025 MosesCafe - Abidjan, Côte d'Ivoire
                            </p>
                            <p style="margin: 0; color: #92400e; font-size: 12px;">
                                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Template pour la confirmation de commande client
export const generateCustomerOrderTemplate = (data: EmailOrderData): string => {
  const statusIcon = '✅';
  const orderDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Abidjan'
  }).format(data.orderDate);

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">${statusIcon}</div>
        <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: bold;">
            Commande confirmée !
        </h2>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
            Merci ${data.customerName}, votre commande est en cours de préparation.
        </p>
    </div>

    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td style="color: #92400e; font-size: 14px;">
                    <strong>Commande ${data.orderNumber}</strong>
                </td>
                <td align="right" style="color: #92400e; font-size: 14px;">
                    ${orderDate}
                </td>
            </tr>
        </table>
    </div>

    <h3 style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 20px 0 15px 0;">
        Détails de votre commande
    </h3>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
        ${data.items.map(item => `
            <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <div style="color: #1f2937; font-size: 16px; font-weight: 500;">
                        ${item.name}
                    </div>
                    ${item.category ? `<div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${item.category}</div>` : ''}
                </td>
                <td align="center" style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    x${item.quantity}
                </td>
                <td align="right" style="padding: 15px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 16px; font-weight: 500;">
                    ${new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} CFA
                </td>
            </tr>
        `).join('')}
        <tr>
            <td colspan="2" style="padding: 20px 0 0 0; font-size: 18px; font-weight: bold; color: #1f2937;">
                Total
            </td>
            <td align="right" style="padding: 20px 0 0 0; font-size: 20px; font-weight: bold; color: #dc2626;">
                ${new Intl.NumberFormat('fr-FR').format(data.totalPrice)} CFA
            </td>
        </tr>
    </table>

    ${data.notes ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Notes de commande :</h4>
            <p style="margin: 0; color: #1f2937; font-size: 14px;">${data.notes}</p>
        </div>
    ` : ''}

    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
        <p style="margin: 0 0 10px 0; color: #166534; font-size: 16px; font-weight: 500;">
            🎯 Temps de préparation estimé : 10-15 minutes
        </p>
        <p style="margin: 0; color: #166534; font-size: 14px;">
            Nous vous notifierons dès que votre commande sera prête !
        </p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            Des questions ? Contactez-nous :
        </p>
        <p style="margin: 0; color: #1f2937; font-size: 14px;">
            📞 +225 07 00 00 00 00 | 📧 contact@mosescafe.ci
        </p>
    </div>
`;

  return baseTemplate(content);
};

// Template pour la notification admin
export const generateAdminOrderTemplate = (data: EmailOrderData): string => {
  const orderDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Abidjan'
  }).format(data.orderDate);

  const content = `
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h2 style="margin: 0; color: #991b1b; font-size: 24px; font-weight: bold;">
            🚨 NOUVELLE COMMANDE ${data.orderNumber}
        </h2>
    </div>

    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
            Informations client
        </h3>
        <table width="100%" cellpadding="5" cellspacing="0" border="0">
            <tr>
                <td style="color: #6b7280; font-size: 14px; width: 120px;">Nom :</td>
                <td style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.customerName}</td>
            </tr>
            <tr>
                <td style="color: #6b7280; font-size: 14px;">Téléphone :</td>
                <td style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.customerPhone}</td>
            </tr>
            ${data.customerEmail ? `
            <tr>
                <td style="color: #6b7280; font-size: 14px;">Email :</td>
                <td style="color: #1f2937; font-size: 14px; font-weight: 500;">${data.customerEmail}</td>
            </tr>
            ` : ''}
            <tr>
                <td style="color: #6b7280; font-size: 14px;">Type :</td>
                <td style="color: #1f2937; font-size: 14px; font-weight: 500;">
                    ${data.isUserOrder ? '👤 Client connecté' : '🚶 Client invité'}
                </td>
            </tr>
            <tr>
                <td style="color: #6b7280; font-size: 14px;">Date :</td>
                <td style="color: #1f2937; font-size: 14px; font-weight: 500;">${orderDate}</td>
            </tr>
        </table>
    </div>

    <h3 style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 20px 0 15px 0;">
        Articles commandés
    </h3>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
        <tr style="background-color: #f3f4f6;">
            <th align="left" style="padding: 10px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Article</th>
            <th align="center" style="padding: 10px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Qté</th>
            <th align="right" style="padding: 10px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Prix unitaire</th>
            <th align="right" style="padding: 10px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Total</th>
        </tr>
        ${data.items.map(item => `
            <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">
                    <div style="color: #1f2937; font-size: 14px; font-weight: 500;">${item.name}</div>
                    ${item.category ? `<div style="color: #6b7280; font-size: 12px; margin-top: 2px;">${item.category}</div>` : ''}
                </td>
                <td align="center" style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600;">
                    ${item.quantity}
                </td>
                <td align="right" style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    ${new Intl.NumberFormat('fr-FR').format(item.price)} CFA
                </td>
                <td align="right" style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 500;">
                    ${new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} CFA
                </td>
            </tr>
        `).join('')}
        <tr>
            <td colspan="3" align="right" style="padding: 15px 10px 0 10px; font-size: 18px; font-weight: bold; color: #1f2937;">
                TOTAL
            </td>
            <td align="right" style="padding: 15px 10px 0 10px; font-size: 20px; font-weight: bold; color: #dc2626;">
                ${new Intl.NumberFormat('fr-FR').format(data.totalPrice)} CFA
            </td>
        </tr>
    </table>

    ${data.notes ? `
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 5px 0; color: #92400e; font-size: 14px; font-weight: 600;">📝 Notes de commande :</h4>
            <p style="margin: 0; color: #78350f; font-size: 14px;">${data.notes}</p>
        </div>
    ` : ''}

    <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
        <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
            ⚡ Actions requises :
        </p>
        <a href="https://mosescafe.ci/admin/orders/${data.orderId}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Voir la commande
        </a>
    </div>
`;

  return baseTemplate(content);
};

// Template pour les mises à jour de statut
export const generateStatusUpdateTemplate = (data: EmailOrderData, statusMessage: string): string => {
  const statusIcons: Record<string, string> = {
    'CONFIRMED': '✅',
    'PREPARING': '👨‍🍳',
    'READY': '📦',
    'DELIVERED': '🎉',
    'CANCELLED': '❌'
  };

  const statusColors: Record<string, string> = {
    'CONFIRMED': '#059669',
    'PREPARING': '#d97706',
    'READY': '#2563eb',
    'DELIVERED': '#059669',
    'CANCELLED': '#dc2626'
  };

  const icon = statusIcons[data.status] || '📋';
  const color = statusColors[data.status] || '#6b7280';

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
        <h2 style="margin: 0 0 10px 0; color: ${color}; font-size: 24px; font-weight: bold;">
            ${statusMessage}
        </h2>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
            Commande ${data.orderNumber}
        </p>
    </div>

    ${data.status === 'PREPARING' ? `
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 16px;">
                Notre barista prépare votre commande avec soin.<br>
                Temps estimé : 10-15 minutes ⏱️
            </p>
        </div>
    ` : ''}

    ${data.status === 'READY' ? `
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
                Votre commande est prête ! 🎯
            </p>
            <p style="margin: 0; color: #1e40af; font-size: 16px;">
                Venez la récupérer dès que possible pour profiter de sa fraîcheur.
            </p>
        </div>
    ` : ''}

    ${data.status === 'DELIVERED' ? `
        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #166534; font-size: 18px; font-weight: 600;">
                Merci pour votre commande ! ☕
            </p>
            <p style="margin: 0; color: #166534; font-size: 16px;">
                Nous espérons que vous apprécierez votre café.<br>
                À très bientôt chez MosesCafe !
            </p>
        </div>
    ` : ''}

    ${data.status === 'CANCELLED' ? `
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 16px;">
                Votre commande a été annulée.
            </p>
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
                Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
        </div>
    ` : ''}

    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            Rappel de votre commande :
        </h3>
        ${data.items.map(item => `
            <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #1f2937; font-size: 14px;">${item.quantity}x ${item.name}</span>
                <span style="float: right; color: #6b7280; font-size: 14px;">
                    ${new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} CFA
                </span>
            </div>
        `).join('')}
        <div style="padding-top: 12px; text-align: right;">
            <span style="color: #1f2937; font-size: 16px; font-weight: 600;">
                Total : ${new Intl.NumberFormat('fr-FR').format(data.totalPrice)} CFA
            </span>
        </div>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
            Besoin d'aide ?
        </p>
        <p style="margin: 0; color: #1f2937; font-size: 14px;">
            📞 +225 07 00 70 70 16 | 📧 contact@mosescafe.ci
        </p>
    </div>
`;

  return baseTemplate(content);
};

// Template pour l'email de bienvenue (bonus)
export const generateWelcomeTemplate = (userName: string, userEmail: string): string => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
        <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: bold;">
            Bienvenue chez MosesCafe, ${userName} !
        </h2>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
            Votre compte a été créé avec succès.
        </p>
    </div>

    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px; font-weight: 600;">
            ☕ Avantages de votre compte :
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            <li style="margin-bottom: 8px;">Suivi en temps réel de vos commandes</li>
            <li style="margin-bottom: 8px;">Historique de vos achats</li>
            <li style="margin-bottom: 8px;">Commande rapide avec vos préférences</li>
            <li style="margin-bottom: 8px;">Offres exclusives et promotions</li>
        </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://mosescafe.ci/login" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Découvrir notre menu
        </a>
    </div>

    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #166534; font-size: 16px; font-weight: 500;">
            🎁 Cadeau de bienvenue
        </p>
        <p style="margin: 10px 0 0 0; color: #166534; font-size: 14px;">
            Profitez de -10% sur votre première commande avec le code : <strong>BIENVENUE10</strong>
        </p>
    </div>
`;

  return baseTemplate(content);
};

// Template pour la réinitialisation de mot de passe
export const generatePasswordResetTemplate = (userName: string, resetLink: string): string => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
        <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: bold;">
            Réinitialisation de mot de passe
        </h2>
        <p style="margin: 0; color: #6b7280; font-size: 16px;">
            Bonjour ${userName}, vous avez demandé à réinitialiser votre mot de passe.
        </p>
    </div>

    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; text-align: center;">
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
        </p>
        <div style="text-align: center;">
            <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Réinitialiser mon mot de passe
            </a>
        </div>
    </div>

    <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px; text-align: center;">
            ⚠️ Ce lien expire dans 1 heure pour des raisons de sécurité.
        </p>
    </div>

    <div style="text-align: center; color: #6b7280; font-size: 14px;">
        <p style="margin: 0 0 10px 0;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
        <p style="margin: 0;">
            Votre mot de passe restera inchangé.
        </p>
    </div>
`;

  return baseTemplate(content);
};