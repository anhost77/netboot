import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Test Email',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Email template name (without .hbs extension)',
    example: 'welcome',
    required: false,
  })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({
    description: 'Template variables as key-value pairs',
    example: { firstName: 'John', verificationUrl: 'https://...' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @ApiProperty({
    description: 'Custom HTML content (if not using template)',
    example: '<h1>Hello</h1><p>This is a test email</p>',
    required: false,
  })
  @IsString()
  @IsOptional()
  html?: string;
}
