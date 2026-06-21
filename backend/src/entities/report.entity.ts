import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Resource } from './resource.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  reason: string;

  @ManyToOne(() => User, user => user.reports)
  @JoinColumn({ name: 'reporter_id' })
  @Index()
  reporter: User;

  @ManyToOne(() => Resource)
  @JoinColumn({ name: 'resource_id' })
  @Index()
  resource: Resource;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_user_id' })
  @Index()
  reportedUser: User;

  @Column({ default: 'Pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
