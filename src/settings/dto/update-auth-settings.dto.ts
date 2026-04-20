import { IsBoolean, IsOptional } from "class-validator";

export class UpdateAuthSettingsDto {
  @IsOptional()
  @IsBoolean()
  password?: boolean;

  @IsOptional()
  @IsBoolean()
  passkeys?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPasscode?: boolean;

  @IsOptional()
  @IsBoolean()
  mobile?: boolean;
}
