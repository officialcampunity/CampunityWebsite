import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(dto, req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getFeed(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getFeed(req.user?.id, page || 1, limit || 10);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMine(@Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getMine(req.user.id, page || 1, limit || 20);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.postsService.delete(id, req.user.id);
    return { message: 'Deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Req() req: any, @Param('id') id: string) {
    await this.postsService.like(id, req.user.id);
    return { message: 'Liked successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlike(@Req() req: any, @Param('id') id: string) {
    await this.postsService.unlike(id, req.user.id);
    return { message: 'Unliked successfully' };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/comments')
  async getComments(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getComments(id, page || 1, limit || 20);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(@Req() req: any, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.postsService.addComment(id, req.user.id, dto.content);
  }
}
