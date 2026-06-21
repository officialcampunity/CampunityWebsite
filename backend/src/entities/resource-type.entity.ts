import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Subject } from './subject.entity';
import { Resource } from './resource.entity';

@Entity('resource_types')
export class ResourceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @ManyToOne(() => Subject, subject => subject.resourceTypes)
  @JoinColumn({ name: 'subject_id' })
  @Index()
  subject: Subject;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Resource, resource => resource.resourceType)
  resources: Resource[];
}
