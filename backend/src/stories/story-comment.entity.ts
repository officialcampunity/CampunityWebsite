import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../entities/user.entity';
import { Story } from './story.entity';

@Entity('story_comments')
export class StoryComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  @Index()
  author: User;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  @Index()
  story: Story;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
