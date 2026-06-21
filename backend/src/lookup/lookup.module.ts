import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';
import { University } from '../entities/university.entity';
import { Course } from '../entities/course.entity';
import { Semester } from '../entities/semester.entity';
import { Subject } from '../entities/subject.entity';
import { ResourceType } from '../entities/resource-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([University, Course, Semester, Subject, ResourceType])],
  controllers: [LookupController],
  providers: [LookupService],
})
export class LookupModule {}
