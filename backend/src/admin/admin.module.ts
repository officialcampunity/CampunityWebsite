import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { Resource } from '../entities/resource.entity';
import { Report } from '../entities/report.entity';
import { Post } from '../posts/post.entity';
import { Story } from '../stories/story.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Resource, Report, Post, Story]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
