import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const avatarUrl = await this.storageService.uploadAvatar(req.user.id, file);
    return {
      message: 'Avatar uploaded successfully',
      avatarUrl,
    };
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          required: false,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const document = await this.storageService.uploadDocument(req.user.id, file, folder);
    return {
      message: 'Document uploaded successfully',
      document,
    };
  }

  @Get('documents')
  @ApiOperation({ summary: 'List all documents' })
  listDocuments(@Request() req: any, @Query('folder') folder?: string) {
    return this.storageService.listDocuments(req.user.id, folder);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document details' })
  getDocument(@Request() req: any, @Param('id') id: string) {
    return this.storageService.getDocument(req.user.id, id);
  }

  @Get('documents/:id/download')
  @ApiOperation({ summary: 'Download a document' })
  async downloadDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const document = await this.storageService.getDocument(req.user.id, id);
    const absolutePath = this.storageService.getAbsolutePath(document.filePath);

    // Set headers
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.originalFilename}"`,
    });

    // Stream file
    const file = fs.createReadStream(absolutePath);
    return new StreamableFile(file);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(@Request() req: any, @Param('id') id: string) {
    await this.storageService.deleteDocument(req.user.id, id);
    return { message: 'Document deleted successfully' };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get storage usage' })
  getStorageUsage(@Request() req: any) {
    return this.storageService.getStorageUsage(req.user.id);
  }
}
