import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Resource } from '../entities/resource.entity';
import { ResourceType } from '../entities/resource-type.entity';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { Follow } from '../entities/follow.entity';
import { NotificationsService } from '../notifications/notifications.service';

const mockResourcesRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockResourceTypesRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockCommentsRepository = {
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockLikesRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockBookmarksRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockFollowsRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockNotificationsService = {
  create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
};

const makeResource = (overrides = {}) => ({
  id: 'res-1',
  title: 'Test Resource',
  description: 'A test resource',
  cloudinaryUrl: null,
  fileType: 'PDF',
  author: { id: 'user-1', displayName: 'Author', username: 'author', email: 'a@t.com' },
  resourceType: { id: 'rt-1', type: 'Note', subject: { id: 'sub-1', name: 'Math', semester: { id: 'sem-1', name: 'S1', course: { id: 'c-1', name: 'CS', university: { id: 'u-1', name: 'MIT' } } } } },
  likes: [],
  comments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ResourcesService', () => {
  let service: ResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: getRepositoryToken(Resource), useValue: mockResourcesRepository },
        { provide: getRepositoryToken(ResourceType), useValue: mockResourceTypesRepository },
        { provide: getRepositoryToken(Comment), useValue: mockCommentsRepository },
        { provide: getRepositoryToken(Like), useValue: mockLikesRepository },
        { provide: getRepositoryToken(Bookmark), useValue: mockBookmarksRepository },
        { provide: getRepositoryToken(Follow), useValue: mockFollowsRepository },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const rt = { id: 'rt-1', type: 'Note' };

    it('should create resource with given resourceTypeId and subjectId', async () => {
      mockResourceTypesRepository.findOne.mockReturnValue(rt);
      const dto = { title: 'New', description: 'Desc', resourceTypeId: 'rt-1', subjectId: 'sub-1' };
      const resource = { id: 'res-1', title: 'New', description: 'Desc', author: { id: 'user-1' }, resourceType: rt };
      mockResourcesRepository.create.mockReturnValue(resource);
      mockResourcesRepository.save.mockResolvedValue(resource);

      const result = await service.create(dto as any, 'user-1');

      expect(mockResourcesRepository.create).toHaveBeenCalled();
      expect(mockResourcesRepository.save).toHaveBeenCalledWith(resource);
      expect(result).toEqual(resource);
    });

    it('should lookup resourceType by subjectId when no resourceTypeId', async () => {
      mockResourceTypesRepository.findOne.mockReturnValue(rt);
      const dto = { title: 'New', description: 'Desc', subjectId: 'sub-1' };
      const resource = { id: 'res-1', title: 'New', description: 'Desc', author: { id: 'user-1' }, resourceType: rt };
      mockResourcesRepository.create.mockReturnValue(resource);
      mockResourcesRepository.save.mockResolvedValue(resource);

      const result = await service.create(dto as any, 'user-1');

      expect(result).toEqual(resource);
    });

    it('should throw when no resource type found for subject', async () => {
      mockResourceTypesRepository.findOne.mockReturnValue(null);
      const dto = { title: 'New', description: 'Desc', subjectId: 'sub-1' };

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when subjectId is missing', async () => {
      const dto = { title: 'New', description: 'Desc' };

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when resourceType not found by id', async () => {
      mockResourceTypesRepository.findOne.mockReturnValue(null);
      const dto = { title: 'New', description: 'Desc', resourceTypeId: 'invalid-rt', subjectId: 'sub-1' };

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return resource with enriched data', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      mockLikesRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      mockLikesRepository.find.mockResolvedValue([]);

      const result = await service.findOne('res-1', 'user-1');

      expect(result.id).toBe('res-1');
      expect((result as any).likesCount).toBe(0);
      expect((result as any).isLiked).toBe(false);
    });

    it('should throw NotFoundException when not found', async () => {
      mockResourcesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete resource owned by user', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      mockResourcesRepository.remove.mockResolvedValue(resource);

      await service.delete('res-1', 'user-1');

      expect(mockResourcesRepository.remove).toHaveBeenCalledWith(resource);
    });

    it('should throw ForbiddenException when not owner', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);

      await expect(service.delete('res-1', 'user-2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('like', () => {
    it('should like resource and notify author', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      mockLikesRepository.findOne.mockResolvedValue(null);
      mockLikesRepository.create.mockReturnValue({ id: 'like-1' });
      mockLikesRepository.save.mockResolvedValue({ id: 'like-1' });

      await service.like('res-1', 'user-2');

      expect(mockLikesRepository.save).toHaveBeenCalled();
      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        type: 'like',
        actorId: 'user-2',
        recipientId: 'user-1',
        resourceId: 'res-1',
      });
    });

    it('should not notify when liking own resource', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      mockLikesRepository.findOne.mockResolvedValue(null);
      mockLikesRepository.create.mockReturnValue({ id: 'like-1' });
      mockLikesRepository.save.mockResolvedValue({ id: 'like-1' });

      await service.like('res-1', 'user-1');

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when already liked', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      mockLikesRepository.findOne.mockResolvedValue({ id: 'existing-like' });

      await expect(service.like('res-1', 'user-2')).rejects.toThrow(ConflictException);
    });
  });

  describe('unlike', () => {
    it('should remove like', async () => {
      const like = { id: 'like-1' };
      mockLikesRepository.findOne.mockResolvedValue(like);

      await service.unlike('res-1', 'user-2');

      expect(mockLikesRepository.remove).toHaveBeenCalledWith(like);
    });

    it('should throw NotFoundException when like not found', async () => {
      mockLikesRepository.findOne.mockResolvedValue(null);

      await expect(service.unlike('res-1', 'user-2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    it('should return paginated comments', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      const comments = [{ id: 'c1', content: 'Great!' }];
      mockCommentsRepository.findAndCount.mockResolvedValue([comments, 1]);

      const result = await service.getComments('res-1', 1, 20);

      expect(result.data).toEqual(comments);
      expect(result.total).toBe(1);
    });
  });

  describe('addComment', () => {
    it('should create comment and notify author', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      const comment = { id: 'c1', content: 'Nice!' };
      mockCommentsRepository.create.mockReturnValue(comment);
      mockCommentsRepository.save.mockResolvedValue(comment);

      const result = await service.addComment('res-1', 'user-2', { content: 'Nice!' });

      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        type: 'comment',
        actorId: 'user-2',
        recipientId: 'user-1',
        resourceId: 'res-1',
      });
      expect(result).toEqual(comment);
    });
  });

  describe('bookmark', () => {
    it('should bookmark resource', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      mockBookmarksRepository.findOne.mockResolvedValue(null);
      mockBookmarksRepository.create.mockReturnValue({ id: 'bm-1' });
      mockBookmarksRepository.save.mockResolvedValue({ id: 'bm-1' });

      await service.bookmark('res-1', 'user-2');

      expect(mockBookmarksRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when already bookmarked', async () => {
      const resource = makeResource();
      mockResourcesRepository.findOne.mockResolvedValue(resource);
      mockBookmarksRepository.findOne.mockResolvedValue({ id: 'existing-bm' });

      await expect(service.bookmark('res-1', 'user-2')).rejects.toThrow(ConflictException);
    });
  });

  describe('unbookmark', () => {
    it('should remove bookmark', async () => {
      const bookmark = { id: 'bm-1' };
      mockBookmarksRepository.findOne.mockResolvedValue(bookmark);

      await service.unbookmark('res-1', 'user-2');

      expect(mockBookmarksRepository.remove).toHaveBeenCalledWith(bookmark);
    });

    it('should throw NotFoundException when bookmark not found', async () => {
      mockBookmarksRepository.findOne.mockResolvedValue(null);

      await expect(service.unbookmark('res-1', 'user-2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBookmarked', () => {
    it('should return bookmarked resources', async () => {
      const resource = makeResource();
      const bookmark = { resource };
      mockBookmarksRepository.findAndCount.mockResolvedValue([[bookmark], 1]);

      mockLikesRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      mockLikesRepository.find.mockResolvedValue([]);

      const result = await service.findBookmarked('user-1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('res-1');
    });
  });

  describe('search', () => {
    it('should search resources by title and description', async () => {
      const resources = [makeResource()];
      mockResourcesRepository.findAndCount.mockResolvedValue([resources, 1]);
      mockLikesRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      mockLikesRepository.find.mockResolvedValue([]);

      const result = await service.search('test');

      expect(result.data[0].id).toBe('res-1');
      expect((result.data[0] as any).isLiked).toBe(false);
      expect((result.data[0] as any).likesCount).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should return empty when query is empty', async () => {
      const result = await service.search('');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should build query with filters for the QB', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[makeResource()], 1]),
      };
      mockResourcesRepository.createQueryBuilder.mockReturnValue(qb);
      mockLikesRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      mockLikesRepository.find.mockResolvedValue([]);

      const result = await service.findAll({ universityId: 'u-1' });

      expect(result.data).toHaveLength(1);
      expect(qb.andWhere).toHaveBeenCalled();
    });

    it('should filter by authorId', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[makeResource()], 1]),
      };
      mockResourcesRepository.createQueryBuilder.mockReturnValue(qb);
      mockLikesRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      mockLikesRepository.find.mockResolvedValue([]);

      await service.findAll({ authorId: 'user-1' });

      expect(qb.andWhere).toHaveBeenCalledWith('resource.author_id = :authorId', { authorId: 'user-1' });
    });
  });

  describe('findFollowing', () => {
    it('should return resources from followed users', async () => {
      mockFollowsRepository.find.mockResolvedValue([{ following: { id: 'user-2' } }]);
      const resources = [makeResource()];
      mockResourcesRepository.findAndCount.mockResolvedValue([resources, 1]);
      mockLikesRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      mockLikesRepository.find.mockResolvedValue([]);

      const result = await service.findFollowing('user-1');

      expect(result.data).toHaveLength(1);
    });

    it('should return empty when not following anyone', async () => {
      mockFollowsRepository.find.mockResolvedValue([]);

      const result = await service.findFollowing('user-1');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findTrending', () => {
    it('should return resources sorted by likes', async () => {
      const r1 = makeResource({ id: 'r1', likes: [{ id: 'l1' }, { id: 'l2' }] });
      const r2 = makeResource({ id: 'r2', likes: [{ id: 'l3' }] });
      mockResourcesRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([r1, r2]),
      });
      mockResourcesRepository.count.mockResolvedValue(2);
      mockLikesRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      mockLikesRepository.find.mockResolvedValue([]);

      const result = await service.findTrending(1, 20);

      expect(result.data).toHaveLength(2);
    });
  });
});
