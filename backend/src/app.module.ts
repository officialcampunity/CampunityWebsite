import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ResourcesModule } from './resources/resources.module';
import { MessagesModule } from './messages/messages.module';
import { ReportsModule } from './reports/reports.module';
import { LookupModule } from './lookup/lookup.module';
import { StoriesModule } from './stories/stories.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { GatewaysModule } from './gateways/gateways.module';
import { EmailModule } from './email/email.module';
import { PostsModule } from './posts/posts.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(4000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required().min(16),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        EMAIL_HOST: Joi.string().optional().allow(''),
        EMAIL_PORT: Joi.number().optional(),
        EMAIL_SECURE: Joi.string().optional().allow(''),
        EMAIL_USER: Joi.string().optional().allow(''),
        EMAIL_PASS: Joi.string().optional().allow(''),
        EMAIL_FROM: Joi.string().optional().allow(''),
        CLOUDINARY_CLOUD_NAME: Joi.string().optional().allow(''),
        CLOUDINARY_API_KEY: Joi.string().optional().allow(''),
        CLOUDINARY_API_SECRET: Joi.string().optional().allow(''),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://localhost/campunity',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development' || process.env.DB_SYNC === 'true',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    CommonModule,
    CloudinaryModule,
    AuthModule,
    UsersModule,
    ResourcesModule,
    MessagesModule,
    ReportsModule,
    LookupModule,
    StoriesModule,
    NotificationsModule,
    HealthModule,
    GatewaysModule,
    EmailModule,
    PostsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
