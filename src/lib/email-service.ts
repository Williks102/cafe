// src/lib/email-service.ts
import { Resend } from 'resend';
import { EmailOrderData } from '@/types/email-types';
import { 
  generateCustomerOrderTemplate,
  generateAdminOrderTemplate,
  generateStatusUpdateTemplate,
  generateWelcomeTemplate,
  generatePasswordResetTemplate
} from './email-templates';

// Fonction pour obtenir l'instance Resend de manière sécurisée
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
    return null;
  }
  return new Resend(apiKey);
}

// Configuration des emails
const EMAIL_CONFIG = {
  from: {
    customer: 'MosesCafe <noreply@mosescafe.ci>',
    system: 'Système MosesCafe <system@mosescafe.ci>',
  },
  admin: {
    emails: process.env.ADMIN_EMAILS?.split(',') || [
      'admin@mosescafe.ci',
      'commandes@mosescafe.ci',
    ],
  },
  replyTo: 'contact@mosescafe.ci',
};

export class MosesCafeEmailService {
  
  // Envoyer email de confirmation au client
  static async sendCustomerConfirmation(data: EmailOrderData) {
    const resend = getResendClient();
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, reason: 'service_disabled' };
    }

    if (!data.customerEmail) {
      console.log(`Commande ${data.orderNumber}: Pas d'email client, notification par téléphone uniquement`);
      return { success: false, reason: 'no_email' };
    }

    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from.customer,
        to: [data.customerEmail],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `✅ Commande ${data.orderNumber} confirmée - MosesCafe`,
        html: generateCustomerOrderTemplate(data),
      });

      if (error) {
        console.error(`Erreur envoi email client ${data.orderNumber}:`, error);
        return { success: false, reason: 'email_error' };
      }

      console.log(`✅ Email confirmation envoyé au client ${data.orderNumber}:`, result?.id);
      return { success: true, emailId: result?.id };
    } catch (error) {
      console.error(`Exception envoi email client ${data.orderNumber}:`, error);
      return { success: false, reason: 'exception' };
    }
  }

  // Envoyer notification admin
  static async sendAdminNotification(data: EmailOrderData) {
    const resend = getResendClient();
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, reason: 'service_disabled' };
    }

    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from.system,
        to: EMAIL_CONFIG.admin.emails,
        replyTo: data.customerEmail || EMAIL_CONFIG.replyTo,
        subject: `🚨 NOUVELLE COMMANDE ${data.orderNumber} - ${data.customerName} - ${new Intl.NumberFormat('fr-FR').format(data.totalPrice)} CFA`,
        html: generateAdminOrderTemplate(data),
      });

      if (error) {
        console.error(`Erreur envoi email admin ${data.orderNumber}:`, error);
        return { success: false, reason: 'email_error' };
      }

      console.log(`🚨 Notification admin envoyée ${data.orderNumber}:`, result?.id);
      return { success: true, emailId: result?.id };
    } catch (error) {
      console.error(`Exception envoi email admin ${data.orderNumber}:`, error);
      return { success: false, reason: 'exception' };
    }
  }

  // Envoyer mise à jour de statut
  static async sendStatusUpdate(data: EmailOrderData) {
    const resend = getResendClient();
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, reason: 'service_disabled' };
    }

    if (!data.customerEmail) return { success: false, reason: 'no_email' };

    const statusMessages = {
      'PENDING': '⏳ Votre commande est en attente de confirmation',
      'CONFIRMED': '✅ Votre commande a été confirmée',
      'PREPARING': '👨‍🍳 Votre commande est en préparation',
      'READY': '📦 Votre commande est prête',
      'DELIVERED': '🎉 Votre commande a été livrée',
      'CANCELLED': '❌ Votre commande a été annulée'
    };

    const message = statusMessages[data.status];
    if (!message) {
      console.error(`Statut non géré: ${data.status}`);
      return { success: false, reason: 'invalid_status' };
    }

    // Ne pas envoyer d'email pour PENDING (déjà fait à la création)
    if (data.status === 'PENDING') {
      console.log(`Commande ${data.orderNumber}: Email PENDING ignoré (déjà envoyé à la création)`);
      return { success: false, reason: 'pending_ignored' };
    }

    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from.customer,
        to: [data.customerEmail],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `${message} - Commande ${data.orderNumber}`,
        html: generateStatusUpdateTemplate(data, message),
      });

      if (error) {
        console.error(`Erreur envoi email statut ${data.orderNumber}:`, error);
        return { success: false, reason: 'email_error' };
      }

      console.log(`📧 Email statut ${data.status} envoyé ${data.orderNumber}:`, result?.id);
      return { success: true, emailId: result?.id };
    } catch (error) {
      console.error(`Exception envoi email statut ${data.orderNumber}:`, error);
      return { success: false, reason: 'exception' };
    }
  }

  // Envoyer email de bienvenue
  static async sendWelcomeEmail(userName: string, userEmail: string) {
    const resend = getResendClient();
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, reason: 'service_disabled' };
    }

    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from.customer,
        to: [userEmail],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `🎉 Bienvenue chez MosesCafe, ${userName} !`,
        html: generateWelcomeTemplate(userName, userEmail),
      });

      if (error) {
        console.error(`Erreur envoi email bienvenue:`, error);
        return { success: false, reason: 'email_error' };
      }

      console.log(`🎉 Email bienvenue envoyé à ${userEmail}:`, result?.id);
      return { success: true, emailId: result?.id };
    } catch (error) {
      console.error(`Exception envoi email bienvenue:`, error);
      return { success: false, reason: 'exception' };
    }
  }

  // Envoyer email de réinitialisation de mot de passe
  static async sendPasswordResetEmail(userName: string, userEmail: string, resetToken: string) {
    const resend = getResendClient();
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, reason: 'service_disabled' };
    }

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from.customer,
        to: [userEmail],
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `🔐 Réinitialisation de votre mot de passe - MosesCafe`,
        html: generatePasswordResetTemplate(userName, resetLink),
      });

      if (error) {
        console.error(`Erreur envoi email reset password:`, error);
        return { success: false, reason: 'email_error' };
      }

      console.log(`🔐 Email reset password envoyé à ${userEmail}:`, result?.id);
      return { success: true, emailId: result?.id };
    } catch (error) {
      console.error(`Exception envoi email reset password:`, error);
      return { success: false, reason: 'exception' };
    }
  }

  // Envoyer plusieurs emails en batch (utile pour les notifications groupées)
  static async sendBatchEmails(emails: Array<{
    to: string;
    subject: string;
    html: string;
  }>) {
    const resend = getResendClient();
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, reason: 'service_disabled' };
    }

    try {
      const results = await Promise.allSettled(
        emails.map(email => 
          resend.emails.send({
            from: EMAIL_CONFIG.from.customer,
            to: [email.to],
            replyTo: EMAIL_CONFIG.replyTo,
            subject: email.subject,
            html: email.html,
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`📧 Batch emails: ${successful} réussis, ${failed} échoués`);
      
      return {
        success: failed === 0,
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error(`Exception envoi batch emails:`, error);
      return { success: false, reason: 'exception' };
    }
  }

  // Méthode utilitaire pour tester la configuration email
  static async testEmailConfiguration(testEmail: string) {
    const resend = getResendClient();
    if (!resend) {
      console.log('Email service disabled - RESEND_API_KEY not configured');
      return { success: false, reason: 'service_disabled' };
    }

    try {
      const { data: result, error } = await resend.emails.send({
        from: EMAIL_CONFIG.from.system,
        to: [testEmail],
        subject: `🧪 Test de configuration email - MosesCafe`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Test de configuration email</h2>
            <p>Si vous recevez cet email, la configuration est correcte !</p>
            <p>Configuration actuelle :</p>
            <ul>
              <li>From (Customer): ${EMAIL_CONFIG.from.customer}</li>
              <li>From (System): ${EMAIL_CONFIG.from.system}</li>
              <li>Admin emails: ${EMAIL_CONFIG.admin.emails.join(', ')}</li>
              <li>Reply-to: ${EMAIL_CONFIG.replyTo}</li>
            </ul>
            <p>Date du test : ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
          </div>
        `,
      });

      if (error) {
        console.error(`Erreur test email:`, error);
        return { success: false, reason: 'email_error' };
      }

      console.log(`🧪 Email test envoyé à ${testEmail}:`, result?.id);
      return { success: true, emailId: result?.id };
    } catch (error) {
      console.error(`Exception test email:`, error);
      return { success: false, reason: 'exception' };
    }
  }

  // Méthode pour préparer les données d'email à partir d'une commande
  static prepareEmailData(order: any): EmailOrderData {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber || `#${order.id}`,
      customerName: order.customer?.name || order.user?.name || 'Client',
      customerEmail: order.customer?.email || order.user?.email || null,
      customerPhone: order.customer?.phone || '',
      status: order.status,
      totalPrice: order.totalPrice,
      notes: order.notes,
      items: order.orderItems.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        category: item.product.category
      })),
      orderDate: order.createdAt,
      isUserOrder: !!order.user,
      userName: order.user?.name || null,
      userEmail: order.user?.email || null
    };
  }
}