import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlatformDto {
  @ApiPropertyOptional({
    example: 'Betclic',
    description: 'Nom de la plateforme',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Statut actif de la plateforme',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
