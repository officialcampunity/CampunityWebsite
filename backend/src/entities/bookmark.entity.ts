import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from './user.entity';
import { Resource } from './resource.entity';

@Entity('bookmarks')
@Unique(['user', 'resource'])
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  @Index()
  resource: Resource;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
