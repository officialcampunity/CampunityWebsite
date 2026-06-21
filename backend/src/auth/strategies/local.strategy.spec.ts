import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

const mockAuthService = {
  validateUser: jest.fn(),
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      const user = { id: 'u1', email: 'test@test.com' };
      mockAuthService.validateUser.mockResolvedValue(user);

      const result = await strategy.validate('test@test.com', 'password123');

      expect(mockAuthService.validateUser).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });
});
