import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class User {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;
}
