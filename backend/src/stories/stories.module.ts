import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { Story } from './story.entity';
import { StoryView } from './story-view.entity';
import { Follow } from '../entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Story, StoryView, Follow]),
    ScheduleModule.forRoot(),
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
