import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateAuthSettingsDto } from "./dto/update-auth-settings.dto";
import { UpdateMfaSettingsDto } from "./dto/update-mfa-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) { }

  async getAuthSettings() {
    return this.prisma.authSettings.findUnique({
      where: { id: "global" },
    });
  }

  async getMFASettings() {
    return this.prisma.mfaSettings.findUnique({
      where: { id: "global" },
    });
  }

  // UPDATE AUTH SETTINGS
  async updateAuth(dto: UpdateAuthSettingsDto) {
    return this.prisma.authSettings.update({
      where: { id: "global" },
      data: dto,
    });
  }

  // UPDATE MFA SETTINGS
  async updateMfa(dto: UpdateMfaSettingsDto) {
    return this.prisma.mfaSettings.update({
      where: { id: "global" },
      data: dto,
    });
  }
}
