import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LookupService } from './lookup.service';
import { University } from '../entities/university.entity';
import { Course } from '../entities/course.entity';
import { Semester } from '../entities/semester.entity';
import { Subject } from '../entities/subject.entity';
import { ResourceType } from '../entities/resource-type.entity';

const mockUniversitiesRepository = { find: jest.fn() };
const mockCoursesRepository = { find: jest.fn() };
const mockSemestersRepository = { find: jest.fn() };
const mockSubjectsRepository = { find: jest.fn() };
const mockResourceTypesRepository = { find: jest.fn() };

describe('LookupService', () => {
  let service: LookupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LookupService,
        { provide: getRepositoryToken(University), useValue: mockUniversitiesRepository },
        { provide: getRepositoryToken(Course), useValue: mockCoursesRepository },
        { provide: getRepositoryToken(Semester), useValue: mockSemestersRepository },
        { provide: getRepositoryToken(Subject), useValue: mockSubjectsRepository },
        { provide: getRepositoryToken(ResourceType), useValue: mockResourceTypesRepository },
      ],
    }).compile();

    service = module.get<LookupService>(LookupService);
    jest.clearAllMocks();
  });

  describe('getUniversities', () => {
    it('should return universities ordered by name', async () => {
      const universities = [{ id: 'u1', name: 'MIT' }];
      mockUniversitiesRepository.find.mockResolvedValue(universities);

      const result = await service.getUniversities();

      expect(mockUniversitiesRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
      expect(result).toEqual(universities);
    });
  });

  describe('searchCourses', () => {
    it('should search courses by name', async () => {
      const courses = [{ id: 'c1', name: 'Computer Science', university: { id: 'u1', name: 'MIT' } }];
      mockCoursesRepository.find.mockResolvedValue(courses);

      const result = await service.searchCourses('Computer');

      expect(mockCoursesRepository.find).toHaveBeenCalledWith({
        where: { name: expect.any(Object) },
        relations: { university: true },
        order: { name: 'ASC' },
        take: 20,
      });
      expect(result).toEqual(courses);
    });

    it('should return empty when query is empty', async () => {
      const result = await service.searchCourses('');

      expect(result).toEqual([]);
    });
  });

  describe('getCourses', () => {
    it('should return courses with universityId filter', async () => {
      const courses = [{ id: 'c1', name: 'CS' }];
      mockCoursesRepository.find.mockResolvedValue(courses);

      const result = await service.getCourses('u1');

      expect(mockCoursesRepository.find).toHaveBeenCalledWith({
        where: { university: { id: 'u1' } },
        order: { name: 'ASC' },
        relations: { university: true },
      });
      expect(result).toEqual(courses);
    });

    it('should return all courses without filter', async () => {
      const courses = [{ id: 'c1', name: 'CS' }];
      mockCoursesRepository.find.mockResolvedValue(courses);

      const result = await service.getCourses();

      expect(mockCoursesRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { name: 'ASC' },
        relations: { university: true },
      });
      expect(result).toEqual(courses);
    });
  });

  describe('getSemesters', () => {
    it('should return semesters for course', async () => {
      const semesters = [{ id: 's1', name: 'Semester 1' }];
      mockSemestersRepository.find.mockResolvedValue(semesters);

      const result = await service.getSemesters('c1');

      expect(mockSemestersRepository.find).toHaveBeenCalledWith({
        where: { course: { id: 'c1' } },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(semesters);
    });
  });

  describe('getSubjects', () => {
    it('should return subjects for semester', async () => {
      const subjects = [{ id: 'sub1', name: 'Math' }];
      mockSubjectsRepository.find.mockResolvedValue(subjects);

      const result = await service.getSubjects('s1');

      expect(mockSubjectsRepository.find).toHaveBeenCalledWith({
        where: { semester: { id: 's1' } },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(subjects);
    });
  });

  describe('getResourceTypesBySubject', () => {
    it('should return resource types for subject', async () => {
      const types = [{ id: 'rt1', type: 'Note' }];
      mockResourceTypesRepository.find.mockResolvedValue(types);

      const result = await service.getResourceTypesBySubject('sub1');

      expect(mockResourceTypesRepository.find).toHaveBeenCalledWith({
        where: { subject: { id: 'sub1' } },
        order: { type: 'ASC' },
      });
      expect(result).toEqual(types);
    });
  });

  describe('getResourceTypes', () => {
    it('should return all resource types with subject relation', async () => {
      const types = [{ id: 'rt1', type: 'Note', subject: { id: 'sub1', name: 'Math' } }];
      mockResourceTypesRepository.find.mockResolvedValue(types);

      const result = await service.getResourceTypes();

      expect(mockResourceTypesRepository.find).toHaveBeenCalledWith({
        order: { type: 'ASC' },
        relations: { subject: true },
      });
      expect(result).toEqual(types);
    });
  });
});
