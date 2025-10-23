import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Send email (admin only)',
    description:
      'Send a custom email using a template or raw HTML. For testing and admin purposes.',
  })
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() dto: SendEmailDto) {
    const success = await this.emailService.sendEmail({
      to: dto.to,
      subject: dto.subject,
      template: dto.template,
      context: dto.context,
      html: dto.html,
    });

    return {
      success,
      message: success
        ? 'Email sent successfully'
        : 'Failed to send email (check logs)',
    };
  }

  @Get('templates')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'List available email templates (admin only)',
    description: 'Get a list of all available email templates',
  })
  getTemplates() {
    return {
      templates: [
        {
          name: 'verify-email',
          description: 'Email verification template',
          variables: ['email', 'verificationUrl'],
        },
        {
          name: 'reset-password',
          description: 'Password reset template',
          variables: ['email', 'resetUrl'],
        },
        {
          name: 'welcome',
          description: 'Welcome email for new users',
          variables: ['firstName', 'dashboardUrl'],
        },
        {
          name: 'subscription-activated',
          description: 'Subscription activation confirmation',
          variables: ['planName', 'dashboardUrl', 'unsubscribeUrl'],
        },
        {
          name: 'invoice',
          description: 'Invoice notification',
          variables: [
            'invoiceNumber',
            'amount',
            'date',
            'paymentMethod',
            'invoiceUrl',
            'billingUrl',
          ],
        },
        {
          name: 'subscription-cancelled',
          description: 'Subscription cancellation confirmation',
          variables: ['endDate', 'reactivateUrl', 'supportUrl'],
        },
        {
          name: 'support-reply',
          description: 'Support ticket reply notification',
          variables: [
            'ticketNumber',
            'replyMessage',
            'agentName',
            'replyDate',
            'ticketUrl',
            'supportUrl',
          ],
        },
      ],
    };
  }

  @Get('status')
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Get email service status (admin only)',
    description: 'Check if SMTP is configured and email service is operational',
  })
  getStatus() {
    return this.emailService.getStatus();
  }
}
