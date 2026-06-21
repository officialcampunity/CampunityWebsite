import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Resource } from '../entities/resource.entity';
import { ResourceType } from '../entities/resource-type.entity';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { Follow } from '../entities/follow.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginatedResult, paginate, paginationParams } from '../common/utils/pagination';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    @InjectRepository(ResourceType)
    private resourceTypesRepository: Repository<ResourceType>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateResourceDto, userId: string): Promise<Resource> {
    if (!dto.subjectId) {
      throw new BadRequestException('subjectId is required');
    }

    let resourceTypeId = dto.resourceTypeId;

    if (!resourceTypeId) {
      const rt = await this.resourceTypesRepository.findOne({
        where: { subject: { id: dto.subjectId } },
        order: { type: 'ASC' },
      });
      if (!rt) {
        throw new BadRequestException('No resource type found for the selected subject');
      }
      resourceTypeId = rt.id;
    }

    const resourceType = await this.resourceTypesRepository.findOne({ where: { id: resourceTypeId } });
    if (!resourceType) {
      throw new BadRequestException('Invalid resource type');
    }

    const resource = this.resourcesRepository.create({
      title: dto.title,
      description: dto.description,
      cloudinaryUrl: dto.cloudinaryUrl || null,
      fileType: dto.fileType || resourceType.type,
      author: { id: userId } as any,
      resourceType: { id: resourceType.id } as any,
    });
    return this.resourcesRepository.save(resource);
  }

  async findAll(query: {
    universityId?: string;
    courseId?: string;
    semesterId?: string;
    subjectId?: string;
    authorId?: string;
    page?: number;
    limit?: number;
    currentUserId?: string;
  }) {
    const { universityId, courseId, semesterId, subjectId, authorId, page = 1, limit = 20, currentUserId } = query;
    const qb = this.resourcesRepository.createQueryBuilder('resource')
      .leftJoinAndSelect('resource.author', 'author')
      .leftJoinAndSelect('resource.resourceType', 'resourceType')
      .leftJoinAndSelect('resourceType.subject', 'subject')
      .leftJoinAndSelect('subject.semester', 'semester')
      .leftJoinAndSelect('semester.course', 'course')
      .leftJoinAndSelect('course.university', 'university')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('resource.createdAt', 'DESC');

    if (authorId) {
      qb.andWhere('resource.author_id = :authorId', { authorId });
    }
    if (subjectId) {
      qb.andWhere('resourceType.subject_id = :subjectId', { subjectId });
    } else if (semesterId) {
      qb.andWhere('subject.semester_id = :semesterId', { semesterId });
    } else if (courseId) {
      qb.andWhere('semester.course_id = :courseId', { courseId });
    } else if (universityId) {
      qb.andWhere('course.university_id = :universityId', { universityId });
    }

    const [data, total] = await qb.getManyAndCount();
    const enriched = await this.enrichWithIsLiked(data, currentUserId);
    return { data: enriched, total, page, limit };
  }

  async findFollowing(userId: string, page = 1, limit = 20, currentUserId?: string) {
    const follows = await this.followsRepository.find({
      where: { follower: { id: userId } },
      relations: { following: true },
    });
    const followingIds = follows.map(f => f.following.id);
    if (followingIds.length === 0) return { data: [], total: 0, page, limit };

    const [data, total] = await this.resourcesRepository.findAndCount({
      where: { author: { id: In(followingIds) } },
      relations: { author: true, resourceType: { subject: { semester: { course: { university: true } } } } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const enriched = await this.enrichWithIsLiked(data, currentUserId);
    return { data: enriched, total, page, limit };
  }

  async findTrending(page = 1, limit = 20, currentUserId?: string) {
    const data = await this.resourcesRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.author', 'author')
      .leftJoinAndSelect('resource.resourceType', 'resourceType')
      .leftJoinAndSelect('resourceType.subject', 'subject')
      .leftJoinAndSelect('subject.semester', 'semester')
      .leftJoinAndSelect('semester.course', 'course')
      .leftJoinAndSelect('course.university', 'university')
      .leftJoin('resource.likes', 'likes')
      .groupBy('resource.id, author.id, resourceType.id, subject.id, semester.id, course.id, university.id')
      .orderBy('COUNT(likes.id)', 'DESC')
      .addOrderBy('resource.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const total = await this.resourcesRepository.count();
    const enriched = await this.enrichWithIsLiked(data, currentUserId);
    return { data: enriched, total, page, limit };
  }

  async search(q: string, page = 1, limit = 20, currentUserId?: string): Promise<PaginatedResult<Resource>> {
    if (!q?.trim()) return paginate([], 0, page, limit);
    const [data, total] = await this.resourcesRepository.findAndCount({
      where: [
        { title: ILike(`%${q}%`) },
        { description: ILike(`%${q}%`) },
      ],
      relations: { author: true, resourceType: { subject: { semester: { course: { university: true } } } } },
      order: { createdAt: 'DESC' },
      ...paginationParams(page, limit),
    });
    const enriched = await this.enrichWithIsLiked(data, currentUserId);
    return paginate(enriched, total, page, limit);
  }

  async findOne(id: string, currentUserId?: string): Promise<Resource> {
    const resource = await this.resourcesRepository.findOne({
      where: { id },
      relations: { author: true, resourceType: true },
    });
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    if (currentUserId) {
      const enriched = await this.enrichWithIsLiked([resource], currentUserId);
      return enriched[0];
    }
    return resource;
  }

  async delete(id: string, userId: string): Promise<void> {
    const resource = await this.findOne(id);
    if (resource.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own resources');
    }
    await this.resourcesRepository.remove(resource);
  }

  async like(resourceId: string, userId: string): Promise<void> {
    const resource = await this.findOne(resourceId);
    const existing = await this.likesRepository.findOne({
      where: { user: { id: userId }, resource: { id: resourceId } },
    });
    if (existing) {
      throw new ConflictException('Already liked');
    }
    const like = this.likesRepository.create({
      user: { id: userId } as any,
      resource: { id: resourceId } as any,
    });
    await this.likesRepository.save(like);
    if (resource.author.id !== userId) {
      await this.notificationsService.create({
        type: 'like',
        actorId: userId,
        recipientId: resource.author.id,
        resourceId,
      }).catch(() => {});
    }
  }

  async unlike(resourceId: string, userId: string): Promise<void> {
    const like = await this.likesRepository.findOne({
      where: { user: { id: userId }, resource: { id: resourceId } },
    });
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    await this.likesRepository.remove(like);
  }

  async getComments(resourceId: string, page = 1, limit = 20) {
    await this.findOne(resourceId);
    const [data, total] = await this.commentsRepository.findAndCount({
      where: { resource: { id: resourceId } },
      relations: { author: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async addComment(resourceId: string, userId: string, dto: CreateCommentDto) {
    const resource = await this.findOne(resourceId);
    const comment = this.commentsRepository.create({
      content: dto.content,
      author: { id: userId } as any,
      resource: { id: resourceId } as any,
    });
    const saved = await this.commentsRepository.save(comment);
    if (resource.author.id !== userId) {
      await this.notificationsService.create({
        type: 'comment',
        actorId: userId,
        recipientId: resource.author.id,
        resourceId,
      }).catch(() => {});
    }
    return saved;
  }

  async bookmark(resourceId: string, userId: string): Promise<void> {
    const resource = await this.findOne(resourceId);
    const existing = await this.bookmarksRepository.findOne({
      where: { user: { id: userId }, resource: { id: resourceId } },
    });
    if (existing) {
      throw new ConflictException('Already bookmarked');
    }
    const bookmark = this.bookmarksRepository.create({
      user: { id: userId } as any,
      resource: { id: resourceId } as any,
    });
    await this.bookmarksRepository.save(bookmark);
  }

  async unbookmark(resourceId: string, userId: string): Promise<void> {
    const bookmark = await this.bookmarksRepository.findOne({
      where: { user: { id: userId }, resource: { id: resourceId } },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.bookmarksRepository.remove(bookmark);
  }

  async findBookmarked(userId: string, page = 1, limit = 20) {
    const [bookmarks, total] = await this.bookmarksRepository.findAndCount({
      where: { user: { id: userId } },
      relations: {
        resource: {
          author: true,
          resourceType: { subject: { semester: { course: { university: true } } } },
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const data = bookmarks.map(b => b.resource);
    const enriched = await this.enrichWithIsLiked(data, userId);
    return { data: enriched, total, page, limit };
  }

  private async enrichWithIsLiked(resources: Resource[], userId?: string): Promise<Resource[]> {
    if (resources.length === 0) return resources;
    const resourceIds = resources.map(r => r.id);

    const likeCounts = await this.likesRepository
      .createQueryBuilder('like')
      .select('like.resource_id', 'resourceId')
      .addSelect('COUNT(*)', 'count')
      .where('like.resource_id IN (:...resourceIds)', { resourceIds })
      .groupBy('like.resource_id')
      .getRawMany<{ resourceId: string; count: string }>();
    const countMap = new Map(likeCounts.map(l => [l.resourceId, parseInt(l.count)]));

    let likedIds = new Set<string>();
    if (userId) {
      const userLikes = await this.likesRepository.find({
        where: { user: { id: userId }, resource: { id: In(resourceIds) } },
        relations: { resource: true },
      });
      likedIds = new Set(userLikes.map(l => l.resource.id));
    }

    return resources.map(r => ({
      ...r,
      likesCount: countMap.get(r.id) ?? 0,
      isLiked: likedIds.has(r.id),
    }));
  }
}
