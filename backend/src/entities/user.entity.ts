import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Resource } from './resource.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { Message } from './message.entity';
import { Follow } from './follow.entity';
import { BlockedUser } from './blocked-user.entity';
import { Report } from './report.entity';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', name: 'google_id', unique: true, nullable: true })
  googleId: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'varchar', nullable: true })
  bio: string;

  @Column({ type: 'varchar', default: 'user' })
  role: 'user' | 'admin' | 'superadmin';

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', name: 'verification_token', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'varchar', name: 'reset_token', nullable: true })
  resetToken: string | null;

  @Column({ type: 'timestamp', name: 'reset_token_expiry', nullable: true })
  resetTokenExpiry: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Resource, resource => resource.author)
  resources: Resource[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Follow, follow => follow.follower)
  followers: Follow[];

  @OneToMany(() => Follow, follow => follow.following)
  following: Follow[];

  @OneToMany(() => Report, report => report.reporter)
  reports: Report[];

  @OneToMany(() => Notification, notification => notification.recipient)
  notifications: Notification[];

  @OneToMany(() => Notification, notification => notification.actor)
  actedNotifications: Notification[];

  @OneToMany(() => BlockedUser, blockedUser => blockedUser.blocker)
  blockedUsers: BlockedUser[];

  @OneToMany(() => BlockedUser, blockedUser => blockedUser.blocked)
  blockedBy: BlockedUser[];
}
