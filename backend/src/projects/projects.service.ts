import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { name: string; description?: string; language?: string }) {
    return this.prisma.project.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { files: true, reviews: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        files: {
          select: {
            id: true,
            path: true,
            name: true,
            extension: true,
            size: true,
            content: true,
            createdAt: true,
          },
          orderBy: { path: 'asc' },
        },
        _count: {
          select: { files: true, reviews: true, chatSessions: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const files = (project.files || []).map((f) => ({
      ...f,
      sizeBytes: f.size,
    }));

    return {
      ...project,
      files,
    };
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; language?: string },
  ) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.project.delete({ where: { id } });
  }
}
