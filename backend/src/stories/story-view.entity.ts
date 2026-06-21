import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Story } from './story.entity';
import { User } from '../entities/user.entity';

@Entity('story_views')
@Unique(['story', 'viewer'])
export class StoryView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Story, story => story.viewedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  @Index()
  story: Story;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewer_id' })
  viewer: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
