import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  mediaUrl: string;

  @IsOptional()
  @IsString()
  mediaType?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
