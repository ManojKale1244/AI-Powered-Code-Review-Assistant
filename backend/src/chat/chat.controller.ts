import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { IsString, MinLength } from 'class-validator';

class CreateSessionDto {
  @IsString()
  @MinLength(1)
  title: string;

  projectId?: string;
}

class SendMessageDto {
  @IsString()
  @MinLength(1)
  content: string;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  getAllSessions(
    @CurrentUser('id') userId: string,
    @Body('projectId') bodyProjectId?: string,
  ) {
    return this.chatService.getSessions(userId, bodyProjectId);
  }

  @Post('sessions')
  createGeneralSession(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.chatService.createSession(userId, dto.projectId, dto.title);
  }

  @Get('sessions/:sessionId')
  getSessionById(
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getSessionById(sessionId, userId);
  }

  @Post('projects/:projectId/sessions')
  createSession(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.chatService.createSession(userId, projectId, dto.title);
  }

  @Get('projects/:projectId/sessions')
  getSessions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.chatService.getSessions(userId, projectId);
  }

  @Get('sessions/:sessionId/messages')
  getMessages(
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getMessages(sessionId, userId);
  }

  @Post('sessions/:sessionId/messages')
  sendMessage(
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(sessionId, userId, dto.content);
  }

  @Delete('sessions/:sessionId')
  deleteSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.deleteSession(sessionId, userId);
  }
}
