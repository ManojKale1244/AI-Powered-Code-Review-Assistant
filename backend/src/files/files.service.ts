import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';

// Binary file extensions to skip when extracting ZIP archives
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'tar', 'gz', 'bz2', '7z', 'rar', 'xz', 'tgz',
  'mp3', 'mp4', 'wav', 'avi', 'mov', 'mkv', 'flv',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'o', 'obj', 'class', 'pyc', 'pyo',
  'db', 'sqlite', 'sqlite3', 'iso', 'img',
]);

// Maximum individual file size to process (1MB)
const MAX_FILE_SIZE = 1024 * 1024;

// Directories to skip when extracting
const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.next', 'dist', 'build',
  '.vscode', '.idea', 'vendor', 'target', 'bin', 'obj',
  '.cache', '.parcel-cache', 'coverage', '.turbo',
]);

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Process an uploaded ZIP file: extract, filter, and store text files in the DB.
   *
   * Design decision: Store file contents in PostgreSQL, not on disk.
   * Rationale: Simplifies queries (file tree, search, review), atomic with project.
   * Trade-off: Large projects with binary files could bloat the DB.
   * Mitigation: We filter by extension and cap file size at 500KB.
   */
  async processZipUpload(projectId: string, userId: string, buffer: Buffer) {
    // Verify project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
    } catch {
      throw new BadRequestException('Invalid ZIP file');
    }

    const entries = zip.getEntries();
    const filesToCreate: Array<{
      path: string;
      name: string;
      extension: string | null;
      size: number;
      content: string;
      projectId: string;
    }> = [];

    for (const entry of entries) {
      // Skip directories
      if (entry.isDirectory) continue;

      // Normalize path separators and remove leading slash
      let filePath = entry.entryName.replace(/\\/g, '/');

      // Prevent Zip Slip / Path Traversal attack (e.g. "../../etc/passwd")
      if (filePath.includes('..') || filePath.startsWith('/') || path.isAbsolute(filePath)) {
        continue;
      }

      // Skip files in excluded directories
      const pathParts = filePath.split('/');
      if (pathParts.some((part) => SKIP_DIRS.has(part))) continue;

      // Get file extension
      const ext = path.extname(entry.name).toLowerCase().replace('.', '');
      const fileName = path.basename(entry.name);

      // Skip binary extensions and non-important hidden files
      if (ext && BINARY_EXTENSIONS.has(ext)) continue;
      if (fileName.startsWith('.') && !this.isImportantDotFile(fileName)) continue;

      // Skip large files
      if (entry.header.size > MAX_FILE_SIZE) continue;

      // Read content
      let content: string;
      try {
        content = entry.getData().toString('utf8');
      } catch {
        continue; // Skip files that can't be read as UTF-8
      }

      // Clean null bytes if any
      content = content.replace(/\0/g, '');
      if (content.trim().length === 0 && entry.header.size > 0) continue;

      filesToCreate.push({
        path: filePath,
        name: fileName,
        extension: ext || null,
        size: entry.header.size,
        content,
        projectId,
      });
    }

    if (filesToCreate.length === 0) {
      throw new BadRequestException(
        'No processable source files found in ZIP archive',
      );
    }

    // Auto-strip common root directory prefix if all files share one (e.g. "LY-Project/src/index.js" -> "src/index.js")
    if (filesToCreate.length > 0) {
      const firstPath = filesToCreate[0].path;
      if (firstPath.includes('/')) {
        const rootFolder = firstPath.split('/')[0] + '/';
        const allShareRoot = filesToCreate.every((f) => f.path.startsWith(rootFolder));
        if (allShareRoot) {
          filesToCreate.forEach((f) => {
            f.path = f.path.substring(rootFolder.length);
          });
        }
      }
    }

    // Deduplicate by path
    const filesMap = new Map<string, typeof filesToCreate[0]>();
    for (const f of filesToCreate) {
      filesMap.set(f.path, f);
    }
    const deduplicated = Array.from(filesMap.values());

    // Delete existing files for this project (re-upload scenario)
    await this.prisma.projectFile.deleteMany({
      where: { projectId },
    });

    // Bulk create all files in a transaction
    await this.prisma.$transaction(
      deduplicated.map((file) =>
        this.prisma.projectFile.create({ data: file }),
      ),
    );

    // Detect primary language
    const languageCounts = new Map<string, number>();
    for (const file of deduplicated) {
      if (file.extension) {
        const lang = this.extensionToLanguage(file.extension);
        languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
      }
    }
    const primaryLanguage = [...languageCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    if (primaryLanguage) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { language: primaryLanguage },
      });
    }

    return {
      filesProcessed: filesToCreate.length,
      primaryLanguage: primaryLanguage || 'unknown',
    };
  }

  /**
   * Get all files for a project as a flat list.
   * The frontend builds the tree structure from the paths.
   */
  async getFileTree(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectFile.findMany({
      where: { projectId },
      select: {
        id: true,
        path: true,
        name: true,
        extension: true,
        size: true,
      },
      orderBy: { path: 'asc' },
    });
  }

  /**
   * Get a single file's content.
   */
  async getFileContent(fileId: string, userId: string) {
    const file = await this.prisma.projectFile.findUnique({
      where: { id: fileId },
      include: { project: { select: { userId: true } } },
    });

    if (!file || file.project.userId !== userId) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Delete a single file.
   */
  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.projectFile.findUnique({
      where: { id: fileId },
      include: { project: { select: { userId: true } } },
    });

    if (!file || file.project.userId !== userId) {
      throw new NotFoundException('File not found');
    }

    await this.prisma.projectFile.delete({
      where: { id: fileId },
    });

    return { message: 'File deleted successfully' };
  }

  /**
   * Get multiple files by their paths (for multi-file review).
   */
  async getFilesByPaths(projectId: string, paths: string[]) {
    return this.prisma.projectFile.findMany({
      where: {
        projectId,
        path: { in: paths },
      },
    });
  }

  /**
   * Get all files for a project (for full project review).
   */
  async getAllProjectFiles(projectId: string) {
    return this.prisma.projectFile.findMany({
      where: { projectId },
    });
  }

  /**
   * Create a single code file from path + content (e.g. JSON or manual creation).
   */
  async createSingleFile(
    projectId: string,
    userId: string,
    filePath: string,
    content: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }

    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase().replace('.', '');

    const file = await this.prisma.projectFile.upsert({
      where: {
        projectId_path: {
          projectId,
          path: filePath,
        },
      },
      update: {
        content,
        size: Buffer.byteLength(content, 'utf8'),
        name: fileName,
        extension: ext || null,
      },
      create: {
        projectId,
        path: filePath,
        name: fileName,
        extension: ext || null,
        size: Buffer.byteLength(content, 'utf8'),
        content,
      },
    });

    if (ext) {
      const lang = this.extensionToLanguage(ext);
      await this.prisma.project.update({
        where: { id: projectId },
        data: { language: lang },
      });
    }

    return file;
  }

  /**
   * Process multiple uploaded files (Express Multer files or single code file).
   */
  async processUploadedFiles(
    projectId: string,
    userId: string,
    files: Array<{ originalname: string; buffer: Buffer; relativePath?: string }>,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }

    const createdFiles: any[] = [];
    for (const f of files) {
      const filePath = (f.relativePath || f.originalname).replace(/\\/g, '/');
      const fileName = path.basename(filePath);
      const ext = path.extname(fileName).toLowerCase().replace('.', '');
      let content = '';

      try {
        content = f.buffer.toString('utf8');
      } catch {
        continue;
      }

      if (content.includes('\0')) continue; // Skip binary

      const created = await this.prisma.projectFile.upsert({
        where: {
          projectId_path: {
            projectId,
            path: filePath,
          },
        },
        update: {
          content,
          size: f.buffer.length,
          name: fileName,
          extension: ext || null,
        },
        create: {
          projectId,
          path: filePath,
          name: fileName,
          extension: ext || null,
          size: f.buffer.length,
          content,
        },
      });
      createdFiles.push(created);
    }

    // Update primary language if files were uploaded
    if (createdFiles.length > 0) {
      const languageCounts = new Map<string, number>();
      for (const file of createdFiles) {
        if (file.extension) {
          const lang = this.extensionToLanguage(file.extension);
          languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
        }
      }
      const primaryLanguage = [...languageCounts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];

      if (primaryLanguage) {
        await this.prisma.project.update({
          where: { id: projectId },
          data: { language: primaryLanguage },
        });
      }
    }

    return { filesProcessed: createdFiles.length };
  }

  private isExtensionlessTextFile(name: string): boolean {
    const knownFiles = new Set([
      'Dockerfile', 'Makefile', 'Jenkinsfile', 'Procfile',
      'Gemfile', 'Rakefile', 'Vagrantfile',
    ]);
    return knownFiles.has(name);
  }

  private isImportantDotFile(name: string): boolean {
    const important = new Set([
      '.gitignore', '.env', '.env.example', '.eslintrc',
      '.prettierrc', '.editorconfig', '.dockerignore',
      '.babelrc', '.npmrc',
    ]);
    return important.has(name);
  }

  private extensionToLanguage(ext: string): string {
    const map: Record<string, string> = {
      ts: 'TypeScript', tsx: 'TypeScript',
      js: 'JavaScript', jsx: 'JavaScript',
      py: 'Python',
      java: 'Java',
      c: 'C', cpp: 'C++', h: 'C', hpp: 'C++',
      cs: 'C#',
      go: 'Go',
      rs: 'Rust',
      rb: 'Ruby',
      php: 'PHP',
      swift: 'Swift',
      kt: 'Kotlin',
      scala: 'Scala',
      dart: 'Dart',
      r: 'R',
      lua: 'Lua',
      ex: 'Elixir', exs: 'Elixir',
      hs: 'Haskell',
    };
    return map[ext] || ext.toUpperCase();
  }
}
