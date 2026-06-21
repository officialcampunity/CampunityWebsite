import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { University } from '../entities/university.entity';
import { Course } from '../entities/course.entity';
import { Semester } from '../entities/semester.entity';
import { Subject } from '../entities/subject.entity';
import { ResourceType } from '../entities/resource-type.entity';

@Injectable()
export class LookupService {
  constructor(
    @InjectRepository(University)
    private universitiesRepository: Repository<University>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(Semester)
    private semestersRepository: Repository<Semester>,
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
    @InjectRepository(ResourceType)
    private resourceTypesRepository: Repository<ResourceType>,
  ) {}

  async getUniversities(): Promise<University[]> {
    return this.universitiesRepository.find({ order: { name: 'ASC' } });
  }

  async searchCourses(q: string): Promise<Course[]> {
    if (!q?.trim()) return [];
    return this.coursesRepository.find({
      where: { name: ILike(`%${q}%`) },
      relations: { university: true },
      order: { name: 'ASC' },
      take: 20,
    });
  }

  async getCourses(universityId?: string): Promise<Course[]> {
    const where = universityId ? { university: { id: universityId } } : {};
    return this.coursesRepository.find({ where, order: { name: 'ASC' }, relations: { university: true } });
  }

  async getSemesters(courseId: string): Promise<Semester[]> {
    return this.semestersRepository.find({
      where: { course: { id: courseId } },
      order: { name: 'ASC' },
    });
  }

  async getSubjects(semesterId: string): Promise<Subject[]> {
    return this.subjectsRepository.find({
      where: { semester: { id: semesterId } },
      order: { name: 'ASC' },
    });
  }

  async getResourceTypesBySubject(subjectId: string): Promise<ResourceType[]> {
    return this.resourceTypesRepository.find({
      where: { subject: { id: subjectId } },
      order: { type: 'ASC' },
    });
  }

  async getResourceTypes(): Promise<ResourceType[]> {
    return this.resourceTypesRepository.find({ order: { type: 'ASC' }, relations: { subject: true } });
  }
}
