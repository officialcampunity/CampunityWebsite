import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const mockResourcesService = {
  findAll: jest.fn(),
  findFollowing: jest.fn(),
  findTrending: jest.fn(),
  search: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  like: jest.fn(),
  unlike: jest.fn(),
  getComments: jest.fn(),
  addComment: jest.fn(),
  bookmark: jest.fn(),
  unbookmark: jest.fn(),
  findBookmarked: jest.fn(),
};

const mockCloudinaryService = {
  uploadFile: jest.fn(),
};

const makeReq = (userId = 'user-1') => ({ user: { id: userId } }) as any;

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let service: typeof mockResourcesService;
  let cloudinary: typeof mockCloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        { provide: ResourcesService, useValue: mockResourcesService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    controller = module.get<ResourcesController>(ResourcesController);
    service = module.get(ResourcesService);
    cloudinary = module.get(CloudinaryService);
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should call findFollowing when filter=following', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockResourcesService.findFollowing.mockResolvedValue(result);

      const response = await controller.getFeed(undefined, undefined, undefined, undefined, undefined, 'following', 1, 10, makeReq());

      expect(mockResourcesService.findFollowing).toHaveBeenCalledWith('user-1', 1, 10, 'user-1');
      expect(response).toEqual(result);
    });

    it('should call findAll by default', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockResourcesService.findAll.mockResolvedValue(result);

      const response = await controller.getFeed('u-1', 'c-1', 'sem-1', 'sub-1', 'a-1', undefined, 1, 10, makeReq());

      expect(mockResourcesService.findAll).toHaveBeenCalledWith({
        universityId: 'u-1',
        courseId: 'c-1',
        semesterId: 'sem-1',
        subjectId: 'sub-1',
        authorId: 'a-1',
        page: 1,
        limit: 10,
        currentUserId: 'user-1',
      });
      expect(response).toEqual(result);
    });

    it('should handle unauthenticated requests', async () => {
      mockResourcesService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      await controller.getFeed(undefined, undefined, undefined, undefined, undefined, undefined, 1, 10, undefined);

      expect(mockResourcesService.findAll).toHaveBeenCalled();
    });
  });

  describe('getTrending', () => {
    it('should return trending resources', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockResourcesService.findTrending.mockResolvedValue(result);

      const response = await controller.getTrending(1, 10, makeReq());

      expect(mockResourcesService.findTrending).toHaveBeenCalledWith(1, 10, 'user-1');
      expect(response).toEqual(result);
    });
  });

  describe('getMyResources', () => {
    it('should return user resources', async () => {
      mockResourcesService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await controller.getMyResources(makeReq(), 1, 20);

      expect(mockResourcesService.findAll).toHaveBeenCalledWith({
        authorId: 'user-1',
        page: 1,
        limit: 20,
        currentUserId: 'user-1',
      });
    });
  });

  describe('create', () => {
    it('should create resource', async () => {
      const dto = { title: 'New', description: 'Desc' };
      const result = { id: 'res-1' };
      mockResourcesService.create.mockResolvedValue(result);

      const response = await controller.create(makeReq(), dto as any);

      expect(mockResourcesService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(response).toEqual(result);
    });
  });

  describe('getOne', () => {
    it('should get resource by id', async () => {
      mockResourcesService.findOne.mockResolvedValue({ id: 'res-1' });

      await controller.getOne('res-1', makeReq());

      expect(mockResourcesService.findOne).toHaveBeenCalledWith('res-1', 'user-1');
    });
  });

  describe('delete', () => {
    it('should delete resource', async () => {
      const response = await controller.delete(makeReq(), 'res-1');

      expect(mockResourcesService.delete).toHaveBeenCalledWith('res-1', 'user-1');
      expect(response).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('like', () => {
    it('should like resource', async () => {
      const response = await controller.like(makeReq(), 'res-1');

      expect(mockResourcesService.like).toHaveBeenCalledWith('res-1', 'user-1');
      expect(response).toEqual({ message: 'Liked successfully' });
    });
  });

  describe('unlike', () => {
    it('should unlike resource', async () => {
      const response = await controller.unlike(makeReq(), 'res-1');

      expect(mockResourcesService.unlike).toHaveBeenCalledWith('res-1', 'user-1');
      expect(response).toEqual({ message: 'Unliked successfully' });
    });
  });

  describe('search', () => {
    it('should search resources', async () => {
      mockResourcesService.search.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await controller.search('math', 1, 20, makeReq());

      expect(mockResourcesService.search).toHaveBeenCalledWith('math', 1, 20, 'user-1');
    });
  });

  describe('getBookmarked', () => {
    it('should return bookmarked resources', async () => {
      mockResourcesService.findBookmarked.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await controller.getBookmarked(makeReq(), 1, 20);

      expect(mockResourcesService.findBookmarked).toHaveBeenCalledWith('user-1', 1, 20);
    });
  });

  describe('bookmark', () => {
    it('should bookmark resource', async () => {
      const response = await controller.bookmark(makeReq(), 'res-1');

      expect(mockResourcesService.bookmark).toHaveBeenCalledWith('res-1', 'user-1');
      expect(response).toEqual({ message: 'Bookmarked successfully' });
    });
  });

  describe('unbookmark', () => {
    it('should unbookmark resource', async () => {
      const response = await controller.unbookmark(makeReq(), 'res-1');

      expect(mockResourcesService.unbookmark).toHaveBeenCalledWith('res-1', 'user-1');
      expect(response).toEqual({ message: 'Unbookmarked successfully' });
    });
  });

  describe('getComments', () => {
    it('should get comments for resource', async () => {
      mockResourcesService.getComments.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      await controller.getComments('res-1', 1, 20);

      expect(mockResourcesService.getComments).toHaveBeenCalledWith('res-1', 1, 20);
    });
  });

  describe('addComment', () => {
    it('should add comment to resource', async () => {
      const dto = { content: 'Great!' };
      mockResourcesService.addComment.mockResolvedValue({ id: 'c1' });

      await controller.addComment(makeReq(), 'res-1', dto as any);

      expect(mockResourcesService.addComment).toHaveBeenCalledWith('res-1', 'user-1', dto);
    });
  });
});
