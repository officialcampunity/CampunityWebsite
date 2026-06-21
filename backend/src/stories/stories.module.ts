import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { Story } from './story.entity';
import { StoryView } from './story-view.entity';
import { StoryComment } from './story-comment.entity';
import { Follow } from '../entities/follow.entity';
import { Message } from '../entities/message.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Story, StoryView, StoryComment, Follow, Message]),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
