import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';

export class CreateTipsterDto {
  @ApiProperty({ example: 'PronoExpert', description: 'Nom du tipster' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Expert en courses hippiques', description: 'Description du tipster' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://pronoexpert.com', description: 'Site web du tipster' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ 
    example: { twitter: '@pronoexpert', telegram: 'pronoexpert_channel' }, 
    description: 'Réseaux sociaux du tipster' 
  })
  @IsObject()
  @IsOptional()
  socialMedia?: Record<string, string>;

  @ApiPropertyOptional({ example: '#3B82F6', description: 'Couleur pour l\'UI (hex)' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: true, description: 'Tipster actif ou non' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
