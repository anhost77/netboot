import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBetResultDto {
  @ApiProperty({
    description: 'Bet result status',
    enum: ['won', 'lost', 'refunded'],
    example: 'won',
  })
  @IsEnum(['won', 'lost', 'refunded'])
  status: 'won' | 'lost' | 'refunded';

  @ApiProperty({
    description: 'Final odds (actual odds from the platform)',
    example: 3.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  finalOdds?: number;

  @ApiProperty({
    description: 'Actual payout received',
    example: 35.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  payout?: number;
}
