import { Controller, Get, Put, Post, Delete, Param, Body, Query, UseGuards, Req, UseInterceptors, UploadedFile, ClassSerializerInterceptor } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('suggested')
  async getSuggested(@Req() req: any) {
    const userId = req.user?.id;
    return this.usersService.getSuggested(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('blocked')
  async getBlocked(@Req() req: any) {
    return this.usersService.getBlockedUsers(req.user.id);
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.search(q, page, limit);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getProfile(@Param('id') id: string, @Req() req: any) {
    return this.usersService.findById(id, req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', 'uploads', 'avatars'),
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `avatar-${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file provided');
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const user = await this.usersService.update(req.user.id, { avatarUrl } as any);
    return { avatarUrl: user.avatarUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Req() req: any) {
    await this.usersService.delete(req.user.id);
    return { message: 'Account deleted' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(@Req() req: any, @Param('id') id: string) {
    await this.usersService.follow(req.user.id, id);
    return { message: 'Followed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollow(@Req() req: any, @Param('id') id: string) {
    await this.usersService.unfollow(req.user.id, id);
    return { message: 'Unfollowed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/block')
  async block(@Req() req: any, @Param('id') id: string) {
    await this.usersService.block(req.user.id, id);
    return { message: 'Blocked successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/block')
  async unblock(@Req() req: any, @Param('id') id: string) {
    await this.usersService.unblock(req.user.id, id);
    return { message: 'Unblocked successfully' };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/followers')
  async getFollowers(
    @Param('id') id: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getFollowers(id, req.user?.id, page, limit);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/following')
  async getFollowing(
    @Param('id') id: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getFollowing(id, req.user?.id, page, limit);
  }
}
