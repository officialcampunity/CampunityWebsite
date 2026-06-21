import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

const nodemailer = jest.requireMock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_SECURE;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.EMAIL_FROM;
    delete process.env.FRONTEND_URL;
  });

  it('should create transporter when EMAIL_HOST is set', () => {
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'user';
    process.env.EMAIL_PASS = 'pass';

    service = new EmailService();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'user', pass: 'pass' },
    });
  });

  it('should be defined when EMAIL_HOST not set', () => {
    service = new EmailService();
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    beforeEach(() => {
      process.env.EMAIL_HOST = 'smtp.example.com';
      service = new EmailService();
    });

    it('should send email when transporter exists', async () => {
      const transporter = nodemailer.createTransport();

      await service['sendMail']('to@test.com', 'Subject', '<p>Body</p>');

      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@campunity.com',
        to: 'to@test.com',
        subject: 'Subject',
        html: '<p>Body</p>',
      });
    });

    it('should use custom from address when set', async () => {
      process.env.EMAIL_FROM = 'custom@campunity.com';
      service = new EmailService();
      const transporter = nodemailer.createTransport();
      transporter.sendMail.mockResolvedValue({ messageId: 'id' });

      await service['sendMail']('to@test.com', 'Subject', '<p>Body</p>');

      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'custom@campunity.com' }),
      );
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct link', async () => {
      process.env.EMAIL_HOST = 'smtp.example.com';
      process.env.FRONTEND_URL = 'http://localhost:3000';
      service = new EmailService();
      const sendMailSpy = jest.spyOn(service as any, 'sendMail').mockResolvedValue(undefined);

      await service.sendVerificationEmail('user@test.com', 'verify-token');

      expect(sendMailSpy).toHaveBeenCalledWith(
        'user@test.com',
        'Verify your Campunity account',
        expect.stringContaining('verify-token'),
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct link', async () => {
      process.env.EMAIL_HOST = 'smtp.example.com';
      process.env.FRONTEND_URL = 'http://localhost:3000';
      service = new EmailService();
      const sendMailSpy = jest.spyOn(service as any, 'sendMail').mockResolvedValue(undefined);

      await service.sendPasswordResetEmail('user@test.com', 'reset-token');

      expect(sendMailSpy).toHaveBeenCalledWith(
        'user@test.com',
        'Reset your Campunity password',
        expect.stringContaining('reset-token'),
      );
    });
  });
});
