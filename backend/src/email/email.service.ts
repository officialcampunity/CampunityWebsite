import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.EMAIL_HOST;
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      this.logger.warn('EMAIL_HOST not set — email service is disabled');
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn(`Email not sent (service disabled): ${subject} to ${to}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@campunity.com',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${subject} to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err}`);
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${baseUrl}/verify-email?token=${token}`;
    await this.sendMail(
      to,
      'Verify your Campunity account',
      `<h1>Welcome to Campunity!</h1><p>Click <a href="${link}">here</a> to verify your email address.</p>`,
    );
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${baseUrl}/reset-password?token=${token}`;
    await this.sendMail(
      to,
      'Reset your Campunity password',
      `<h1>Password Reset</h1><p>Click <a href="${link}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    );
  }

  async sendModerationAlert(to: string, reportDetails: string) {
    await this.sendMail(
      to,
      'Campunity — New Report Requires Review',
      `<h1>Moderation Alert</h1><p>${reportDetails}</p>`,
    );
  }
}
