import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Course } from './course.entity';
import { Subject } from './subject.entity';

@Entity('semesters')
export class Semester {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Course, course => course.semesters)
  @JoinColumn({ name: 'course_id' })
  @Index()
  course: Course;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Subject, subject => subject.semester)
  subjects: Subject[];
}
