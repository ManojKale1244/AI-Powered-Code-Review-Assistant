import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() makes PrismaService available to all modules
 * without needing to import PrismaModule everywhere.
 *
 * Trade-off: Global modules reduce explicitness, but for a
 * cross-cutting concern like database access, it's the NestJS convention.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
