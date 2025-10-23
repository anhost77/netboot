import { IsArray, IsString, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MenuItemOrder {
  @ApiProperty({
    description: 'Menu item ID',
    example: 'menu-uuid-123',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'New display order',
    example: 1,
  })
  @IsInt()
  displayOrder: number;
}

export class ReorderMenuDto {
  @ApiProperty({
    description: 'Array of menu items with their new order',
    type: [MenuItemOrder],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemOrder)
  items: MenuItemOrder[];
}
