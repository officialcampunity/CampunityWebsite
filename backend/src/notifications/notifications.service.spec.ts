import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from '../entities/notification.entity';
import { NotificationsGateway } from '../gateways/notifications.gateway';

const mockNotificationsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
};

const mockNotificationsGateway = {
  sendNotification: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockNotificationsRepository },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create notification and send via gateway', async () => {
      const dto = { type: 'follow' as const, actorId: 'user-1', recipientId: 'user-2' };
      const notification = { id: 'n1' };
      mockNotificationsRepository.create.mockReturnValue(notification);
      mockNotificationsRepository.save.mockResolvedValue(notification);
      const fullNotification = { id: 'n1', actor: { id: 'user-1', displayName: 'Actor' } };
      mockNotificationsRepository.findOne.mockResolvedValue(fullNotification);

      const result = await service.create(dto);

      expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
        type: 'follow',
        actor: { id: 'user-1' },
        recipient: { id: 'user-2' },
        resourceId: undefined,
      });
      expect(mockNotificationsRepository.save).toHaveBeenCalledWith(notification);
      expect(mockNotificationsGateway.sendNotification).toHaveBeenCalledWith('user-2', fullNotification);
      expect(result).toEqual(notification);
    });
  });

  describe('findByRecipient', () => {
    it('should return paginated notifications for recipient', async () => {
      const notifications = [{ id: 'n1', type: 'like' }];
      mockNotificationsRepository.findAndCount.mockResolvedValue([notifications, 1]);

      const result = await service.findByRecipient('user-1', 1, 20);

      expect(mockNotificationsRepository.findAndCount).toHaveBeenCalledWith({
        where: { recipient: { id: 'user-1' } },
        relations: { actor: true },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toEqual(notifications);
      expect(result.total).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read when owner', async () => {
      const notification = { id: 'n1', recipient: { id: 'user-1' } };
      mockNotificationsRepository.findOne.mockResolvedValue(notification);
      mockNotificationsRepository.update.mockResolvedValue({ affected: 1 });

      await service.markAsRead('n1', 'user-1');

      expect(mockNotificationsRepository.update).toHaveBeenCalledWith('n1', { read: true });
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockNotificationsRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      const notification = { id: 'n1', recipient: { id: 'user-2' } };
      mockNotificationsRepository.findOne.mockResolvedValue(notification);

      await expect(service.markAsRead('n1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockNotificationsRepository.update.mockResolvedValue({ affected: 5 });

      await service.markAllAsRead('user-1');

      expect(mockNotificationsRepository.update).toHaveBeenCalledWith(
        { recipient: { id: 'user-1' }, read: false },
        { read: true },
      );
    });
  });
});
