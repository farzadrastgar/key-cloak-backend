import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  // NotFoundException,
  // BadRequestException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user-dto";
import { PrismaService } from "../../prisma/prisma.service";
import { User } from "@prisma/client";
import { PasswordService } from "src/auth/services/password.service";
import { SafeUser } from "./types/safeUser.type";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) { }

  async findOneByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  // ✅ Create user with optional organization assignment
  async create(data: CreateUserDto & { organizationIds?: string[] }) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (user) {
      throw new ConflictException("Username or email already taken");
    }

    const hashedPassword = data.password
      ? await this.passwordService.hash(data.password)
      : null;
    return this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        password: hashedPassword,

        // 👇 connect organizations if provided
        organizations: data.organizationIds
          ? {
            connect: data.organizationIds.map((id) => ({
              id,
            })),
          }
          : undefined,
      },
      include: {
        organizations: true, // optional: return them in response
      },
    });
  }

  // ✅ List + search + include organizations
  async findAll(search?: string): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      where: search
        ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        }
        : {},
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        active: true,
        organizations: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: string,
    data: UpdateUserDto & { organizationIds?: string[] },
  ) {
    await this.findOneById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.refreshToken !== undefined && {
          refreshToken: data.refreshToken,
        }),
      },
    });
  }

  // ✅ Delete user
  async remove(id: string) {
    await this.findOneById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  // ✅ Activate / deactivate
  async toggleActive(id: string) {
    const user = await this.findOneById(id);
    return this.prisma.user.update({
      where: { id },
      data: { active: !user.active },
    });
  }

  // ✅ Reset password (realistic)
  async resetPassword(id: string, newPassword: string) {
    await this.findOneById(id);

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException("Password too short");
    }
    const hashedPassword = await this.passwordService.hash(newPassword);

    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
