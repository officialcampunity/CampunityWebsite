import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

const mockMessagesService = {
  getConversations: jest.fn(),
  getUnreadCount: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
};

const makeReq = (userId = 'user-1') => ({ user: { id: userId } }) as any;

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: typeof mockMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: MessagesService, useValue: mockMessagesService },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get(MessagesService);
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should return conversations', async () => {
      const conversations = [{ id: 'user-2', user: { name: 'Other' } }];
      mockMessagesService.getConversations.mockResolvedValue(conversations);

      const result = await controller.getConversations(makeReq());

      expect(mockMessagesService.getConversations).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(conversations);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockMessagesService.getUnreadCount.mockResolvedValue({ count: 3 });

      const result = await controller.getUnreadCount(makeReq());

      expect(mockMessagesService.getUnreadCount).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('getMessages', () => {
    it('should return messages with another user', async () => {
      const messages = { data: [], total: 0, page: 1, limit: 50 };
      mockMessagesService.getMessages.mockResolvedValue(messages);

      const result = await controller.getMessages(makeReq(), 'user-2', 1, 50);

      expect(mockMessagesService.getMessages).toHaveBeenCalledWith('user-1', 'user-2', 1, 50);
      expect(result).toEqual(messages);
    });
  });

  describe('sendMessage', () => {
    it('should send message', async () => {
      const dto = { receiverId: 'user-2', content: 'Hello!' };
      const message = { id: 'm1', content: 'Hello!' };
      mockMessagesService.sendMessage.mockResolvedValue(message);

      const result = await controller.sendMessage(makeReq(), dto);

      expect(mockMessagesService.sendMessage).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(message);
    });
  });
});
