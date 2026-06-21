import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, user => user.sentMessages)
  @JoinColumn({ name: 'sender_id' })
  @Index()
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages)
  @JoinColumn({ name: 'receiver_id' })
  @Index()
  receiver: User;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
