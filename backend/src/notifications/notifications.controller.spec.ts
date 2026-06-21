import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockNotificationsService = {
  findByRecipient: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
};

const makeReq = (userId = 'user-1') => ({ user: { id: userId } }) as any;

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: typeof mockNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const result = { data: [], total: 0, page: 1, limit: 20 };
      mockNotificationsService.findByRecipient.mockResolvedValue(result);

      const response = await controller.findAll(makeReq(), 1, 20);

      expect(mockNotificationsService.findByRecipient).toHaveBeenCalledWith('user-1', 1, 20);
      expect(response).toEqual(result);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const response = await controller.markAsRead('n1', makeReq());

      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith('n1', 'user-1');
      expect(response).toEqual({ success: true });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const response = await controller.markAllAsRead(makeReq());

      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith('user-1');
      expect(response).toEqual({ success: true });
    });
  });
});
