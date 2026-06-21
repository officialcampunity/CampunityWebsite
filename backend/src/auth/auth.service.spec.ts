import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

jest.mock('bcrypt');

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByGoogleId: jest.fn(),
  findByResetToken: jest.fn(),
  findByVerificationToken: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('test-access-token'),
};

const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = {
      email: 'test@test.com',
      password: 'password123',
      username: 'testuser',
      displayName: 'Test User',
    };

    it('should hash password and create user', async () => {
      const hashed = 'hashed-password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);
      const createdUser = { id: 'user-1', ...dto, password: hashed };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: dto.email,
        password: hashed,
        username: dto.username,
        displayName: dto.displayName,
      });
      expect(result).toEqual({
        access_token: 'test-access-token',
        user: createdUser,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUsersService.create.mockRejectedValue(new ConflictException('Email or username already exists'));

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user when password matches', async () => {
      const user = { id: 'u1', email: 'test@test.com', password: 'hashed' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password123');

      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@test.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when user has no password', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: null });

      const result = await service.validateUser('test@test.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@test.com', 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate token for user', async () => {
      const user = { id: 'u1', email: 'test@test.com' };
      const result = await service.login(user);

      expect(result).toEqual({ access_token: 'test-access-token', user });
    });
  });

  describe('googleLogin', () => {
    const dto = {
      googleId: 'google-1',
      email: 'google@test.com',
      username: 'googleuser',
      displayName: 'Google User',
      avatarUrl: 'https://avatar.com/1',
    };

    it('should return existing user by googleId', async () => {
      const existing = { id: 'u1', ...dto };
      mockUsersService.findByGoogleId.mockResolvedValue(existing);

      const result = await service.googleLogin(dto);

      expect(result).toEqual({ access_token: 'test-access-token', user: existing });
    });

    it('should link google account to existing email user', async () => {
      const emailUser = { id: 'u1', email: dto.email, googleId: null, avatarUrl: null };
      mockUsersService.findByGoogleId.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(emailUser);
      mockUsersService.save.mockResolvedValue({ ...emailUser, googleId: dto.googleId, avatarUrl: dto.avatarUrl });

      const result = await service.googleLogin(dto);

      expect(emailUser.googleId).toBe(dto.googleId);
      expect(emailUser.avatarUrl).toBe(dto.avatarUrl);
      expect(mockUsersService.save).toHaveBeenCalled();
    });

    it('should create new user when no existing account', async () => {
      mockUsersService.findByGoogleId.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);
      const newUser = { id: 'u1', ...dto };
      mockUsersService.create.mockResolvedValue(newUser);

      const result = await service.googleLogin(dto);

      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: dto.email,
        googleId: dto.googleId,
        username: dto.username,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      });
      expect(result).toEqual({ access_token: 'test-access-token', user: newUser });
    });

    it('should link without avatar when not provided', async () => {
      const dtoNoAvatar = { ...dto, avatarUrl: undefined };
      const emailUser = { id: 'u1', email: dto.email, googleId: null, avatarUrl: 'existing.jpg' };
      mockUsersService.findByGoogleId.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(emailUser);
      mockUsersService.save.mockResolvedValue(emailUser);

      await service.googleLogin(dtoNoAvatar);

      expect(emailUser.avatarUrl).toBe('existing.jpg');
      expect(mockUsersService.save).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and send email', async () => {
      const user: any = { id: 'u1', email: 'test@test.com', password: 'hashed' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockUsersService.save.mockResolvedValue(user);

      await service.forgotPassword('test@test.com');

      expect(user.resetToken).toBeDefined();
      expect(user.resetTokenExpiry).toBeInstanceOf(Date);
      expect(mockUsersService.save).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com', user.resetToken);
    });

    it('should silently return when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await service.forgotPassword('nonexistent@test.com');

      expect(mockUsersService.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should silently return when user has no password', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'u1', email: 'test@test.com', password: null });

      await service.forgotPassword('test@test.com');

      expect(mockUsersService.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const user: any = { id: 'u1', resetToken: 'valid-token', resetTokenExpiry: new Date(Date.now() + 3600000) };
      mockUsersService.findByResetToken.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      mockUsersService.save.mockResolvedValue(user);

      await service.resetPassword('valid-token', 'newpassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(user.password).toBe('new-hashed');
      expect(user.resetToken).toBeNull();
      expect(user.resetTokenExpiry).toBeNull();
      expect(mockUsersService.save).toHaveBeenCalled();
    });

    it('should throw when token is invalid', async () => {
      mockUsersService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword('invalid', 'newpass')).rejects.toThrow(BadRequestException);
    });

    it('should throw when token is expired', async () => {
      const user = { id: 'u1', resetToken: 'expired', resetTokenExpiry: new Date(Date.now() - 3600000) };
      mockUsersService.findByResetToken.mockResolvedValue(user);

      await expect(service.resetPassword('expired', 'newpass')).rejects.toThrow(BadRequestException);
    });

    it('should throw when token has no expiry', async () => {
      const user = { id: 'u1', resetToken: 'no-expiry', resetTokenExpiry: null };
      mockUsersService.findByResetToken.mockResolvedValue(user);

      await expect(service.resetPassword('no-expiry', 'newpass')).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      const user: any = { id: 'u1', email: 'test@test.com', isVerified: false };
      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.save.mockResolvedValue(user);

      await service.sendVerificationEmail('u1');

      expect(user.verificationToken).toBeDefined();
      expect(mockUsersService.save).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith('test@test.com', user.verificationToken);
    });

    it('should throw when email already verified', async () => {
      mockUsersService.findById.mockResolvedValue({ id: 'u1', isVerified: true });

      await expect(service.sendVerificationEmail('u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const user = { id: 'u1', isVerified: false, verificationToken: 'valid-token' };
      mockUsersService.findByVerificationToken.mockResolvedValue(user);
      mockUsersService.save.mockResolvedValue(user);

      await service.verifyEmail('valid-token');

      expect(user.isVerified).toBe(true);
      expect(user.verificationToken).toBeNull();
      expect(mockUsersService.save).toHaveBeenCalled();
    });

    it('should throw when token is invalid', async () => {
      mockUsersService.findByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid')).rejects.toThrow(BadRequestException);
    });
  });
});
