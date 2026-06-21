import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from '../entities/user.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', name: 'image_url', nullable: true })
  imageUrl: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  @Index()
  author: User;

  @OneToMany(() => PostLike, like => like.post)
  likes: PostLike[];

  @OneToMany(() => PostComment, comment => comment.post)
  comments: PostComment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
