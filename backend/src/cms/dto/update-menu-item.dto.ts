import { IsString, IsEnum, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuItemDto {
  @ApiProperty({
    description: 'Menu type',
    enum: ['header', 'footer'],
    example: 'header',
    required: false,
  })
  @IsEnum(['header', 'footer'])
  @IsOptional()
  menuType?: 'header' | 'footer';

  @ApiProperty({
    description: 'Parent menu item ID (null to remove parent)',
    example: 'parent-uuid-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string | null;

  @ApiProperty({
    description: 'Menu item title',
    example: 'À propos',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Menu item URL',
    example: '/about',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'Icon class or name',
    example: 'info-circle',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Display order (lower = first)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({
    description: 'Visibility',
    enum: ['all', 'logged', 'guest', 'admin'],
    example: 'all',
    required: false,
  })
  @IsEnum(['all', 'logged', 'guest', 'admin'])
  @IsOptional()
  visibility?: 'all' | 'logged' | 'guest' | 'admin';

  @ApiProperty({
    description: 'Open in new tab',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean;
}
