import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from './user.entity';
import { ResourceType } from './resource-type.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', name: 'cloudinary_url', nullable: true })
  cloudinaryUrl: string | null;

  @Column({ type: 'varchar', name: 'file_type', nullable: true })
  fileType: string | null;

  @ManyToOne(() => User, user => user.resources)
  @JoinColumn({ name: 'author_id' })
  @Index()
  author: User;

  @ManyToOne(() => ResourceType, resourceType => resourceType.resources)
  @JoinColumn({ name: 'resource_type_id' })
  @Index()
  resourceType: ResourceType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Comment, comment => comment.resource)
  comments: Comment[];

  @OneToMany(() => Like, like => like.resource)
  likes: Like[];
}
