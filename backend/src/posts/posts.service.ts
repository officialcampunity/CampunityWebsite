import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { Follow } from '../entities/follow.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
  ) {}

  async create(dto: CreatePostDto, userId: string): Promise<any> {
    const post = this.postsRepository.create({
      content: dto.content,
      imageUrl: dto.imageUrl || null,
      author: { id: userId } as any,
    });
    await this.postsRepository.save(post);
    const full = await this.postsRepository.findOne({
      where: { id: post.id },
      relations: { author: true },
    });
    if (!full) throw new Error('Post not found after creation');
    return {
      id: full.id,
      content: full.content,
      imageUrl: full.imageUrl,
      createdAt: full.createdAt,
      author: {
        id: full.author.id,
        displayName: full.author.displayName,
        username: full.author.username,
        avatarUrl: full.author.avatarUrl,
      },
    };
  }

  async getFeed(userId: string, page: number, limit: number) {
    const follows = await this.followsRepository.find({
      where: { follower: { id: userId } },
      relations: { following: true },
    });
    const followingIds = follows.map(f => f.following.id);
    followingIds.push(userId);

    const [data, total] = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.author_id IN (:...ids)', { ids: followingIds })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map(p => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
        author: {
          id: p.author.id,
          displayName: p.author.displayName,
          username: p.author.username,
          avatarUrl: p.author.avatarUrl,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMine(userId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepository.findAndCount({
      where: { author: { id: userId } },
      relations: { author: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map(p => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
        author: {
          id: p.author.id,
          displayName: p.author.displayName,
          username: p.author.username,
          avatarUrl: p.author.avatarUrl,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.id !== userId) throw new ForbiddenException();
    await this.postsRepository.remove(post);
  }
}
