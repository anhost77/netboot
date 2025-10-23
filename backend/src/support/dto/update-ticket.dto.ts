import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '@prisma/client';

export class UpdateTicketDto {
  @ApiProperty({
    description: 'Ticket status',
    enum: TicketStatus,
    example: 'in_progress',
    required: false,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({
    description: 'Ticket priority',
    enum: TicketPriority,
    example: 'high',
    required: false,
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({
    description: 'Admin ID to assign the ticket to',
    example: 'admin-uuid-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  assignedToAdminId?: string;
}
