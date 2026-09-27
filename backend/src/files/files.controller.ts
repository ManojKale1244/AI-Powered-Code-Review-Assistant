import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

import AdmZip from 'adm-zip';

@Controller('projects/:projectId/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Create a file via JSON payload { path, content }
   */
  @Post()
  async createFile(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { path: string; content: string },
  ) {
    if (!body.path || body.content === undefined) {
      throw new BadRequestException('File path and content are required');
    }
    return this.filesService.createSingleFile(
      projectId,
      userId,
      body.path,
      body.content,
    );
  }

  /**
   * Upload ZIP file or individual code file(s) for a project.
   */
  @Post(['upload', 'upload-zip'])
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @UploadedFiles() files: any[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Check if a single ZIP archive was uploaded
    const isSingleZip = files.length === 1 && files[0].originalname?.toLowerCase().endsWith('.zip');
    if (isSingleZip) {
      try {
        return await this.filesService.processZipUpload(projectId, userId, files[0].buffer);
      } catch (err: any) {
        throw new BadRequestException(err?.message || 'Invalid or corrupted ZIP file');
      }
    }

    // Otherwise, process as single or multiple code files
    return this.filesService.processUploadedFiles(projectId, userId, files);
  }

  /**
   * Get file tree (flat list of paths + metadata, tree built on frontend).
   */
  @Get()
  getFileTree(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.getFileTree(projectId, userId);
  }

  /**
   * Get a single file's content.
   */
  @Get(':fileId')
  getFileContent(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.getFileContent(fileId, userId);
  }

  /**
   * Delete a single file.
   */
  @Delete(':fileId')
  deleteFile(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.deleteFile(fileId, userId);
  }
}

/**
 * Direct file operations under /files (e.g. DELETE /api/files/:fileId)
 */
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesDirectController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':fileId')
  getFileContent(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.getFileContent(fileId, userId);
  }

  @Delete(':fileId')
  deleteFile(
    @Param('fileId') fileId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.filesService.deleteFile(fileId, userId);
  }
}

/**
 * Route aliases under /projects/:projectId (e.g. POST /api/projects/:projectId/upload-zip)
 */
@Controller('projects/:projectId')
@UseGuards(JwtAuthGuard)
export class ProjectUploadController {
  constructor(private readonly filesService: FilesService) {}

  @Post(['upload-zip', 'upload'])
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @UploadedFiles() files: any[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const isSingleZip = files.length === 1 && files[0].originalname?.toLowerCase().endsWith('.zip');
    if (isSingleZip) {
      try {
        return await this.filesService.processZipUpload(projectId, userId, files[0].buffer);
      } catch (err: any) {
        throw new BadRequestException(err?.message || 'Invalid or corrupted ZIP file');
      }
    }

    return this.filesService.processUploadedFiles(projectId, userId, files);
  }
}
