import { IsBoolean, IsOptional } from "class-validator";

export class UpdateMfaSettingsDto {
  @IsOptional()
  @IsBoolean()
  totp?: boolean;

  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  sms?: boolean;
}
