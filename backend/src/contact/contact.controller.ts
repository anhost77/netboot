import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { EmailService } from '../email/email.service';

class ContactDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Send contact form email' })
  async sendContactEmail(@Body() contactDto: ContactDto) {
    const { name, email, subject, message } = contactDto;

    // Validation basique
    if (!name || !email || !subject || !message) {
      throw new HttpException(
        'Tous les champs sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpException(
        'Email invalide',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Envoyer l'email à l'équipe
      await this.emailService.sendEmail({
        to: 'contact@bettracker.pro',
        subject: `[Contact] ${subject}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>De:</strong> ${name} (${email})</p>
          <p><strong>Sujet:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });

      // Envoyer un email de confirmation à l'utilisateur
      await this.emailService.sendEmail({
        to: email,
        subject: 'Nous avons bien reçu votre message',
        html: `
          <h2>Bonjour ${name},</h2>
          <p>Merci de nous avoir contactés. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
          <p><strong>Votre message :</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <br>
          <p>Cordialement,<br>L'équipe BetTracker Pro</p>
        `,
      });

      return {
        success: true,
        message: 'Message envoyé avec succès',
      };
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw new HttpException(
        'Erreur lors de l\'envoi du message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
