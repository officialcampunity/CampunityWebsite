import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('following')
  async getFollowing(@Req() req: any) {
    return this.storiesService.findFollowing(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: { mediaUrl: string; mediaType?: string }) {
    return this.storiesService.create(body.mediaUrl, body.mediaType || 'image', req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.storiesService.delete(id, req.user.id);
    return { message: 'Deleted successfully' };
  }
}
