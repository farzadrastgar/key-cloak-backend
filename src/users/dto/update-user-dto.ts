import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsString()
  @IsOptional()
  refreshToken: string;

  // ✅ Replace organizations
  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  organizationIds?: string[];
}
