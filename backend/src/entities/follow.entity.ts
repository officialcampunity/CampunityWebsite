import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique(['follower', 'following'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.followers)
  @JoinColumn({ name: 'follower_id' })
  @Index()
  follower: User;

  @ManyToOne(() => User, user => user.following)
  @JoinColumn({ name: 'following_id' })
  @Index()
  following: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
