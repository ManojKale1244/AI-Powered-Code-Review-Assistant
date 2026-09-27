import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FilesService } from './files.service';
import { BadRequestException } from '@nestjs/common';
import AdmZip from 'adm-zip';

describe('FilesService (Unit Tests)', () => {
  let filesService: FilesService;
  let mockPrisma: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockPrisma = {
      project: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      projectFile: {
        deleteMany: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
    };

    mockConfigService = {
      get: vi.fn(),
    };

    filesService = new FilesService(mockPrisma as any, mockConfigService as any);
  });

  describe('processZipUpload', () => {
    it('should throw BadRequestException if invalid ZIP buffer is passed', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-1',
        userId: 'user-1',
      });

      const invalidBuffer = Buffer.from('invalid zip data');

      await expect(
        filesService.processZipUpload('project-1', 'user-1', invalidBuffer),
      ).rejects.toThrow(BadRequestException);
    });

    it('should safely extract valid ZIP file entries while filtering non-code files', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'project-1',
        userId: 'user-1',
      });

      const zip = new AdmZip();
      zip.addFile('src/index.ts', Buffer.from('console.log("hello");'));
      zip.addFile('node_modules/library.js', Buffer.from('skip this'));
      zip.addFile('image.png', Buffer.from([0, 1, 2, 3]));
      const validZipBuffer = zip.toBuffer();

      const result = await filesService.processZipUpload(
        'project-1',
        'user-1',
        validZipBuffer,
      );

      expect(result.filesProcessed).toBe(1);
      expect(result.primaryLanguage).toBe('TypeScript');
    });
  });
});
