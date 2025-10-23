import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageFiltersDto } from './dto/page-filters.dto';

@Injectable()
export class CmsPagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new CMS page
   */
  async create(adminId: string, dto: CreatePageDto) {
    // Check if slug already exists
    const existing = await this.prisma.cmsPage.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Une page avec le slug "${dto.slug}" existe déjà`);
    }

    const page = await this.prisma.cmsPage.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        content: dto.content,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        published: dto.published || false,
        version: 1,
        publishedAt: dto.published ? new Date() : null,
      },
    });

    // Create initial history entry
    await this.prisma.cmsPageHistory.create({
      data: {
        pageId: page.id,
        content: page.content,
        version: 1,
        createdByAdminId: adminId,
      },
    });

    return page;
  }

  /**
   * Get all pages with pagination
   */
  async findAll(filters: PageFiltersDto, includeUnpublished: boolean = false) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Only show published pages for non-admins
    if (!includeUnpublished) {
      where.published = true;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      this.prisma.cmsPage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.cmsPage.count({ where }),
    ]);

    return {
      data: pages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single page by slug
   */
  async findBySlug(slug: string, includeUnpublished: boolean = false) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { slug },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Non-admins cannot view unpublished pages
    if (!includeUnpublished && !page.published) {
      throw new NotFoundException('Page non trouvée');
    }

    return page;
  }

  /**
   * Get a single page by ID
   */
  async findOne(id: string) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    return page;
  }

  /**
   * Update a page
   */
  async update(id: string, adminId: string, dto: UpdatePageDto) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.prisma.cmsPage.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ConflictException(`Une page avec le slug "${dto.slug}" existe déjà`);
      }
    }

    const updateData: any = {};
    let contentChanged = false;

    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) updateData.metaDescription = dto.metaDescription;

    if (dto.content !== undefined && dto.content !== page.content) {
      updateData.content = dto.content;
      updateData.version = page.version + 1;
      contentChanged = true;
    }

    if (dto.published !== undefined) {
      updateData.published = dto.published;
      if (dto.published && !page.published) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await this.prisma.cmsPage.update({
      where: { id },
      data: updateData,
    });

    // Create history entry if content changed
    if (contentChanged) {
      await this.prisma.cmsPageHistory.create({
        data: {
          pageId: id,
          content: updated.content,
          version: updated.version,
          createdByAdminId: adminId,
        },
      });
    }

    return updated;
  }

  /**
   * Delete a page
   */
  async remove(id: string) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    await this.prisma.cmsPage.delete({
      where: { id },
    });

    return { message: 'Page supprimée avec succès' };
  }

  /**
   * Restore a previous version
   */
  async restoreVersion(pageId: string, versionNumber: number, adminId: string) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    const history = await this.prisma.cmsPageHistory.findFirst({
      where: {
        pageId,
        version: versionNumber,
      },
    });

    if (!history) {
      throw new NotFoundException('Version non trouvée');
    }

    // Update page with historical content
    const updated = await this.prisma.cmsPage.update({
      where: { id: pageId },
      data: {
        content: history.content,
        version: page.version + 1,
      },
    });

    // Create new history entry
    await this.prisma.cmsPageHistory.create({
      data: {
        pageId,
        content: history.content,
        version: updated.version,
        createdByAdminId: adminId,
      },
    });

    return updated;
  }

  /**
   * Get page history
   */
  async getHistory(pageId: string) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    const history = await this.prisma.cmsPageHistory.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return history;
  }
}
