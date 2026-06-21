import { Controller, Get, Param, Query } from '@nestjs/common';
import { LookupService } from './lookup.service';

@Controller()
export class LookupController {
  constructor(private lookupService: LookupService) {}

  @Get('universities')
  async getUniversities() {
    return this.lookupService.getUniversities();
  }

  @Get('courses/search')
  async searchCourses(@Query('q') q: string) {
    return this.lookupService.searchCourses(q);
  }

  @Get('courses')
  async getCourses(@Query('universityId') universityId?: string) {
    return this.lookupService.getCourses(universityId);
  }

  @Get('courses/:courseId/semesters')
  async getSemesters(@Param('courseId') courseId: string) {
    return this.lookupService.getSemesters(courseId);
  }

  @Get('semesters/:semesterId/subjects')
  async getSubjects(@Param('semesterId') semesterId: string) {
    return this.lookupService.getSubjects(semesterId);
  }

  @Get('subjects/:subjectId/resource-types')
  async getResourceTypesBySubject(@Param('subjectId') subjectId: string) {
    return this.lookupService.getResourceTypesBySubject(subjectId);
  }

  @Get('resource-types')
  async getResourceTypes() {
    return this.lookupService.getResourceTypes();
  }
}
