import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginatedResult, paginate, paginationParams } from '../common/utils/pagination';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    @InjectRepository(BlockedUser)
    private blockedUsersRepository: Repository<BlockedUser>,
    private notificationsService: NotificationsService,
  ) {}

  async findById(id: string, currentUserId?: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        resources: true,
        followers: true,
        following: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let isFollowing = false;
    let isBlocked = false;

    if (currentUserId && currentUserId !== id) {
      const follow = await this.followsRepository.findOne({
        where: { follower: { id: currentUserId }, following: { id } },
      });
      isFollowing = !!follow;

      const block = await this.blockedUsersRepository.findOne({
        where: { blocker: { id: currentUserId }, blocked: { id } },
      });
      isBlocked = !!block;
    }

    const { resources, followers, following, ...userData } = user;
    return {
      ...userData,
      isFollowing,
      isBlocked,
      _count: {
        resources: resources?.length ?? 0,
        followers: followers?.length ?? 0,
        following: following?.length ?? 0,
      },
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: [
        { email: userData.email },
        { username: userData.username },
      ],
    });
    if (existing) {
      throw new ConflictException('Email or username already exists');
    }
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }
    const following = await this.findById(followingId);
    const existing = await this.followsRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });
    if (existing) {
      throw new ConflictException('Already following this user');
    }
    const follow = this.followsRepository.create({
      follower: { id: followerId } as User,
      following: { id: following.id } as User,
    });
    await this.followsRepository.save(follow);
    await this.notificationsService.create({
      type: 'follow',
      actorId: followerId,
      recipientId: followingId,
    }).catch(() => {});
  }

  async getSuggested(userId?: string): Promise<User[]> {
    if (userId) {
      const follows = await this.followsRepository.find({
        where: { follower: { id: userId } },
        relations: { following: true },
      });
      const followingIds = follows.map(f => f.following.id);
      const excludeIds = [userId, ...followingIds];
      return this.usersRepository.find({
        where: { id: Not(In(excludeIds)) },
        take: 5,
        order: { createdAt: 'DESC' },
      });
    }
    return this.usersRepository.find({ take: 5, order: { createdAt: 'DESC' } });
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followsRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });
    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }
    await this.followsRepository.remove(follow);
  }

  async getFollowers(userId: string, currentUserId?: string, page = 1, limit = 20): Promise<any> {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { following: { id: userId } },
      relations: { follower: true },
      ...paginationParams(page, limit),
    });
    const users = follows.map(f => f.follower);

    const enriched = await this.enrichUsers(users, currentUserId);
    return paginate(enriched, total, page, limit);
  }

  async search(q: string, page = 1, limit = 20): Promise<PaginatedResult<User>> {
    if (!q?.trim()) return paginate([], 0, page, limit);
    const [data, total] = await this.usersRepository.findAndCount({
      where: [
        { displayName: ILike(`%${q}%`) },
        { username: ILike(`%${q}%`) },
      ],
      order: { displayName: 'ASC' },
      ...paginationParams(page, limit),
    });
    return paginate(data, total, page, limit);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.usersRepository.delete(id);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { verificationToken: token } });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async block(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) throw new ConflictException('Cannot block yourself');
    await this.findById(blockedId);
    const existing = await this.blockedUsersRepository.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });
    if (existing) throw new ConflictException('User already blocked');
    const block = this.blockedUsersRepository.create({
      blocker: { id: blockerId } as User,
      blocked: { id: blockedId } as User,
    });
    await this.blockedUsersRepository.save(block);
    await this.unfollow(blockerId, blockedId).catch(() => {});
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    const block = await this.blockedUsersRepository.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });
    if (!block) throw new NotFoundException('Block relationship not found');
    await this.blockedUsersRepository.remove(block);
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const blocks = await this.blockedUsersRepository.find({
      where: { blocker: { id: userId } },
      relations: { blocked: true },
    });
    return blocks.map(b => b.blocked);
  }

  async getFollowing(userId: string, currentUserId?: string, page = 1, limit = 20): Promise<any> {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { follower: { id: userId } },
      relations: { following: true },
      ...paginationParams(page, limit),
    });
    const users = follows.map(f => f.following);

    const enriched = await this.enrichUsers(users, currentUserId);
    return paginate(enriched, total, page, limit);
  }

  private async enrichUsers(users: User[], currentUserId?: string): Promise<any[]> {
    if (!currentUserId) return users;

    const followingIds = users.map(u => u.id);
    const follows = await this.followsRepository.find({
      where: followingIds.map(fId => ({ follower: { id: currentUserId }, following: { id: fId } })),
    });
    const followSet = new Set(follows.map(f => f.following.id));

    return users.map(u => ({
      ...u,
      isFollowing: followSet.has(u.id),
    }));
  }
}
