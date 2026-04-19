import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(
    email: string,
    password: string,
    passwordRepeat: string,
  ): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user) {
      throw new BadRequestException("User already exists");
    }
    if (password !== passwordRepeat) {
      throw new BadRequestException("passwords does not match");
    }
    const hash = await this.hashData(password);
    const newUser = await this.usersService.create({ email, password: hash });

    const tokens = await this.getTokens(
      newUser.id,
      newUser.email,
      newUser.roles
    );

    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException();
    }
    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException("Access Denied");

    if (refreshToken !== user.refreshToken)
      throw new ForbiddenException("Access Denied");
    const tokens = await this.getTokens(user.id, user.email, user.roles);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  hashData(data: string, saltRounds = 10): string {
    return bcrypt.hash(data, saltRounds);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.usersService.update(userId, {
      refreshToken: refreshToken,
    });
  }

  async getTokens(userId: string, email: string, roles: string[]) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          roles,
        },
        {
          secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
          expiresIn: "15m",
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          roles,
        },
        {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
          expiresIn: "7d",
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
