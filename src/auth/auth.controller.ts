import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";

import { RefreshTokenGuard } from "./guards/refreshToken.guard";
import { AccessTokenGuard } from "./guards/accessToken.guard";
import { LocalAuthGuard } from "./guards/local.auth.guard";

interface JwtPayload {
  sub: string;
  refreshToken?: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.email,
      dto.password,
      dto.passwordRepeat,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Req() req: Request) {
    return this.authService.login(req.user as any);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  refreshTokens(@Req() req: Request) {
    const user = req.user as JwtPayload;

    return this.authService.refreshTokens(user.sub, user.refreshToken!);
  }

  @UseGuards(AccessTokenGuard)
  @Post("logout")
  logout(@Req() req: Request) {
    const user = req.user as JwtPayload;

    return this.authService.logout(user.sub);
  }
}
