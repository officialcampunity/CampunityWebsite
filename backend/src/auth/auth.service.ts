import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
      displayName: dto.displayName,
    });
    return this.generateToken(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password) {
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        return user;
      }
    }
    return null;
  }

  async login(user: any) {
    return this.generateToken(user);
  }

  async googleLogin(dto: GoogleLoginDto) {
    let user = await this.usersService.findByGoogleId(dto.googleId);
    if (!user) {
      user = await this.usersService.findByEmail(dto.email);
      if (user) {
        user.googleId = dto.googleId;
        if (dto.avatarUrl) user.avatarUrl = dto.avatarUrl;
        await this.usersService.save(user);
      } else {
        user = await this.usersService.create({
          email: dto.email,
          googleId: dto.googleId,
          username: dto.username,
          displayName: dto.displayName,
          avatarUrl: dto.avatarUrl,
        });
      }
    }
    return this.generateToken(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) return;
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await this.usersService.save(user);
    await this.emailService.sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.usersService.save(user);
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (user.isVerified) throw new BadRequestException('Email already verified');
    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    await this.usersService.save(user);
    await this.emailService.sendVerificationEmail(user.email, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid verification token');
    user.isVerified = true;
    user.verificationToken = null;
    await this.usersService.save(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role || 'user' };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async refresh(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.generateToken(user);
  }
}
