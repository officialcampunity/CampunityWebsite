import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Report } from '../entities/report.entity';

const mockReportsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Report), useValue: mockReportsRepository },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create report for resource', async () => {
      const dto = { reason: 'Inappropriate', resourceId: 'res-1', userId: undefined as string | undefined };
      const report = { id: 'r1' };
      mockReportsRepository.create.mockReturnValue(report);
      mockReportsRepository.save.mockResolvedValue(report);

      const result = await service.create(dto as any, 'user-1');

      expect(mockReportsRepository.create).toHaveBeenCalledWith({
        reason: 'Inappropriate',
        reporter: { id: 'user-1' },
        resource: { id: 'res-1' },
        reportedUser: undefined,
      });
      expect(mockReportsRepository.save).toHaveBeenCalledWith(report);
      expect(result).toEqual(report);
    });

    it('should create report for user', async () => {
      const dto = { reason: 'Harassment', userId: 'user-2' };
      const report = { id: 'r2' };
      mockReportsRepository.create.mockReturnValue(report);
      mockReportsRepository.save.mockResolvedValue(report);

      const result = await service.create(dto as any, 'user-1');

      expect(mockReportsRepository.create).toHaveBeenCalledWith({
        reason: 'Harassment',
        reporter: { id: 'user-1' },
        resource: undefined,
        reportedUser: { id: 'user-2' },
      });
      expect(result).toEqual(report);
    });

    it('should create report without specific item', async () => {
      const dto = { reason: 'Other' };
      const report = { id: 'r3' };
      mockReportsRepository.create.mockReturnValue(report);
      mockReportsRepository.save.mockResolvedValue(report);

      const result = await service.create(dto as any, 'user-1');

      expect(result).toEqual(report);
    });
  });

  describe('findByReporter', () => {
    it('should return reports by reporter', async () => {
      const reports = [{ id: 'r1', reason: 'Spam' }];
      mockReportsRepository.find.mockResolvedValue(reports);

      const result = await service.findByReporter('user-1');

      expect(mockReportsRepository.find).toHaveBeenCalledWith({
        where: { reporter: { id: 'user-1' } },
        relations: { resource: true, reportedUser: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(reports);
    });
  });
});
