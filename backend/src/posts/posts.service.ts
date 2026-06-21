import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';
import { Follow } from '../entities/follow.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { paginate, PaginatedResult, paginationParams } from '../common/utils/pagination';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    @InjectRepository(PostComment)
    private postCommentsRepository: Repository<PostComment>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
  ) {}

  async create(dto: CreatePostDto, userId: string) {
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
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
    };
  }

  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.id !== userId) throw new ForbiddenException();
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.imageUrl !== undefined) post.imageUrl = dto.imageUrl;
    await this.postsRepository.save(post);
    return this.formatPost(post, userId);
  }

  async like(postId: string, userId: string) {
    const existing = await this.postLikesRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });
    if (existing) throw new ConflictException('Already liked');
    await this.postLikesRepository.save(
      this.postLikesRepository.create({
        user: { id: userId } as any,
        post: { id: postId } as any,
      }),
    );
  }

  async unlike(postId: string, userId: string) {
    const like = await this.postLikesRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });
    if (!like) throw new NotFoundException('Not liked yet');
    await this.postLikesRepository.remove(like);
  }

  async getComments(postId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const [data, total] = await this.postCommentsRepository.findAndCount({
      where: { post: { id: postId } },
      relations: { author: true },
      order: { createdAt: 'DESC' },
      ...paginationParams(page, limit),
    });
    return paginate(
      data.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: {
          id: c.author.id,
          displayName: c.author.displayName,
          username: c.author.username,
          avatarUrl: c.author.avatarUrl,
        },
      })),
      total, page, limit,
    );
  }

  async addComment(postId: string, userId: string, content: string) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const comment = this.postCommentsRepository.create({
      content,
      author: { id: userId } as any,
      post: { id: postId } as any,
    });
    const saved = await this.postCommentsRepository.save(comment);
    const full = await this.postCommentsRepository.findOne({
      where: { id: saved.id },
      relations: { author: true },
    });
    if (!full) throw new Error('Comment not found after creation');
    return {
      id: full.id,
      content: full.content,
      createdAt: full.createdAt,
      author: {
        id: full.author.id,
        displayName: full.author.displayName,
        username: full.author.username,
        avatarUrl: full.author.avatarUrl,
      },
    };
  }

  async getFeed(userId: string | undefined, page: number, limit: number) {
    let followingIds: string[] = [];

    if (userId) {
      const follows = await this.followsRepository.find({
        where: { follower: { id: userId } },
        relations: { following: true },
      });
      followingIds = follows.map(f => f.following.id);
      followingIds.push(userId);
    }

    const [data, total] = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .where(followingIds.length > 0 ? 'post.author_id IN (:...ids)' : '1=1', followingIds.length > 0 ? { ids: followingIds } : {})
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map(p => this.formatPost(p, userId)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMine(userId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepository.findAndCount({
      where: { author: { id: userId } },
      relations: { author: true, likes: true, comments: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map(p => this.formatPost(p, userId)),
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

  private formatPost(post: Post, currentUserId?: string) {
    const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
    const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;
    const isLiked = currentUserId && Array.isArray(post.likes)
      ? post.likes.some(l => l.user?.id === currentUserId)
      : false;

    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      author: {
        id: post.author.id,
        displayName: post.author.displayName,
        username: post.author.username,
        avatarUrl: post.author.avatarUrl,
      },
      likesCount,
      commentsCount,
      isLiked,
    };
  }
}
