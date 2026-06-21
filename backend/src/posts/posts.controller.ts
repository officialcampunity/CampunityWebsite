import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFeed(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getFeed(req.user.id, page || 1, limit || 10);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMine(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getMine(req.user.id, page || 1, limit || 20);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.postsService.delete(id, req.user.id);
    return { message: 'Deleted successfully' };
  }
}
