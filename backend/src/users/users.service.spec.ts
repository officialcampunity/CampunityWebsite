import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { NotificationsService } from '../notifications/notifications.service';

const mockUsersRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockFollowsRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockBlockedUsersRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockNotificationsService = {
  create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
};

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@test.com',
  username: 'testuser',
  displayName: 'Test User',
  password: 'hashed',
  googleId: null,
  avatarUrl: null,
  bio: null,
  role: 'user',
  isVerified: false,
  resetToken: null,
  resetTokenExpiry: null,
  verificationToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: typeof mockUsersRepository;
  let followsRepo: typeof mockFollowsRepository;
  let blockedRepo: typeof mockBlockedUsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: getRepositoryToken(Follow), useValue: mockFollowsRepository },
        { provide: getRepositoryToken(BlockedUser), useValue: mockBlockedUsersRepository },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepo = module.get(getRepositoryToken(User));
    followsRepo = module.get(getRepositoryToken(Follow));
    blockedRepo = module.get(getRepositoryToken(BlockedUser));
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = makeUser();
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('user-1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = makeUser();
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');

      expect(result).toEqual(user);
    });

    it('should return null when not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findByGoogleId', () => {
    it('should return user by googleId', async () => {
      const user = makeUser({ googleId: 'g1' });
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findByGoogleId('g1');

      expect(result).toEqual(user);
    });

    it('should return null when not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByGoogleId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const data = { email: 'new@test.com', username: 'newuser', password: 'hashed' };

    it('should create and return user', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);
      const newUser = makeUser(data);
      mockUsersRepository.create.mockReturnValue(newUser);
      mockUsersRepository.save.mockResolvedValue(newUser);

      const result = await service.create(data);

      expect(mockUsersRepository.create).toHaveBeenCalledWith(data);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should throw ConflictException when email exists', async () => {
      mockUsersRepository.findOne.mockResolvedValue(makeUser({ email: data.email }));

      await expect(service.create(data)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when username exists', async () => {
      mockUsersRepository.findOne.mockResolvedValue(makeUser({ username: data.username }));

      await expect(service.create(data)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const user = makeUser();
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.update('user-1', { displayName: 'Updated' });

      expect(user.displayName).toBe('Updated');
      expect(mockUsersRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { displayName: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('follow', () => {
    it('should create follow and send notification', async () => {
      const following = makeUser({ id: 'user-2' });
      mockUsersRepository.findOne.mockResolvedValue(following);
      mockFollowsRepository.findOne.mockResolvedValue(null);
      const follow = { id: 'f1' };
      mockFollowsRepository.create.mockReturnValue(follow);
      mockFollowsRepository.save.mockResolvedValue(follow);

      await service.follow('user-1', 'user-2');

      expect(mockFollowsRepository.create).toHaveBeenCalled();
      expect(mockFollowsRepository.save).toHaveBeenCalledWith(follow);
      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        type: 'follow',
        actorId: 'user-1',
        recipientId: 'user-2',
      });
    });

    it('should throw ConflictException when following self', async () => {
      await expect(service.follow('user-1', 'user-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when already following', async () => {
      mockUsersRepository.findOne.mockResolvedValue(makeUser({ id: 'user-2' }));
      mockFollowsRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.follow('user-1', 'user-2')).rejects.toThrow(ConflictException);
    });
  });

  describe('unfollow', () => {
    it('should remove follow relationship', async () => {
      const follow = { id: 'f1' };
      mockFollowsRepository.findOne.mockResolvedValue(follow);

      await service.unfollow('user-1', 'user-2');

      expect(mockFollowsRepository.remove).toHaveBeenCalledWith(follow);
    });

    it('should throw NotFoundException when follow not found', async () => {
      mockFollowsRepository.findOne.mockResolvedValue(null);

      await expect(service.unfollow('user-1', 'user-2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSuggested', () => {
    it('should return 5 users excluding self and followed', async () => {
      const followedUsers = [{ following: { id: 'user-2' } }];
      mockFollowsRepository.find.mockResolvedValue(followedUsers);
      const suggested = [makeUser({ id: 'user-3' })];
      mockUsersRepository.find.mockResolvedValue(suggested);

      const result = await service.getSuggested('user-1');

      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object) },
        take: 5,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(suggested);
    });

    it('should return 5 random users when no userId', async () => {
      const users = [makeUser()];
      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.getSuggested();

      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        take: 5,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(users);
    });
  });

  describe('search', () => {
    it('should search by displayName and username', async () => {
      const users = [makeUser()];
      mockUsersRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.search('test');

      expect(mockUsersRepository.findAndCount).toHaveBeenCalled();
      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
    });

    it('should return empty when query is empty', async () => {
      const result = await service.search('');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const user = makeUser();
      mockUsersRepository.findOne.mockResolvedValue(user);
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('user-1');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(mockUsersRepository.delete).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('block', () => {
    it('should block user and unfollow them', async () => {
      const blockedUser = makeUser({ id: 'user-2' });
      mockUsersRepository.findOne.mockResolvedValue(blockedUser);
      mockBlockedUsersRepository.findOne.mockResolvedValue(null);
      const block = { id: 'b1' };
      mockBlockedUsersRepository.create.mockReturnValue(block);
      mockBlockedUsersRepository.save.mockResolvedValue(block);
      mockFollowsRepository.findOne.mockResolvedValue(null);

      await service.block('user-1', 'user-2');

      expect(mockBlockedUsersRepository.create).toHaveBeenCalled();
      expect(mockBlockedUsersRepository.save).toHaveBeenCalledWith(block);
    });

    it('should throw ConflictException when blocking self', async () => {
      await expect(service.block('user-1', 'user-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when already blocked', async () => {
      mockUsersRepository.findOne.mockResolvedValue(makeUser({ id: 'user-2' }));
      mockBlockedUsersRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.block('user-1', 'user-2')).rejects.toThrow(ConflictException);
    });
  });

  describe('unblock', () => {
    it('should remove block', async () => {
      const block = { id: 'b1' };
      mockBlockedUsersRepository.findOne.mockResolvedValue(block);

      await service.unblock('user-1', 'user-2');

      expect(mockBlockedUsersRepository.remove).toHaveBeenCalledWith(block);
    });

    it('should throw NotFoundException when block not found', async () => {
      mockBlockedUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.unblock('user-1', 'user-2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBlockedUsers', () => {
    it('should return list of blocked users', async () => {
      const blocked = makeUser({ id: 'user-2' });
      mockBlockedUsersRepository.find.mockResolvedValue([{ blocked }]);

      const result = await service.getBlockedUsers('user-1');

      expect(result).toEqual([blocked]);
    });
  });

  describe('getFollowers', () => {
    it('should return paginated followers', async () => {
      const follower = makeUser({ id: 'user-2' });
      mockFollowsRepository.findAndCount.mockResolvedValue([[{ follower }], 1]);

      const result = await service.getFollowers('user-1', 1, 20);

      expect(result.data).toEqual([follower]);
      expect(result.total).toBe(1);
    });
  });

  describe('getFollowing', () => {
    it('should return paginated following', async () => {
      const following = makeUser({ id: 'user-2' });
      mockFollowsRepository.findAndCount.mockResolvedValue([[{ following }], 1]);

      const result = await service.getFollowing('user-1', 1, 20);

      expect(result.data).toEqual([following]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByResetToken', () => {
    it('should find user by reset token', async () => {
      const user = makeUser({ resetToken: 'token' });
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findByResetToken('token');

      expect(result).toEqual(user);
    });
  });

  describe('findByVerificationToken', () => {
    it('should find user by verification token', async () => {
      const user = makeUser({ verificationToken: 'vtoken' });
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findByVerificationToken('vtoken');

      expect(result).toEqual(user);
    });
  });

  describe('save', () => {
    it('should save user', async () => {
      const user = makeUser() as any;
      mockUsersRepository.save.mockResolvedValue(user);

      const result = await service.save(user);

      expect(mockUsersRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });
});
