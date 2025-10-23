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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CmsPagesService } from './cms-pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageFiltersDto } from './dto/page-filters.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('CMS Pages')
@Controller('cms/pages')
export class CmsPagesController {
  constructor(private readonly pagesService: CmsPagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new page (admin only)',
    description: 'Create a CMS page with SEO metadata',
  })
  create(@Request() req: any, @Body() dto: CreatePageDto) {
    return this.pagesService.create(req.user.id, dto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all pages',
    description: 'Get paginated list of published pages (or all for admins)',
  })
  findAll(@Request() req: any, @Query() filters: PageFiltersDto) {
    const isAdmin = req?.user?.role === UserRole.admin;
    return this.pagesService.findAll(filters, isAdmin);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({
    summary: 'Get page by slug',
    description: 'Get a single page by its slug',
  })
  findBySlug(@Request() req: any, @Param('slug') slug: string) {
    const isAdmin = req?.user?.role === UserRole.admin;
    return this.pagesService.findBySlug(slug, isAdmin);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get page by ID (admin only)',
    description: 'Get page details with history',
  })
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a page (admin only)',
    description: 'Update page content and metadata',
  })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a page (admin only)',
    description: 'Delete a CMS page',
  })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  @Post(':id/restore/:version')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore a page version (admin only)',
    description: 'Restore page content to a previous version',
  })
  @HttpCode(HttpStatus.OK)
  restoreVersion(
    @Request() req: any,
    @Param('id') id: string,
    @Param('version') version: string,
  ) {
    return this.pagesService.restoreVersion(id, parseInt(version), req.user.id);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get page history (admin only)',
    description: 'Get all versions of a page',
  })
  getHistory(@Param('id') id: string) {
    return this.pagesService.getHistory(id);
  }
}
