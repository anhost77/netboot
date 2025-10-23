import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('CMS Menu Items')
@Controller('cms/menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a menu item (admin only)',
    description: 'Create a new menu item in header or footer',
  })
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuItemsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all menu items (admin only)',
    description: 'Get all menu items with parent/children info',
  })
  findAll() {
    return this.menuItemsService.findAll();
  }

  @Get('public/:menuType')
  @Public()
  @ApiOperation({
    summary: 'Get public menu by type',
    description: 'Get hierarchical menu structure for header or footer',
  })
  findByType(
    @Param('menuType') menuType: 'header' | 'footer',
    @Query('visibility') visibility?: string,
  ) {
    return this.menuItemsService.findByType(menuType, visibility);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get menu item by ID (admin only)',
    description: 'Get menu item details',
  })
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a menu item (admin only)',
    description: 'Update menu item properties',
  })
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuItemsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a menu item (admin only)',
    description: 'Delete a menu item (must not have children)',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }

  @Post('reorder/:menuType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reorder menu items (admin only)',
    description: 'Update display order of menu items',
  })
  @HttpCode(HttpStatus.OK)
  reorder(
    @Param('menuType') menuType: 'header' | 'footer',
    @Body() dto: ReorderMenuDto,
  ) {
    return this.menuItemsService.reorder(menuType, dto.items);
  }
}
