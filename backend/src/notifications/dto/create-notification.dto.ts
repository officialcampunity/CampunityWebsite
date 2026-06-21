import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  type: 'follow' | 'like' | 'comment' | 'message';

  @IsUUID()
  actorId: string;

  @IsUUID()
  recipientId: string;

  @IsUUID()
  @IsOptional()
  resourceId?: string;
}
