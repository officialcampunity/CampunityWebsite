import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';
import { Follow } from '../entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike, PostComment, Follow])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
