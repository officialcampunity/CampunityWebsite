import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story } from './story.entity';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
  ) {}

  async create(mediaUrl: string, mediaType: string, userId: string): Promise<Story> {
    const story = this.storiesRepository.create({
      mediaUrl,
      mediaType: mediaType || 'image',
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

    const stories = await this.storiesRepository
      .createQueryBuilder('story')
      .leftJoinAndSelect('story.author', 'author')
      .where('story.author_id IN (:...ids)', { ids: followingIds })
      .orderBy('story.createdAt', 'DESC')
      .getMany();

    const grouped: Record<string, { user: any; stories: Story[] }> = {};
    for (const s of stories) {
      const uid = s.author.id;
      if (!grouped[uid]) {
        grouped[uid] = {
          user: { id: s.author.id, displayName: s.author.displayName, username: s.author.username, avatarUrl: s.author.avatarUrl },
          stories: [],
        };
      }
      grouped[uid].stories.push(s);
    }
    return Object.values(grouped);
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
}
