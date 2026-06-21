import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Resource } from '../entities/resource.entity';
import { Report } from '../entities/report.entity';
import { Post } from '../posts/post.entity';
import { Story } from '../stories/story.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
  ) {}

  async getStats() {
    const [users, resources, reports, posts, stories] = await Promise.all([
      this.usersRepository.count(),
      this.resourcesRepository.count(),
      this.reportsRepository.count(),
      this.postsRepository.count(),
      this.storiesRepository.count(),
    ]);
    return { users, resources, reports, posts, stories };
  }

  async getUsers(page: number, limit: number, search?: string) {
    const query = this.usersRepository.createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      query.where(
        'user.displayName ILIKE :search OR user.username ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async updateUserRole(id: string, role: 'user' | 'admin' | 'superadmin') {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.usersRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.usersRepository.remove(user);
  }

  async getResources(page: number, limit: number, search?: string) {
    const query = this.resourcesRepository.createQueryBuilder('resource')
      .leftJoinAndSelect('resource.author', 'author')
      .leftJoinAndSelect('resource.resourceType', 'resourceType')
      .orderBy('resource.createdAt', 'DESC');

    if (search) {
      query.where(
        'resource.title ILIKE :search OR resource.description ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async deleteResource(id: string) {
    const resource = await this.resourcesRepository.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');
    return this.resourcesRepository.remove(resource);
  }

  async getReports(page: number, limit: number) {
    const [data, total] = await this.reportsRepository.findAndCount({
      relations: { reporter: true, resource: true, reportedUser: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async resolveReport(id: string) {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    report.status = 'Resolved';
    return this.reportsRepository.save(report);
  }
}
