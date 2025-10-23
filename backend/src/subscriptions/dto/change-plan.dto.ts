import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePlanDto {
  @ApiProperty({
    description: 'Plan ID to change to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  planId: string;
}
