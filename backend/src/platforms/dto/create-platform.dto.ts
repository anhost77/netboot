import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreatePlatformDto {
  @ApiProperty({
    example: 'PMU',
    description: 'Nom de la plateforme de paris',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 100,
    description: 'Bankroll initiale de la plateforme en euros',
  })
  @IsNumber()
  @IsPositive()
  initialBankroll: number;
}
