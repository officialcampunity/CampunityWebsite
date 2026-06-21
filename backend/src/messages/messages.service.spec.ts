import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

const mockMessagesRepository = {
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUsersRepository = {
  findOne: jest.fn(),
};

const mockNotificationsService = {
  create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(Message), useValue: mockMessagesRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message to existing user', async () => {
      const receiver = { id: 'user-2', displayName: 'Receiver', username: 'receiver' };
      mockUsersRepository.findOne.mockResolvedValue(receiver);
      const message = { id: 'm1', content: 'Hello!', sender: { id: 'user-1' }, receiver };
      mockMessagesRepository.create.mockReturnValue(message);
      mockMessagesRepository.save.mockResolvedValue(message);

      const result = await service.sendMessage('user-1', { receiverId: 'user-2', content: 'Hello!' });

      expect(mockMessagesRepository.save).toHaveBeenCalled();
      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        type: 'message',
        actorId: 'user-1',
        recipientId: 'user-2',
      });
      expect(result).toEqual(message);
    });

    it('should throw NotFoundException when receiver not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.sendMessage('user-1', { receiverId: 'nonexistent', content: 'Hi' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversations', () => {
    it('should group messages by conversation partner', async () => {
      const messages = [
        {
          id: 'm1',
          content: 'Hey',
          sender: { id: 'user-1', displayName: 'Me', username: 'me', avatarUrl: null },
          receiver: { id: 'user-2', displayName: 'Other', username: 'other', avatarUrl: null },
          read: true,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'm2',
          content: 'Reply',
          sender: { id: 'user-2', displayName: 'Other', username: 'other', avatarUrl: null },
          receiver: { id: 'user-1', displayName: 'Me', username: 'me', avatarUrl: null },
          read: false,
          createdAt: new Date('2024-01-01'),
        },
      ];
      mockMessagesRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(messages),
      });

      const result = await service.getConversations('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].user.name).toBe('Other');
      expect(result[0].lastMessage.content).toBe('Hey');
      expect(result[0].unreadCount).toBe(1);
    });

    it('should return empty array when no messages', async () => {
      mockMessagesRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getConversations('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for user', async () => {
      mockMessagesRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toEqual({ count: 5 });
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages between two users', async () => {
      const messages = [
        { id: 'm1', content: 'Hello', sender: { id: 'user-1' }, receiver: { id: 'user-2' } },
        { id: 'm2', content: 'Hi', sender: { id: 'user-2' }, receiver: { id: 'user-1' } },
      ];
      mockMessagesRepository.findAndCount.mockResolvedValue([messages, 2]);

      const result = await service.getMessages('user-1', 'user-2', 1, 50);

      expect(mockMessagesRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          { sender: { id: 'user-1' }, receiver: { id: 'user-2' } },
          { sender: { id: 'user-2' }, receiver: { id: 'user-1' } },
        ],
        relations: { sender: true, receiver: true },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 50,
      });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
