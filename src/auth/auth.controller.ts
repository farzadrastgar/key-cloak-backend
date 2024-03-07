import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenGuard } from "./guards/refreshToken.guard";
import { Request } from "express";
import { AccessTokenGuard } from "./guards/accessToken.guard";
import { LocalAuthGuard } from "./guards/local.auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() { email, password, passwordRepeat }: RegisterDto) {
    return this.authService.register(email, password, passwordRepeat);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @UseGuards(RefreshTokenGuard)
  @Get("refresh")
  refreshTokens(@Req() req: Request) {
    const userId = req.user["sub"];
    const refreshToken = req.user["refreshToken"];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get("logout")
  logout(@Req() req: Request) {
    this.authService.logout(req.user["sub"]);
  }
}
