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
  username: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  organizationIds?: string[];
}
