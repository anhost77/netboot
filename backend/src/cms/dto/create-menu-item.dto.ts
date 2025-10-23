import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({
    description: 'Menu type',
    enum: ['header', 'footer'],
    example: 'header',
  })
  @IsEnum(['header', 'footer'])
  menuType: 'header' | 'footer';

  @ApiProperty({
    description: 'Parent menu item ID (for nested menus)',
    example: 'parent-uuid-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Menu item title',
    example: 'À propos',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Menu item URL',
    example: '/about',
  })
  @IsString()
  url: string;

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
