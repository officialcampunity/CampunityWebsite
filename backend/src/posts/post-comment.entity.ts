import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../entities/user.entity';
import { Post } from './post.entity';

@Entity('post_comments')
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  @Index()
  author: User;

  @ManyToOne(() => Post, post => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  @Index()
  post: Post;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
