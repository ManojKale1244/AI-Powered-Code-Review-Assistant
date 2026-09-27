import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import {
  FilesController,
  FilesDirectController,
  ProjectUploadController,
} from './files.controller';

@Module({
  controllers: [
    FilesController,
    FilesDirectController,
    ProjectUploadController,
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
