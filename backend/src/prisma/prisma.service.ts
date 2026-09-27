import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService wraps PrismaClient as a NestJS injectable service.
 *
 * Design decision: single shared connection pool across the app.
 * NestJS DI ensures this is a singleton (default scope).
 * We hook into NestJS lifecycle to gracefully connect/disconnect.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
