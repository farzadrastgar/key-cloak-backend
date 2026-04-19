import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  IsUUID,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  // ✅ Assign organizations on create
  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  organizationIds?: string[];
}
