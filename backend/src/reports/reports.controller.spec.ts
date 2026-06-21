import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

const mockReportsService = {
  create: jest.fn(),
  findByReporter: jest.fn(),
};

const makeReq = (userId = 'user-1') => ({ user: { id: userId } }) as any;

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: typeof mockReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get(ReportsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create report', async () => {
      const dto = { reason: 'Inappropriate', resourceId: 'res-1' };
      mockReportsService.create.mockResolvedValue({ id: 'r1' });

      const result = await controller.create(makeReq(), dto as any);

      expect(mockReportsService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({ id: 'r1' });
    });
  });

  describe('findAll', () => {
    it('should return reports by current user', async () => {
      const reports = [{ id: 'r1' }];
      mockReportsService.findByReporter.mockResolvedValue(reports);

      const result = await controller.findAll(makeReq());

      expect(mockReportsService.findByReporter).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(reports);
    });
  });
});
