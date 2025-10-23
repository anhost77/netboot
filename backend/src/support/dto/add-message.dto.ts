import { IsString, IsBoolean, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Merci pour votre réponse. Le problème persiste...',
  })
  @IsString()
  @MinLength(1, { message: 'Le message ne peut pas être vide' })
  message: string;

  @ApiProperty({
    description: 'Attachments (file URLs or paths)',
    example: ['https://example.com/screenshot.png'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @ApiProperty({
    description: 'Is this an internal note (admin only)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isInternalNote?: boolean;
}
