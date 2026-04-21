import { Controller, Get, Body, UseGuards, Put } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { UpdateAuthSettingsDto } from "./dto/update-auth-settings.dto";
import { UpdateMfaSettingsDto } from "./dto/update-mfa-settings.dto";
import { AccessTokenGuard } from "src/auth/guards/accessToken.guard";

@UseGuards(AccessTokenGuard)
@Controller("settings")
export class SettingsController {
  constructor(private readonly service: SettingsService) { }

  // GET BOTH
  @Get("auth")
  getAuthSettings() {
    return this.service.getAuthSettings();
  }

  @Get("mfa")
  getMFASettings() {
    return this.service.getMFASettings();
  }

  // UPDATE AUTH
  @Put("auth")
  updateAuth(@Body() dto: UpdateAuthSettingsDto) {
    return this.service.updateAuth(dto);
  }

  // UPDATE MFA
  @Put("mfa")
  updateMfa(@Body() dto: UpdateMfaSettingsDto) {
    return this.service.updateMfa(dto);
  }
}
