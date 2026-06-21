import { Injectable, ForbiddenException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { paginate, PaginatedResult } from '../common/utils/pagination';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      type: dto.type,
      actor: { id: dto.actorId } as any,
      recipient: { id: dto.recipientId } as any,
      resourceId: dto.resourceId,
    });
    const saved = await this.notificationsRepository.save(notification);
    const full = await this.notificationsRepository.findOne({
      where: { id: saved.id },
      relations: { actor: true },
    });
    if (full) {
      this.notificationsGateway.sendNotification(dto.recipientId, full);
    }
    return saved;
  }

  async findByRecipient(recipientId: string, page = 1, limit = 20): Promise<PaginatedResult<Notification>> {
    const [data, total] = await this.notificationsRepository.findAndCount({
      where: { recipient: { id: recipientId } },
      relations: { actor: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: { recipient: true },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.recipient.id !== userId) {
      throw new ForbiddenException('Cannot mark another user\'s notification as read');
    }
    await this.notificationsRepository.update(id, { read: true });
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.notificationsRepository.update(
      { recipient: { id: recipientId }, read: false },
      { read: true },
    );
  }
}
