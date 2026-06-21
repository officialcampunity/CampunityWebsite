import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Semester } from './semester.entity';
import { ResourceType } from './resource-type.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Semester, semester => semester.subjects)
  @JoinColumn({ name: 'semester_id' })
  @Index()
  semester: Semester;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ResourceType, resourceType => resourceType.subject)
  resourceTypes: ResourceType[];
}
