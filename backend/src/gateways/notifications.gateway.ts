import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from './socket-auth.middleware';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private socketAuth: SocketAuthMiddleware) {}

  handleConnection(client: Socket) {
    const payload = this.socketAuth.verify(client);
    if (!payload) {
      client.disconnect();
      return;
    }

    client.data.userId = payload.sub;
    client.join(`user:${payload.sub}`);
    this.logger.log(`User ${payload.sub} connected to notifications`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User ${client.data.userId} disconnected from notifications`);
  }

  sendNotification(recipientId: string, notification: any) {
    this.server.to(`user:${recipientId}`).emit('notification', notification);
  }
}
