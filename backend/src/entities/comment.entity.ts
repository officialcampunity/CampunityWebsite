import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Resource } from './resource.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'author_id' })
  @Index()
  author: User;

  @ManyToOne(() => Resource, resource => resource.comments)
  @JoinColumn({ name: 'resource_id' })
  @Index()
  resource: Resource;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
