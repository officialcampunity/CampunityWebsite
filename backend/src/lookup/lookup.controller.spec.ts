import { Test, TestingModule } from '@nestjs/testing';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';

const mockLookupService = {
  getUniversities: jest.fn(),
  searchCourses: jest.fn(),
  getCourses: jest.fn(),
  getSemesters: jest.fn(),
  getSubjects: jest.fn(),
  getResourceTypesBySubject: jest.fn(),
  getResourceTypes: jest.fn(),
};

describe('LookupController', () => {
  let controller: LookupController;
  let service: typeof mockLookupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LookupController],
      providers: [
        { provide: LookupService, useValue: mockLookupService },
      ],
    }).compile();

    controller = module.get<LookupController>(LookupController);
    service = module.get(LookupService);
    jest.clearAllMocks();
  });

  it('getUniversities', async () => {
    const data = [{ id: 'u1', name: 'MIT' }];
    mockLookupService.getUniversities.mockResolvedValue(data);
    expect(await controller.getUniversities()).toEqual(data);
  });

  it('searchCourses', async () => {
    const data = [{ id: 'c1', name: 'CS' }];
    mockLookupService.searchCourses.mockResolvedValue(data);
    expect(await controller.searchCourses('CS')).toEqual(data);
    expect(mockLookupService.searchCourses).toHaveBeenCalledWith('CS');
  });

  it('getCourses', async () => {
    const data = [{ id: 'c1', name: 'CS' }];
    mockLookupService.getCourses.mockResolvedValue(data);
    expect(await controller.getCourses('u1')).toEqual(data);
    expect(mockLookupService.getCourses).toHaveBeenCalledWith('u1');
  });

  it('getCourses without universityId', async () => {
    const data = [{ id: 'c1', name: 'CS' }];
    mockLookupService.getCourses.mockResolvedValue(data);
    expect(await controller.getCourses(undefined)).toEqual(data);
    expect(mockLookupService.getCourses).toHaveBeenCalledWith(undefined);
  });

  it('getSemesters', async () => {
    const data = [{ id: 's1', name: 'S1' }];
    mockLookupService.getSemesters.mockResolvedValue(data);
    expect(await controller.getSemesters('c1')).toEqual(data);
    expect(mockLookupService.getSemesters).toHaveBeenCalledWith('c1');
  });

  it('getSubjects', async () => {
    const data = [{ id: 'sub1', name: 'Math' }];
    mockLookupService.getSubjects.mockResolvedValue(data);
    expect(await controller.getSubjects('s1')).toEqual(data);
    expect(mockLookupService.getSubjects).toHaveBeenCalledWith('s1');
  });

  it('getResourceTypesBySubject', async () => {
    const data = [{ id: 'rt1', type: 'Note' }];
    mockLookupService.getResourceTypesBySubject.mockResolvedValue(data);
    expect(await controller.getResourceTypesBySubject('sub1')).toEqual(data);
    expect(mockLookupService.getResourceTypesBySubject).toHaveBeenCalledWith('sub1');
  });

  it('getResourceTypes', async () => {
    const data = [{ id: 'rt1', type: 'Note' }];
    mockLookupService.getResourceTypes.mockResolvedValue(data);
    expect(await controller.getResourceTypes()).toEqual(data);
  });
});
