import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly storagePath: string;
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  private readonly allowedDocTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
  ];

  constructor(private prisma: PrismaService) {
    this.storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), '..', 'storage');
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    // Validate file type
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed for avatars');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Avatar file size must be less than 5MB');
    }

    // Generate unique filename
    const filename = `${uuidv4()}.jpg`;
    const avatarPath = path.join(this.storagePath, 'avatars', filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(avatarPath), { recursive: true });

    // Resize and optimize image
    await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 85 })
      .toFile(avatarPath);

    // Update user avatar in database
    const relativePath = `/storage/avatars/${filename}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: relativePath },
    });

    return relativePath;
  }

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    folder?: string,
  ): Promise<any> {
    // Validate file type
    if (!this.allowedDocTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Check storage quota
    await this.checkStorageQuota(userId, file.size);

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const folderPath = folder || 'default';
    const filePath = path.join(this.storagePath, 'documents', userId, folderPath, filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Create document record
    const relativePath = `/storage/documents/${userId}/${folderPath}/${filename}`;
    const document = await this.prisma.document.create({
      data: {
        userId,
        filename,
        originalFilename: file.originalname,
        filePath: relativePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        folder: folderPath,
      },
    });

    return document;
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    // Delete physical file
    const absolutePath = path.join(this.storagePath, document.filePath.replace('/storage/', ''));
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      // File might not exist, continue anyway
    }

    // Delete database record
    await this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  async getDocument(userId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    return document;
  }

  async listDocuments(userId: string, folder?: string) {
    const where: any = { userId };
    if (folder) {
      where.folder = folder;
    }

    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStorageUsage(userId: string): Promise<{ usedMb: number; maxMb: number; percentage: number }> {
    // Get total file size for user
    const aggregate = await this.prisma.document.aggregate({
      where: { userId },
      _sum: {
        fileSize: true,
      },
    });

    const usedBytes = aggregate._sum.fileSize || 0;
    const usedMb = Math.round((usedBytes / (1024 * 1024)) * 100) / 100;

    // Get user's storage limit from subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['trial', 'active'] },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const maxMb = subscription?.plan.maxStorageMb || 50;
    const percentage = Math.round((usedMb / maxMb) * 100);

    return {
      usedMb,
      maxMb,
      percentage,
    };
  }

  private async checkStorageQuota(userId: string, newFileSize: number): Promise<void> {
    const usage = await this.getStorageUsage(userId);
    const newFileSizeMb = newFileSize / (1024 * 1024);

    if (usage.usedMb + newFileSizeMb > usage.maxMb) {
      throw new ForbiddenException(
        `Storage quota exceeded. Used: ${usage.usedMb}MB / ${usage.maxMb}MB. Upgrade your plan for more storage.`,
      );
    }
  }

  getAbsolutePath(relativePath: string): string {
    return path.join(this.storagePath, relativePath.replace('/storage/', ''));
  }
}
