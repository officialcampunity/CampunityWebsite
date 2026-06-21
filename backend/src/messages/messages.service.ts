import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { paginate, PaginatedResult } from '../common/utils/pagination';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async getConversations(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('(message.sender_id = :userId OR message.receiver_id = :userId)', { userId })
      .andWhere('message.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .orderBy('message.created_at', 'DESC')
      .getMany();

    const conversationMap = new Map<string, { user: User; lastMessage: Message }>();
    const unreadCounts = new Map<string, number>();
    for (const msg of messages) {
      const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, { user: otherUser, lastMessage: msg });
      }
      if (msg.sender.id !== userId && !msg.read) {
        unreadCounts.set(otherUser.id, (unreadCounts.get(otherUser.id) || 0) + 1);
      }
    }

    return Array.from(conversationMap.entries()).map(([id, conv]) => ({
      id,
      user: {
        id: conv.user.id,
        name: conv.user.displayName,
        username: conv.user.username,
        avatar: conv.user.avatarUrl || '',
      },
      lastMessage: {
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
        isRead: conv.lastMessage.read,
      },
      unreadCount: unreadCounts.get(id) || 0,
    }));
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.messagesRepository.count({
      where: { receiver: { id: userId }, read: false },
    });
    return { count };
  }

  async getMessages(userId: string, otherUserId: string, page = 1, limit = 50): Promise<PaginatedResult<Message>> {
    const [data, total] = await this.messagesRepository.findAndCount({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } },
      ],
      relations: { sender: true, receiver: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data.reverse(), total, page, limit);
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const receiver = await this.usersRepository.findOne({ where: { id: dto.receiverId } });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }
    const message = this.messagesRepository.create({
      content: dto.content,
      sender: { id: senderId } as User,
      receiver: { id: dto.receiverId } as User,
    });
    const saved = await this.messagesRepository.save(message);
    await this.notificationsService.create({
      type: 'message',
      actorId: senderId,
      recipientId: dto.receiverId,
    }).catch(() => {});
    return saved;
  }
}
