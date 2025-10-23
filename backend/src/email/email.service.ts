import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationsService } from '../notifications/notifications.service';

interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly templatesDir: string;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private isConfigured: boolean = false;

  constructor(
    private config: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.templatesDir = path.join(__dirname, '..', '..', 'email-templates');
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.config.get('SMTP_HOST');
    const smtpPort = this.config.get('SMTP_PORT');
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPass = this.config.get('SMTP_PASS');
    const smtpFrom = this.config.get('SMTP_FROM') || 'noreply@bettracker.pro';

    if (!smtpHost || !smtpPort) {
      this.logger.warn('⚠️  SMTP not configured - Email service running in DEMO MODE');
      this.logger.warn('   Emails will be logged to console only');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465,
        auth: smtpUser && smtpPass ? {
          user: smtpUser,
          pass: smtpPass,
        } : undefined,
      });

      this.isConfigured = true;
      this.logger.log('✅ SMTP configured successfully');
    } catch (error) {
      this.logger.error('❌ Failed to configure SMTP:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      let html = options.html;
      let text = options.text;

      // If template is specified, render it
      if (options.template) {
        const rendered = await this.renderTemplate(options.template, options.context || {});
        html = rendered;
        // Strip HTML tags for text version
        text = rendered.replace(/<[^>]*>/g, '');
      }

      const mailOptions = {
        from: this.config.get('SMTP_FROM') || 'BetTracker Pro <noreply@bettracker.pro>',
        to: options.to,
        subject: options.subject,
        html,
        text,
      };

      if (!this.isConfigured) {
        // Demo mode - just log
        this.logger.log('📧 [DEMO MODE] Email would be sent:');
        this.logger.log(`   To: ${mailOptions.to}`);
        this.logger.log(`   Subject: ${mailOptions.subject}`);
        this.logger.log(`   Template: ${options.template || 'custom'}`);
        return true;
      }

      // Send real email
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${options.to}:`, error.message);
      return false;
    }
  }

  /**
   * Render email template with Handlebars
   */
  private async renderTemplate(templateName: string, context: any): Promise<string> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      const template = this.templateCache.get(templateName)!;
      return template(context);
    }

    // Load and compile template
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      this.logger.warn(`Template not found: ${templateName}, using default`);
      return this.getDefaultTemplate(context);
    }

    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    // Cache the compiled template
    this.templateCache.set(templateName, template);

    return template(context);
  }

  /**
   * Default email template
   */
  private getDefaultTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BetTracker Pro</h1>
            </div>
            <div class="content">
              ${context.content || context.message || ''}
            </div>
            <div class="footer">
              <p>&copy; 2025 BetTracker Pro. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // ============ TRANSACTIONAL EMAILS ============

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string, token: string, userId: string) {
    const verificationUrl = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const sent = await this.sendEmail({
      to: email,
      subject: 'Vérifiez votre adresse email - BetTracker Pro',
      template: 'verify-email',
      context: {
        verificationUrl,
        email,
      },
    });

    if (sent) {
      await this.notificationsService.notifyInfo(
        userId,
        'Email de vérification envoyé',
        'Consultez votre boîte mail pour vérifier votre adresse email',
      );
    }

    return sent;
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, token: string, userId?: string) {
    const resetUrl = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const sent = await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - BetTracker Pro',
      template: 'reset-password',
      context: {
        resetUrl,
        email,
      },
    });

    if (sent && userId) {
      await this.notificationsService.notifyInfo(
        userId,
        'Email de réinitialisation envoyé',
        'Consultez votre boîte mail pour réinitialiser votre mot de passe',
      );
    }

    return sent;
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string, userId: string) {
    const sent = await this.sendEmail({
      to: email,
      subject: 'Bienvenue sur BetTracker Pro ! 🎉',
      template: 'welcome',
      context: {
        firstName,
        dashboardUrl: `${this.config.get('FRONTEND_URL')}/dashboard`,
      },
    });

    if (sent) {
      await this.notificationsService.notifySuccess(
        userId,
        'Bienvenue sur BetTracker Pro !',
        'Votre compte a été créé avec succès',
        '/dashboard',
      );
    }

    return sent;
  }

  /**
   * Send subscription activated email
   */
  async sendSubscriptionActivated(email: string, planName: string, userId: string) {
    const sent = await this.sendEmail({
      to: email,
      subject: `Abonnement ${planName} activé - BetTracker Pro`,
      template: 'subscription-activated',
      context: {
        planName,
        dashboardUrl: `${this.config.get('FRONTEND_URL')}/subscriptions`,
      },
    });

    if (sent) {
      await this.notificationsService.notifySuccess(
        userId,
        'Abonnement activé',
        `Votre abonnement ${planName} a été activé avec succès`,
        '/subscriptions',
      );
    }

    return sent;
  }

  /**
   * Send invoice email
   */
  async sendInvoice(email: string, invoiceNumber: string, amount: number, userId: string) {
    const sent = await this.sendEmail({
      to: email,
      subject: `Nouvelle facture ${invoiceNumber} - BetTracker Pro`,
      template: 'invoice',
      context: {
        invoiceNumber,
        amount: amount.toFixed(2),
        invoiceUrl: `${this.config.get('FRONTEND_URL')}/invoices/${invoiceNumber}`,
      },
    });

    if (sent) {
      await this.notificationsService.notifyInfo(
        userId,
        'Nouvelle facture disponible',
        `Facture ${invoiceNumber} d'un montant de ${amount.toFixed(2)}€`,
        '/subscriptions/invoices',
      );
    }

    return sent;
  }

  /**
   * Send subscription cancelled email
   */
  async sendSubscriptionCancelled(email: string, endDate: Date, userId: string) {
    const sent = await this.sendEmail({
      to: email,
      subject: 'Abonnement annulé - BetTracker Pro',
      template: 'subscription-cancelled',
      context: {
        endDate: endDate.toLocaleDateString('fr-FR'),
        subscriptionUrl: `${this.config.get('FRONTEND_URL')}/subscriptions`,
      },
    });

    if (sent) {
      await this.notificationsService.notifyWarning(
        userId,
        'Abonnement annulé',
        `Votre abonnement prendra fin le ${endDate.toLocaleDateString('fr-FR')}`,
        '/subscriptions',
      );
    }

    return sent;
  }

  /**
   * Send support ticket reply email
   */
  async sendSupportReply(email: string, ticketNumber: string, userId: string) {
    const sent = await this.sendEmail({
      to: email,
      subject: `Nouvelle réponse au ticket #${ticketNumber} - BetTracker Pro`,
      template: 'support-reply',
      context: {
        ticketNumber,
        ticketUrl: `${this.config.get('FRONTEND_URL')}/support/${ticketNumber}`,
      },
    });

    if (sent) {
      await this.notificationsService.notifyInfo(
        userId,
        'Nouvelle réponse à votre ticket',
        `Le support a répondu au ticket #${ticketNumber}`,
        `/support/${ticketNumber}`,
      );
    }

    return sent;
  }

  /**
   * Get email service status
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      mode: this.isConfigured ? 'production' : 'demo',
      smtp: this.isConfigured
        ? {
            host: this.config.get('SMTP_HOST'),
            port: this.config.get('SMTP_PORT'),
            from: this.config.get('SMTP_FROM') || 'noreply@bettracker.pro',
          }
        : null,
      templatesLoaded: this.templateCache.size,
      message: this.isConfigured
        ? 'Email service is operational'
        : 'Email service running in DEMO MODE - emails will be logged to console only',
    };
  }
}
