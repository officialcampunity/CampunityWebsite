import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  async create(dto: CreateReportDto, reporterId: string): Promise<Report> {
    const report = this.reportsRepository.create({
      reason: dto.reason,
      reporter: { id: reporterId } as any,
      resource: dto.resourceId ? { id: dto.resourceId } as any : undefined,
      reportedUser: dto.userId ? { id: dto.userId } as any : undefined,
    });
    return this.reportsRepository.save(report);
  }

  async findByReporter(reporterId: string) {
    return this.reportsRepository.find({
      where: { reporter: { id: reporterId } },
      relations: { resource: true, reportedUser: true },
      order: { createdAt: 'DESC' },
    });
  }
}
