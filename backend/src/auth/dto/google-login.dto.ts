import { IsString, IsOptional } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  googleId: string;

  @IsString()
  email: string;

  @IsString()
  username: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
