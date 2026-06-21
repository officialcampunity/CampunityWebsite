import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../entities/user.entity';
import { StoryView } from './story-view.entity';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  mediaUrl: string;

  @Column({ type: 'varchar', default: 'image' })
  mediaType: string;

  @Column({ type: 'varchar', nullable: true })
  caption: string | null;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamp', name: 'scheduled_at', nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_archived' })
  isArchived: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => StoryView, sv => sv.story)
  viewedBy: StoryView[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
