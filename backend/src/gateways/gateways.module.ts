import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { NotificationsGateway } from './notifications.gateway';
import { SocketAuthMiddleware } from './socket-auth.middleware';
import { OnlineStatusService } from './online-status.service';
import { MessagesModule } from '../messages/messages.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => MessagesModule),
    forwardRef(() => NotificationsModule),
  ],
  providers: [
    ChatGateway,
    NotificationsGateway,
    SocketAuthMiddleware,
    OnlineStatusService,
  ],
  exports: [NotificationsGateway, OnlineStatusService],
})
export class GatewaysModule {}
