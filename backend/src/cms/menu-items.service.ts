import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new menu item
   */
  async create(dto: CreateMenuItemDto) {
    // Validate parent exists if specified
    if (dto.parentId) {
      const parent = await this.prisma.menuItem.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Menu parent non trouvé');
      }

      // Ensure parent is of the same menu type
      if (parent.menuType !== dto.menuType) {
        throw new BadRequestException(
          'Le menu parent doit être du même type (header/footer)',
        );
      }
    }

    const menuItem = await this.prisma.menuItem.create({
      data: {
        menuType: dto.menuType,
        parentId: dto.parentId,
        title: dto.title,
        url: dto.url,
        icon: dto.icon,
        displayOrder: dto.displayOrder || 0,
        visibility: dto.visibility || 'all',
        openInNewTab: dto.openInNewTab || false,
      },
    });

    return menuItem;
  }

  /**
   * Get all menu items by type (header or footer)
   */
  async findByType(menuType: 'header' | 'footer', visibility?: string) {
    const where: any = { menuType };

    // Filter by visibility if specified
    if (visibility) {
      where.visibility = visibility;
    }

    const menuItems = await this.prisma.menuItem.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    // Build hierarchical structure
    return this.buildMenuTree(menuItems);
  }

  /**
   * Get all menu items (admin view)
   */
  async findAll() {
    const menuItems = await this.prisma.menuItem.findMany({
      orderBy: [{ menuType: 'asc' }, { displayOrder: 'asc' }],
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: { children: true },
        },
      },
    });

    return menuItems;
  }

  /**
   * Get a single menu item by ID
   */
  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            menuType: true,
          },
        },
        children: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item non trouvé');
    }

    return menuItem;
  }

  /**
   * Update a menu item
   */
  async update(id: string, dto: UpdateMenuItemDto) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item non trouvé');
    }

    // Validate parent if changing
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Un menu ne peut pas être son propre parent');
      }

      if (dto.parentId) {
        const parent = await this.prisma.menuItem.findUnique({
          where: { id: dto.parentId },
        });

        if (!parent) {
          throw new NotFoundException('Menu parent non trouvé');
        }

        // Ensure parent is of the same menu type
        const menuType = dto.menuType || menuItem.menuType;
        if (parent.menuType !== menuType) {
          throw new BadRequestException(
            'Le menu parent doit être du même type (header/footer)',
          );
        }

        // Prevent circular references
        if (await this.wouldCreateCircular(id, dto.parentId)) {
          throw new BadRequestException(
            'Cette modification créerait une référence circulaire',
          );
        }
      }
    }

    const updateData: any = {};
    if (dto.menuType !== undefined) updateData.menuType = dto.menuType;
    if (dto.parentId !== undefined) updateData.parentId = dto.parentId;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.url !== undefined) updateData.url = dto.url;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.displayOrder !== undefined) updateData.displayOrder = dto.displayOrder;
    if (dto.visibility !== undefined) updateData.visibility = dto.visibility;
    if (dto.openInNewTab !== undefined) updateData.openInNewTab = dto.openInNewTab;

    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  /**
   * Delete a menu item
   */
  async remove(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item non trouvé');
    }

    // Check if has children
    if (menuItem.children.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer un menu qui a des sous-menus. Supprimez d\'abord les sous-menus.',
      );
    }

    await this.prisma.menuItem.delete({
      where: { id },
    });

    return { message: 'Menu item supprimé avec succès' };
  }

  /**
   * Reorder menu items
   */
  async reorder(menuType: 'header' | 'footer', itemOrders: { id: string; displayOrder: number }[]) {
    // Validate all items exist and are of the same menu type
    const items = await this.prisma.menuItem.findMany({
      where: {
        id: { in: itemOrders.map(item => item.id) },
        menuType,
      },
    });

    if (items.length !== itemOrders.length) {
      throw new BadRequestException('Certains menu items sont invalides');
    }

    // Update display orders in a transaction
    await this.prisma.$transaction(
      itemOrders.map(item =>
        this.prisma.menuItem.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      ),
    );

    return { message: 'Ordre des menus mis à jour avec succès' };
  }

  /**
   * Build hierarchical menu tree from flat list
   */
  private buildMenuTree(items: any[]): any[] {
    const itemMap = new Map();
    const rootItems: any[] = [];

    // Create map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build tree structure
    items.forEach(item => {
      const node = itemMap.get(item.id);
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootItems.push(node);
        }
      } else {
        rootItems.push(node);
      }
    });

    return rootItems;
  }

  /**
   * Check if setting a parent would create a circular reference
   */
  private async wouldCreateCircular(itemId: string, newParentId: string): Promise<boolean> {
    let currentId: string | null = newParentId;

    while (currentId) {
      if (currentId === itemId) {
        return true;
      }

      const parent: { parentId: string | null } | null = await this.prisma.menuItem.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = parent?.parentId || null;
    }

    return false;
  }
}
