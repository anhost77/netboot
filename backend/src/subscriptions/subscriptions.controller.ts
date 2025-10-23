import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  getAllPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current subscription' })
  getCurrentSubscription(@Request() req: any) {
    return this.subscriptionsService.getCurrentSubscription(req.user.id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create checkout session (demo mode)' })
  createCheckoutSession(
    @Request() req: any,
    @Body() body: { planId: string; billingCycle: 'monthly' | 'yearly' },
  ) {
    return this.subscriptionsService.createCheckoutSession(
      req.user.id,
      body.planId,
      body.billingCycle,
    );
  }

  @Post('change-plan')
  @ApiOperation({ summary: 'Change subscription plan' })
  changePlan(@Request() req: any, @Body() body: { planId: string }) {
    return this.subscriptionsService.changePlan(req.user.id, body.planId);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancelSubscription(@Request() req: any) {
    return this.subscriptionsService.cancelSubscription(req.user.id);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume cancelled subscription' })
  resumeSubscription(@Request() req: any) {
    return this.subscriptionsService.resumeSubscription(req.user.id);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  getInvoices(@Request() req: any) {
    return this.subscriptionsService.getInvoices(req.user.id);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get a specific invoice' })
  getInvoice(@Request() req: any, @Param('id') id: string) {
    return this.subscriptionsService.getInvoice(req.user.id, id);
  }

  @Post('demo/payment')
  @ApiOperation({
    summary: '[DEMO ONLY] Simulate payment and activate subscription',
    description: 'This endpoint simulates a successful payment in demo mode. Only works when Stripe is not configured.',
  })
  simulateDemoPayment(
    @Request() req: any,
    @Body() body: { planId: string; billingCycle: 'monthly' | 'yearly' },
  ) {
    return this.subscriptionsService.simulateDemoPayment(
      req.user.id,
      body.planId,
      body.billingCycle,
    );
  }
}
