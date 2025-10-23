import { IsString, IsEnum, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCategory, TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket subject',
    example: 'Problème de synchronisation des données',
  })
  @IsString()
  @MinLength(5, { message: 'Le sujet doit contenir au moins 5 caractères' })
  subject: string;

  @ApiProperty({
    description: 'Ticket category',
    enum: TicketCategory,
    example: 'technical',
  })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiProperty({
    description: 'Ticket priority',
    enum: TicketPriority,
    example: 'normal',
    required: false,
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({
    description: 'Initial message/description',
    example: 'Mes données de paris ne se synchronisent pas correctement...',
  })
  @IsString()
  @MinLength(10, { message: 'Le message doit contenir au moins 10 caractères' })
  message: string;

  @ApiProperty({
    description: 'Attachments (file URLs or paths)',
    example: ['https://example.com/screenshot.png'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}
