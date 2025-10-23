import { Module } from '@nestjs/common';
import { CmsPagesService } from './cms-pages.service';
import { MenuItemsService } from './menu-items.service';
import { CmsPagesController } from './cms-pages.controller';
import { MenuItemsController } from './menu-items.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CmsPagesController, MenuItemsController],
  providers: [CmsPagesService, MenuItemsService, PrismaService],
  exports: [CmsPagesService, MenuItemsService], // Export for potential use in other modules
})
export class CmsModule {}
