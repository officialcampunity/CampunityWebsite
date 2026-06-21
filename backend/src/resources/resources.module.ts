import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { Resource } from '../entities/resource.entity';
import { ResourceType } from '../entities/resource-type.entity';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { Follow } from '../entities/follow.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, ResourceType, Comment, Like, Bookmark, Follow]), NotificationsModule],
  controllers: [ResourcesController],
  providers: [ResourcesService],
})
export class ResourcesModule {}
