import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

export class TicketFiltersDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by status',
    enum: TicketStatus,
    required: false,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({
    description: 'Filter by priority',
    enum: TicketPriority,
    required: false,
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({
    description: 'Filter by category',
    enum: TicketCategory,
    required: false,
  })
  @IsEnum(TicketCategory)
  @IsOptional()
  category?: TicketCategory;

  @ApiProperty({
    description: 'Filter by user ID (admin only)',
    example: 'user-uuid-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Filter by assigned admin ID (admin only)',
    example: 'admin-uuid-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  assignedToAdminId?: string;
}
