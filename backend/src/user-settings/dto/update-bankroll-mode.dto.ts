import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankrollModeDto {
  @ApiProperty({
    description: 'Bankroll deduction mode',
    enum: ['immediate', 'on_loss'],
    example: 'immediate',
  })
  @IsEnum(['immediate', 'on_loss'], {
    message: 'bankrollMode must be either "immediate" or "on_loss"',
  })
  bankrollMode: 'immediate' | 'on_loss';
}
