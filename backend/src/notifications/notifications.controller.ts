import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.findByRecipient(req.user.id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    await this.notificationsService.markAsRead(id, req.user.id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async markAllAsRead(@Req() req: any) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }
}
