import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { University } from './university.entity';
import { Semester } from './semester.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => University, university => university.courses)
  @JoinColumn({ name: 'university_id' })
  @Index()
  university: University;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Semester, semester => semester.course)
  semesters: Semester[];
}
