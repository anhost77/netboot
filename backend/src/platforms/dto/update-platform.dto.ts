import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class UpdatePlatformDto {
  @ApiPropertyOptional({
    example: 'Betclic',
    description: 'Nom de la plateforme',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'PMU',
    description: 'Type de plateforme (PMU ou OTHER)',
    enum: ['PMU', 'OTHER'],
  })
  @IsOptional()
  @IsEnum(['PMU', 'OTHER'])
  platformType?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Statut actif de la plateforme',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
