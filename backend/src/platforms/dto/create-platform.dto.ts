import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsEnum } from 'class-validator';

export class CreatePlatformDto {
  @ApiProperty({
    example: 'PMU',
    description: 'Nom de la plateforme de paris',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'PMU',
    description: 'Type de plateforme (PMU ou OTHER)',
    enum: ['PMU', 'OTHER'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PMU', 'OTHER'])
  platformType?: string;

  @ApiProperty({
    example: 100,
    description: 'Bankroll initiale de la plateforme en euros',
  })
  @IsNumber()
  @IsPositive()
  initialBankroll: number;
}
