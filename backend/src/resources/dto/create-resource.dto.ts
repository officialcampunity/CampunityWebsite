import { IsString, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  cloudinaryUrl?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  resourceTypeId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;
}
