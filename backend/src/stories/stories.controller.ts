import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('following')
  async getFollowing(@Req() req: any) {
    return this.storiesService.findFollowing(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('discover')
  async getDiscover(@Req() req: any) {
    return this.storiesService.findDiscover(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMine(@Req() req: any) {
    return this.storiesService.getMyStories(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('archived')
  async getArchived(@Req() req: any) {
    return this.storiesService.getArchived(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateStoryDto) {
    return this.storiesService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  async view(@Param('id') id: string, @Req() req: any) {
    await this.storiesService.viewStory(id, req.user.id);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/views')
  async getViews(@Param('id') id: string, @Req() req: any) {
    return this.storiesService.getStoryViews(id, req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.storiesService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(@Req() req: any, @Param('id') id: string, @Body('content') content: string) {
    return this.storiesService.addComment(id, req.user.id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reply')
  async replyAsMessage(@Req() req: any, @Param('id') id: string, @Body('content') content: string) {
    return this.storiesService.replyAsMessage(id, req.user.id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.storiesService.delete(id, req.user.id);
    return { message: 'Deleted successfully' };
  }
}
