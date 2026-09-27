import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ProviderType } from '@prisma/client';

class CreateProviderConfigDto {
  @IsEnum(ProviderType)
  providerType: ProviderType;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;

  @IsString()
  model: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

class UpdateProviderConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

@Controller('ai/providers')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  createConfig(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProviderConfigDto,
  ) {
    return this.aiService.createProviderConfig(userId, dto);
  }

  @Get()
  getConfigs(@CurrentUser('id') userId: string) {
    return this.aiService.getProviderConfigs(userId);
  }

  @Put(':id')
  updateConfig(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProviderConfigDto,
  ) {
    return this.aiService.updateProviderConfig(id, userId, dto);
  }

  @Delete(':id')
  deleteConfig(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiService.deleteProviderConfig(id, userId);
  }

  @Post('test')
  testConnection(@Body() dto: CreateProviderConfigDto) {
    return this.aiService.testConnection(dto);
  }
}
