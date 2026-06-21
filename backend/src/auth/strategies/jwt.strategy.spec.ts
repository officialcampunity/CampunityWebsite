import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';

const mockUsersService = {
  findById: jest.fn(),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: typeof mockUsersService;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user with role when valid payload', async () => {
      const payload = { sub: 'u1', email: 'test@test.com', role: 'user' };
      const user = { id: 'u1', email: 'test@test.com', username: 'test', displayName: 'Test' };
      mockUsersService.findById.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(mockUsersService.findById).toHaveBeenCalledWith('u1');
      expect(result).toMatchObject({
        id: 'u1',
        email: 'test@test.com',
        role: 'user',
      });
    });

    it('should use payload role when user has no role', async () => {
      const payload = { sub: 'u1', email: 'test@test.com', role: 'admin' };
      const user = { id: 'u1', email: 'test@test.com', role: 'user' };
      mockUsersService.findById.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(result.role).toBe('admin');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(strategy.validate({ sub: 'nonexistent', email: '' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
