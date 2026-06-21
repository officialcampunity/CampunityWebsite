import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { multerConfig } from './multer.config';

@Controller('resources')
export class ResourcesController {
  constructor(
    private resourcesService: ResourcesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getFeed(
    @Query('universityId') universityId?: string,
    @Query('courseId') courseId?: string,
    @Query('semesterId') semesterId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('authorId') authorId?: string,
    @Query('filter') filter?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    const currentUserId = req?.user?.id;
    if (filter === 'following' && currentUserId) {
      return this.resourcesService.findFollowing(currentUserId, page, limit, currentUserId);
    }
    return this.resourcesService.findAll({ universityId, courseId, semesterId, subjectId, authorId, page, limit, currentUserId });
  }

  @Get('trending')
  async getTrending(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    return this.resourcesService.findTrending(page, limit, req?.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMyResources(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.resourcesService.findAll({ authorId: req.user.id, page, limit, currentUserId: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file provided');

    let cloudinaryUrl: string | undefined;
    try {
      cloudinaryUrl = await this.cloudinaryService.uploadFile(file.buffer, file.originalname, file.mimetype);
    } catch {
      // Fall back to local path if Cloudinary fails
      const fs = await import('fs/promises');
      const { join } = await import('path');
      const { randomUUID } = await import('crypto');
      const uploadsDir = join(__dirname, '..', '..', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});
      const filename = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
      await fs.writeFile(join(uploadsDir, filename), file.buffer);
      cloudinaryUrl = `/uploads/${filename}`;
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
    const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'flv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'];
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp'];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
    const codeExts = ['js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'md', 'sql', 'sh', 'bat', 'go', 'rs', 'rb', 'php'];

    let fileType = 'File';
    if (imageExts.includes(ext) || file.mimetype.startsWith('image/')) fileType = 'Image';
    else if (videoExts.includes(ext) || file.mimetype.startsWith('video/')) fileType = 'Video';
    else if (audioExts.includes(ext) || file.mimetype.startsWith('audio/')) fileType = 'Audio';
    else if (ext === 'pdf') fileType = 'PDF';
    else if (docExts.includes(ext)) fileType = 'Document';
    else if (archiveExts.includes(ext)) fileType = 'Archive';
    else if (codeExts.includes(ext)) fileType = 'Code';

    return {
      url: cloudinaryUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.buffer.length,
      fileType,
      extension: ext,
    };
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    return this.resourcesService.search(q, page, limit, req?.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarked')
  async getBookmarked(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.resourcesService.findBookmarked(req.user.id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  async bookmark(@Req() req: any, @Param('id') id: string) {
    await this.resourcesService.bookmark(id, req.user.id);
    return { message: 'Bookmarked successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/bookmark')
  async unbookmark(@Req() req: any, @Param('id') id: string) {
    await this.resourcesService.unbookmark(id, req.user.id);
    return { message: 'Unbookmarked successfully' };
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req?: any) {
    return this.resourcesService.findOne(id, req?.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.resourcesService.delete(id, req.user.id);
    return { message: 'Deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Req() req: any, @Param('id') id: string) {
    await this.resourcesService.like(id, req.user.id);
    return { message: 'Liked successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlike(@Req() req: any, @Param('id') id: string) {
    await this.resourcesService.unlike(id, req.user.id);
    return { message: 'Unliked successfully' };
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.resourcesService.getComments(id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(@Req() req: any, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.resourcesService.addComment(id, req.user.id, dto);
  }
}
