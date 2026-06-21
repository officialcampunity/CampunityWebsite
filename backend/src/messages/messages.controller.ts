import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  async getConversations(@Req() req: any) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    return this.messagesService.getUnreadCount(req.user.id);
  }

  @Get(':userId')
  async getMessages(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getMessages(req.user.id, userId, page, limit);
  }

  @Post()
  async sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.id, dto);
  }
}
