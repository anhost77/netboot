import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DemoPaymentDto {
  @ApiProperty({
    description: 'Plan ID to subscribe to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  planId: string;

  @ApiProperty({
    description: 'Billing cycle',
    enum: ['monthly', 'yearly'],
    example: 'monthly',
  })
  @IsEnum(['monthly', 'yearly'])
  billingCycle: 'monthly' | 'yearly';
}
