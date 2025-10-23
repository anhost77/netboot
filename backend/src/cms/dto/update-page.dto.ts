import { IsString, IsBoolean, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageDto {
  @ApiProperty({
    description: 'Page slug (URL-friendly)',
    example: 'mentions-legales',
    required: false,
  })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Le slug doit être en minuscules avec tirets uniquement (ex: ma-page)',
  })
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Page title',
    example: 'Mentions Légales',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Page content (HTML or markdown)',
    example: '<h1>Mentions Légales</h1><p>Contenu...</p>',
    required: false,
  })
  @IsString()
  @MinLength(10)
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'SEO meta title',
    example: 'Mentions Légales - BetTracker Pro',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    description: 'SEO meta description',
    example: 'Consultez nos mentions légales et conditions d\'utilisation',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({
    description: 'Is the page published',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
