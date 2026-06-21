import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'follow' | 'like' | 'comment' | 'message';

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  @Index()
  actor: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  @Index()
  recipient: User;

  @Column({ type: 'text', nullable: true })
  resourceId: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
