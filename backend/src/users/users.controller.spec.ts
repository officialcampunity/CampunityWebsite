import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  getSuggested: jest.fn(),
  getBlockedUsers: jest.fn(),
  search: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  follow: jest.fn(),
  unfollow: jest.fn(),
  block: jest.fn(),
  unblock: jest.fn(),
  getFollowers: jest.fn(),
  getFollowing: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    jest.clearAllMocks();
  });

  describe('getSuggested', () => {
    it('should return suggested users', async () => {
      const users = [{ id: 'u2' }];
      mockUsersService.getSuggested.mockResolvedValue(users);

      const result = await controller.getSuggested({ user: { id: 'u1' } } as any);

      expect(mockUsersService.getSuggested).toHaveBeenCalledWith('u1');
      expect(result).toEqual(users);
    });
  });

  describe('getBlocked', () => {
    it('should return blocked users', async () => {
      const blocked = [{ id: 'u2' }];
      mockUsersService.getBlockedUsers.mockResolvedValue(blocked);

      const result = await controller.getBlocked({ user: { id: 'u1' } } as any);

      expect(mockUsersService.getBlockedUsers).toHaveBeenCalledWith('u1');
      expect(result).toEqual(blocked);
    });
  });

  describe('search', () => {
    it('should search users with query params', async () => {
      const result = { data: [{ id: 'u1' }], total: 1, page: 1, limit: 20 };
      mockUsersService.search.mockResolvedValue(result);

      const response = await controller.search('test', 1, 20);

      expect(mockUsersService.search).toHaveBeenCalledWith('test', 1, 20);
      expect(response).toEqual(result);
    });
  });

  describe('getProfile', () => {
    it('should return user by id', async () => {
      const user = { id: 'u1' };
      mockUsersService.findById.mockResolvedValue(user);

      const result = await controller.getProfile('u1');

      expect(mockUsersService.findById).toHaveBeenCalledWith('u1');
      expect(result).toEqual(user);
    });
  });

  describe('updateProfile', () => {
    it('should update current user profile', async () => {
      const user = { id: 'u1', displayName: 'Updated' };
      mockUsersService.update.mockResolvedValue(user);

      const result = await controller.updateProfile({ user: { id: 'u1' } } as any, { displayName: 'Updated' } as any);

      expect(mockUsersService.update).toHaveBeenCalledWith('u1', { displayName: 'Updated' });
      expect(result).toEqual(user);
    });
  });

  describe('deleteAccount', () => {
    it('should delete current user', async () => {
      const result = await controller.deleteAccount({ user: { id: 'u1' } } as any);

      expect(mockUsersService.delete).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ message: 'Account deleted' });
    });
  });

  describe('follow', () => {
    it('should follow user', async () => {
      const result = await controller.follow({ user: { id: 'u1' } } as any, 'u2');

      expect(mockUsersService.follow).toHaveBeenCalledWith('u1', 'u2');
      expect(result).toEqual({ message: 'Followed successfully' });
    });
  });

  describe('unfollow', () => {
    it('should unfollow user', async () => {
      const result = await controller.unfollow({ user: { id: 'u1' } } as any, 'u2');

      expect(mockUsersService.unfollow).toHaveBeenCalledWith('u1', 'u2');
      expect(result).toEqual({ message: 'Unfollowed successfully' });
    });
  });

  describe('block', () => {
    it('should block user', async () => {
      const result = await controller.block({ user: { id: 'u1' } } as any, 'u2');

      expect(mockUsersService.block).toHaveBeenCalledWith('u1', 'u2');
      expect(result).toEqual({ message: 'Blocked successfully' });
    });
  });

  describe('unblock', () => {
    it('should unblock user', async () => {
      const result = await controller.unblock({ user: { id: 'u1' } } as any, 'u2');

      expect(mockUsersService.unblock).toHaveBeenCalledWith('u1', 'u2');
      expect(result).toEqual({ message: 'Unblocked successfully' });
    });
  });

  describe('getFollowers', () => {
    it('should return paginated followers', async () => {
      const followers = { data: [{ id: 'u2' }], total: 1, page: 1, limit: 20 };
      mockUsersService.getFollowers.mockResolvedValue(followers);

      const result = await controller.getFollowers('u1', 1, 20);

      expect(mockUsersService.getFollowers).toHaveBeenCalledWith('u1', 1, 20);
      expect(result).toEqual(followers);
    });
  });

  describe('getFollowing', () => {
    it('should return paginated following', async () => {
      const following = { data: [{ id: 'u2' }], total: 1, page: 1, limit: 20 };
      mockUsersService.getFollowing.mockResolvedValue(following);

      const result = await controller.getFollowing('u1', 1, 20);

      expect(mockUsersService.getFollowing).toHaveBeenCalledWith('u1', 1, 20);
      expect(result).toEqual(following);
    });
  });
});
