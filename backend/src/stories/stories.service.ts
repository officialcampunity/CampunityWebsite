import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Story } from './story.entity';
import { StoryView } from './story-view.entity';
import { Follow } from '../entities/follow.entity';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
    @InjectRepository(StoryView)
    private storyViewsRepository: Repository<StoryView>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
  ) {}

  async create(dto: CreateStoryDto, userId: string): Promise<Story> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let scheduledAt: Date | null = null;
    let published = true;

    if (dto.scheduledAt) {
      const sched = new Date(dto.scheduledAt);
      if (sched <= now) {
        throw new BadRequestException('Scheduled time must be in the future');
      }
      scheduledAt = sched;
      published = false;
    }

    const story = this.storiesRepository.create({
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType || 'image',
      caption: dto.caption || null,
      expiresAt,
      scheduledAt,
      published,
      author: { id: userId } as any,
    });
    return this.storiesRepository.save(story);
  }

  async findFollowing(userId: string) {
    const follows = await this.followsRepository.find({
      where: { follower: { id: userId } },
      relations: { following: true },
    });
    const followingIds = follows.map(f => f.following.id);
    followingIds.push(userId);

    if (followingIds.length === 0) return [];

    const now = new Date();

    const stories = await this.storiesRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.author', 'author')
      .leftJoinAndSelect('story.viewedBy', 'viewedBy')
      .where('story.author_id IN (:...ids)', { ids: followingIds })
      .andWhere('story.published = :pub', { pub: true })
      .andWhere('story.expiresAt > :now', { now })
      .andWhere('story.scheduledAt IS NULL OR story.scheduledAt <= :now', { now })
      .orderBy('story.createdAt', 'DESC')
      .getMany();

    const currentUserId = userId;
    const grouped: Record<string, { user: any; stories: any[] }> = {};
    for (const s of stories) {
      const uid = s.author.id;
      if (!grouped[uid]) {
        grouped[uid] = {
          user: { id: s.author.id, displayName: s.author.displayName, username: s.author.username, avatarUrl: s.author.avatarUrl },
          stories: [],
        };
      }
      const viewCount = Array.isArray(s.viewedBy) ? s.viewedBy.length : 0;
      const viewedByCurrent = Array.isArray(s.viewedBy)
        ? s.viewedBy.some(v => v.viewer?.id === currentUserId)
        : false;
      grouped[uid].stories.push({
        id: s.id,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        caption: s.caption,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        views: viewCount,
        viewed: viewedByCurrent,
      });
    }
    return Object.values(grouped);
  }

  async findDiscover(userId: string) {
    const now = new Date();

    const stories = await this.storiesRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.author', 'author')
      .leftJoinAndSelect('story.viewedBy', 'viewedBy')
      .where('story.published = :pub', { pub: true })
      .andWhere('story.expiresAt > :now', { now })
      .andWhere('story.scheduledAt IS NULL OR story.scheduledAt <= :now', { now })
      .orderBy('story.views', 'DESC')
      .addOrderBy('story.createdAt', 'DESC')
      .getMany();

    const currentUserId = userId;
    return stories.map(s => ({
      id: s.id,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      caption: s.caption,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      views: Array.isArray(s.viewedBy) ? s.viewedBy.length : 0,
      viewed: Array.isArray(s.viewedBy) ? s.viewedBy.some(v => v.viewer?.id === currentUserId) : false,
      author: {
        id: s.author.id,
        displayName: s.author.displayName,
        username: s.author.username,
        avatarUrl: s.author.avatarUrl,
      },
    }));
  }

  async viewStory(storyId: string, userId: string): Promise<void> {
    const story = await this.storiesRepository.findOne({
      where: { id: storyId },
      relations: { viewedBy: true },
    });
    if (!story) throw new NotFoundException('Story not found');

    const alreadyViewed = Array.isArray(story.viewedBy)
      ? story.viewedBy.some(v => v.viewer?.id === userId)
      : false;

    if (!alreadyViewed) {
      const view = this.storyViewsRepository.create({
        story: { id: storyId } as any,
        viewer: { id: userId } as any,
      });
      await this.storyViewsRepository.save(view);
      await this.storiesRepository.increment({ id: storyId }, 'views', 1);
    }
  }

  async getStoryViews(storyId: string, userId: string): Promise<{ count: number; viewers: { id: string; displayName: string; username: string; avatarUrl: string | null }[] }> {
    const story = await this.storiesRepository.findOne({
      where: { id: storyId },
      relations: { author: true },
    });
    if (!story) throw new NotFoundException('Story not found');
    if (story.author.id !== userId) throw new ForbiddenException();

    const views = await this.storyViewsRepository.find({
      where: { story: { id: storyId } },
      relations: { viewer: true },
      order: { createdAt: 'DESC' },
    });

    return {
      count: views.length,
      viewers: views.map(v => ({
        id: v.viewer.id,
        displayName: v.viewer.displayName,
        username: v.viewer.username,
        avatarUrl: v.viewer.avatarUrl,
      })),
    };
  }

  async getMyStories(userId: string) {
    const now = new Date();
    const stories = await this.storiesRepository.find({
      where: { author: { id: userId } },
      relations: { viewedBy: true },
      order: { createdAt: 'DESC' },
    });

    return stories.map(s => ({
      id: s.id,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      caption: s.caption,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      scheduledAt: s.scheduledAt,
      published: s.published,
      views: Array.isArray(s.viewedBy) ? s.viewedBy.length : 0,
      expired: s.expiresAt <= now,
    }));
  }

  async delete(id: string, userId: string): Promise<void> {
    const story = await this.storiesRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!story) throw new NotFoundException('Story not found');
    if (story.author.id !== userId) throw new ForbiddenException();
    await this.storiesRepository.remove(story);
  }

  async getArchived(userId: string) {
    const stories = await this.storiesRepository.find({
      where: { author: { id: userId }, isArchived: true },
      order: { createdAt: 'DESC' },
    });
    return stories.map(s => ({
      id: s.id,
      mediaUrl: s.mediaUrl,
      mediaType: s.mediaType,
      caption: s.caption,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      archived: true,
    }));
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupExpired(): Promise<void> {
    const now = new Date();
    await this.storiesRepository.update(
      { expiresAt: LessThan(now), isArchived: false },
      { isArchived: true },
    );
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async deleteOldArchived(): Promise<void> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.storiesRepository.delete({
      isArchived: true,
      updatedAt: LessThanOrEqual(cutoff) as any,
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async publishScheduled(): Promise<void> {
    const now = new Date();
    await this.storiesRepository.update(
      {
        published: false,
        scheduledAt: LessThan(now) as any,
      },
      { published: true },
    );
  }
}
