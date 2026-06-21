import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { DataSource } from 'typeorm';
import { University } from './entities/university.entity';
import { Course } from './entities/course.entity';
import { Semester } from './entities/semester.entity';
import { Subject } from './entities/subject.entity';
import { ResourceType } from './entities/resource-type.entity';
import { User } from './entities/user.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const dataSource = app.get(DataSource);

  const users = [
    { email: 'admin@campunity.com', password: 'admin123456', username: 'admin', displayName: 'Admin', role: 'admin' },
    { email: 'test@campunity.com', password: 'test123456', username: 'testuser', displayName: 'Test User', role: 'user' },
    { email: 'jane@campunity.com', password: 'jane123456', username: 'janedoe', displayName: 'Jane Doe', role: 'user' },
  ];

  const registeredUsers: { id: string; email: string }[] = [];
  const userRepo = dataSource.getRepository(User);
  for (const u of users) {
    try {
      const result = await authService.register(u);
      if (u.role === 'admin') {
        await userRepo.update(result.user.id, { role: 'admin' });
      }
      console.log(`✓ Created user: ${u.email} (id: ${result.user.id})`);
      registeredUsers.push({ id: result.user.id, email: u.email });
    } catch (err: any) {
      if (err?.status === 409) {
        console.log(`~ Skipped (exists): ${u.email}`);
      } else {
        console.error(`✗ Failed: ${u.email} — ${err.message}`);
      }
    }
  }

  // Seed Universities
  const uniRepo = dataSource.getRepository(University);
  const universities = [
    { name: 'University of Nairobi' },
    { name: 'Kenyatta University' },
    { name: 'Strathmore University' },
  ];
  const createdUnis: University[] = [];
  for (const u of universities) {
    const existing = await uniRepo.findOneBy({ name: u.name });
    if (existing) {
      createdUnis.push(existing);
      console.log(`~ Skipped (exists): University: ${u.name}`);
    } else {
      const created = await uniRepo.save(uniRepo.create(u));
      createdUnis.push(created);
      console.log(`✓ Created University: ${u.name}`);
    }
  }

  // Seed Courses
  const courseRepo = dataSource.getRepository(Course);
  const coursesData = [
    { name: 'Computer Science', university: createdUnis[0] },
    { name: 'Mathematics', university: createdUnis[0] },
    { name: 'Business IT', university: createdUnis[1] },
    { name: 'Engineering', university: createdUnis[2] },
  ];
  const createdCourses: Course[] = [];
  for (const c of coursesData) {
    const existing = await courseRepo.findOneBy({ name: c.name });
    if (existing) {
      createdCourses.push(existing);
      console.log(`~ Skipped (exists): Course: ${c.name}`);
    } else {
      const created = await courseRepo.save(courseRepo.create(c));
      createdCourses.push(created);
      console.log(`✓ Created Course: ${c.name}`);
    }
  }

  // Seed Semesters
  const semRepo = dataSource.getRepository(Semester);
  const semestersData = [
    { name: 'Year 1', course: createdCourses[0] },
    { name: 'Year 2', course: createdCourses[0] },
    { name: 'Year 3', course: createdCourses[0] },
    { name: 'Year 4', course: createdCourses[0] },
    { name: 'Year 1', course: createdCourses[1] },
    { name: 'Year 2', course: createdCourses[1] },
    { name: 'Year 1', course: createdCourses[2] },
    { name: 'Year 2', course: createdCourses[2] },
    { name: 'Year 1', course: createdCourses[3] },
    { name: 'Year 2', course: createdCourses[3] },
  ];
  const createdSemesters: Semester[] = [];
  for (const s of semestersData) {
    const existing = await semRepo.findOne({
      where: { name: s.name, course: { id: s.course.id } },
    });
    if (existing) {
      createdSemesters.push(existing);
      console.log(`~ Skipped (exists): Semester: ${s.name} (${s.course.name})`);
    } else {
      const created = await semRepo.save(semRepo.create(s));
      createdSemesters.push(created);
      console.log(`✓ Created Semester: ${s.name} (${s.course.name})`);
    }
  }

  // Seed Subjects
  const subRepo = dataSource.getRepository(Subject);
  const subjectsData = [
    { name: 'Data Structures', semester: createdSemesters[0] },
    { name: 'Algorithms', semester: createdSemesters[0] },
    { name: 'Database Systems', semester: createdSemesters[1] },
    { name: 'Calculus I', semester: createdSemesters[4] },
    { name: 'Linear Algebra', semester: createdSemesters[4] },
    { name: 'Networking', semester: createdSemesters[0] },
  ];
  const createdSubjects: Subject[] = [];
  for (const s of subjectsData) {
    const existing = await subRepo.findOneBy({ name: s.name });
    if (existing) {
      createdSubjects.push(existing);
      console.log(`~ Skipped (exists): Subject: ${s.name}`);
    } else {
      const created = await subRepo.save(subRepo.create(s));
      createdSubjects.push(created);
      console.log(`✓ Created Subject: ${s.name}`);
    }
  }

  // Seed ResourceTypes
  const rtRepo = dataSource.getRepository(ResourceType);
  const resourceTypesData = [
    { type: 'Note', subject: createdSubjects[0] },
    { type: 'Past Paper', subject: createdSubjects[0] },
    { type: 'Video', subject: createdSubjects[0] },
    { type: 'Note', subject: createdSubjects[1] },
    { type: 'Past Paper', subject: createdSubjects[1] },
    { type: 'Note', subject: createdSubjects[2] },
    { type: 'Video', subject: createdSubjects[2] },
    { type: 'Note', subject: createdSubjects[3] },
    { type: 'Past Paper', subject: createdSubjects[3] },
    { type: 'Note', subject: createdSubjects[4] },
    { type: 'Video', subject: createdSubjects[5] },
  ];
  for (const r of resourceTypesData) {
    const existing = await rtRepo.findOne({
      where: { type: r.type, subject: { id: r.subject.id } },
    });
    if (existing) {
      console.log(`~ Skipped (exists): ResourceType: ${r.type} (${r.subject.name})`);
    } else {
      await rtRepo.save(rtRepo.create(r));
      console.log(`✓ Created ResourceType: ${r.type} (${r.subject.name})`);
    }
  }

  await app.close();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
