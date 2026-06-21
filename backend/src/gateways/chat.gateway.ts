import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from './socket-auth.middleware';
import { OnlineStatusService } from './online-status.service';
import { MessagesService } from '../messages/messages.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
  },
  namespace: '/chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private socketAuth: SocketAuthMiddleware,
    private onlineStatus: OnlineStatusService,
    private messagesService: MessagesService,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  handleConnection(client: Socket) {
    const payload = this.socketAuth.verify(client);
    if (!payload) {
      client.disconnect();
      return;
    }

    client.data.userId = payload.sub;
    client.join(`user:${payload.sub}`);
    this.onlineStatus.setOnline(payload.sub, client.id);
    this.server.emit('userOnline', payload.sub);
    this.logger.log(`User ${payload.sub} connected to chat`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.onlineStatus.setOffline(userId, client.id);
      this.server.emit('userOffline', userId);
      this.logger.log(`User ${userId} disconnected from chat`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId = client.data.userId;
    if (!senderId || !data.content?.trim()) return;

    const message = await this.messagesService.sendMessage(senderId, {
      receiverId: data.receiverId,
      content: data.content,
    });

    const fullMessage = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: { sender: true, receiver: true },
    });

    this.server.to(`user:${data.receiverId}`).emit('newMessage', fullMessage);
    client.emit('newMessage', fullMessage);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    client.to(`user:${data.userId}`).emit('typing', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    client.to(`user:${data.userId}`).emit('stopTyping', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    const userId = client.data.userId;
    await this.messagesRepository.update(
      { sender: { id: data.userId }, receiver: { id: userId }, read: false },
      { read: true },
    );
    this.server.to(`user:${data.userId}`).emit('messagesRead', {
      conversationId: data.conversationId,
      readBy: userId,
    });
    const unreadCount = await this.messagesRepository.count({
      where: { receiver: { id: userId }, read: false },
    });
    client.emit('unreadUpdate', { count: unreadCount });
  }
}
