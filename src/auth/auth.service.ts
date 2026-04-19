import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { TokenService } from "./services/token.service";
import { PasswordService } from "./services/password.service";
import { User } from "@prisma/client";
import { AuthTokens } from "./dto/auth-tokens.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);
    if (!user) return null;

    const isValid = await this.passwordService.compare(password, user.password);

    if (!isValid) return null;

    return user;
  }

  async register(
    email: string,
    password: string,
    passwordRepeat: string,
  ): Promise<AuthTokens> {
    const existingUser = await this.usersService.findOne(email);

    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    if (password !== passwordRepeat) {
      throw new BadRequestException("Passwords do not match");
    }

    const hashedPassword = await this.passwordService.hash(password);

    const newUser = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    return this.issueTokens(newUser);
  }

  async login(user: User): Promise<AuthTokens> {
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueTokens(user);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException("Access Denied");
    }

    const isValid = await this.passwordService.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isValid) {
      throw new ForbiddenException("Access Denied");
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.update(userId, {
      refreshToken: null,
    });

    return { message: "User logged out successfully" };
  }

  // ------------------------
  // Internal helper
  // ------------------------
  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const tokens = await this.tokenService.generateTokens(payload);

    const hashedRefreshToken = await this.passwordService.hash(
      tokens.refreshToken,
    );

    await this.usersService.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return tokens;
  }
}
