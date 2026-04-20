import { Controller, Get, Patch, Body } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { UpdateAuthSettingsDto } from "./dto/update-auth-settings.dto";
import { UpdateMfaSettingsDto } from "./dto/update-mfa-settings.dto";

@Controller("settings")
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  // GET BOTH
  @Get()
  getSettings() {
    return this.service.getSettings();
  }

  // UPDATE AUTH
  @Patch("auth")
  updateAuth(@Body() dto: UpdateAuthSettingsDto) {
    return this.service.updateAuth(dto);
  }

  // UPDATE MFA
  @Patch("mfa")
  updateMfa(@Body() dto: UpdateMfaSettingsDto) {
    return this.service.updateMfa(dto);
  }
}
