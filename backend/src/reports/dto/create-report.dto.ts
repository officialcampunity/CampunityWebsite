import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  reason: string;

  @IsUUID()
  @IsOptional()
  resourceId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;
}
