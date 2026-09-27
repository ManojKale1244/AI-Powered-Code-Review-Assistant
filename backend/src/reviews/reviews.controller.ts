import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { ReviewMode, ReviewScope } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
} from 'class-validator';

class CreateReviewDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsEnum(ReviewMode)
  mode: ReviewMode;

  @IsString()
  scope: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fileIds?: string[];

  @IsString()
  @IsOptional()
  fileId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  filePaths?: string[];

  @IsString()
  @IsOptional()
  providerId?: string;
}

class GenerateDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  filePaths?: string[];

  @IsString()
  @IsOptional()
  docType?: 'README' | 'SETUP_GUIDE' | 'API_DOCS';

  @IsString()
  @IsOptional()
  testFramework?: string;
}

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  createReviewDirect(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const targetProjectId = dto.projectId;
    if (!targetProjectId) {
      throw new BadRequestException('projectId is required in body');
    }
    return this.reviewsService.createReview(userId, targetProjectId, dto);
  }

  @Post('projects/:projectId')
  createReview(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(userId, projectId, dto);
  }

  @Get()
  getReviews(
    @CurrentUser('id') userId: string,
    @Query('projectId') projectId?: string,
    @Query('search') search?: string,
    @Query('mode') mode?: ReviewMode,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getReviews(userId, {
      projectId,
      search,
      mode,
      status,
      page,
      limit,
    });
  }

  @Get(':id')
  getReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewsService.getReviewById(id, userId);
  }

  @Post('generate-docs')
  generateDocumentationGlobal(
    @CurrentUser('id') userId: string,
    @Body() dto: { projectId: string; fileId?: string; filePaths?: string[]; docType?: 'README' | 'SETUP_GUIDE' | 'API_DOCS' },
  ) {
    return this.reviewsService.generateDocumentation(
      userId,
      dto.projectId,
      dto.filePaths,
      dto.docType,
    );
  }

  @Post('projects/:projectId/documentation')
  generateDocumentation(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: GenerateDto,
  ) {
    return this.reviewsService.generateDocumentation(
      userId,
      projectId,
      dto.filePaths,
      dto.docType,
    );
  }

  @Post('projects/:projectId/tests')
  generateTests(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: GenerateDto,
  ) {
    return this.reviewsService.generateTests(
      userId,
      projectId,
      dto.filePaths,
      dto.testFramework,
    );
  }
}
