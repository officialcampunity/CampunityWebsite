import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from './user.entity';
import { Resource } from './resource.entity';

@Entity('likes')
@Unique(['user', 'resource'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.likes)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Resource, resource => resource.likes)
  @JoinColumn({ name: 'resource_id' })
  @Index()
  resource: Resource;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
