import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  googleLogin: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  sendVerificationEmail: jest.fn(),
  verifyEmail: jest.fn(),
};

const mockResponse = () => {
  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user and set cookie', async () => {
      const dto = { email: 'test@test.com', password: 'pass123', username: 'test', displayName: 'Test' };
      const result = { access_token: 'token', user: { id: 'u1', email: dto.email } };
      mockAuthService.register.mockResolvedValue(result);
      const res = mockResponse();

      const response = await controller.register(dto as any, res);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith('token', 'token', expect.any(Object));
      expect(response).toEqual({ user: result.user });
    });
  });

  describe('login', () => {
    it('should login user and set cookie', async () => {
      const req = { user: { id: 'u1', email: 'test@test.com' } };
      const result = { access_token: 'token', user: req.user };
      mockAuthService.login.mockResolvedValue(result);
      const res = mockResponse();

      const response = await controller.login(req as any, res);

      expect(mockAuthService.login).toHaveBeenCalledWith(req.user);
      expect(res.cookie).toHaveBeenCalledWith('token', 'token', expect.any(Object));
      expect(response).toEqual({ user: result.user });
    });
  });

  describe('googleLogin', () => {
    it('should handle google login and set cookie', async () => {
      const dto = { googleId: 'g1', email: 'g@test.com' };
      const result = { access_token: 'token', user: { id: 'u1' } };
      mockAuthService.googleLogin.mockResolvedValue(result);
      const res = mockResponse();

      const response = await controller.googleLogin(dto as any, res);

      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalled();
      expect(response).toEqual({ user: result.user });
    });
  });

  describe('logout', () => {
    it('should clear token cookie', async () => {
      const res = mockResponse();

      const response = await controller.logout(res);

      expect(res.cookie).toHaveBeenCalledWith('token', '', expect.objectContaining({ maxAge: 0 }));
      expect(response).toEqual({ message: 'Logged out' });
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user', async () => {
      const req = { user: { id: 'u1', email: 'test@test.com' } };
      const result = await controller.getProfile(req as any);

      expect(result).toEqual(req.user);
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword service', async () => {
      const dto = { email: 'test@test.com' };

      const response = await controller.forgotPassword(dto as any);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@test.com');
      expect(response).toEqual({ message: 'If the email exists, a reset link has been sent.' });
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword service', async () => {
      const dto = { token: 'valid-token', password: 'newpass' };

      const response = await controller.resetPassword(dto as any);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('valid-token', 'newpass');
      expect(response).toEqual({ message: 'Password reset successfully.' });
    });
  });

  describe('sendVerification', () => {
    it('should send verification email for authenticated user', async () => {
      const req = { user: { id: 'u1' } };

      const response = await controller.sendVerification(req as any);

      expect(mockAuthService.sendVerificationEmail).toHaveBeenCalledWith('u1');
      expect(response).toEqual({ message: 'Verification email sent.' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      const dto = { token: 'verify-token' };

      const response = await controller.verifyEmail(dto as any);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('verify-token');
      expect(response).toEqual({ message: 'Email verified successfully.' });
    });
  });
});
