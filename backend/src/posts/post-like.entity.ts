import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from '../entities/user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
@Unique(['user', 'post'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Post, post => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @Index()
  post: Post;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
