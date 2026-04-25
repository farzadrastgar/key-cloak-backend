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

  async findAuthUserById(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        active: true,
        phoneNumber: true,
        memberships: {
          select: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  // ✅ Create user with optional organization assignment
  async create(data: CreateUserDto & { organizationIds?: string[] }) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException("Username or email already taken");
    }

    const hashedPassword = data.password
      ? await this.passwordService.hash(data.password)
      : null;

    // ✅ Step 1: create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        phoneNumber: data.phoneNumber,

        password: hashedPassword,
      },
    });

    // ✅ Step 2: create memberships (if provided)
    if (data.organizationIds && data.organizationIds.length > 0) {
      const membershipsData = data.organizationIds.map((orgId) => ({
        userId: user.id,
        organizationId: orgId,
      }));

      await this.prisma.membership.createMany({
        data: membershipsData,
        skipDuplicates: true, // avoids duplicate errors
      });
    }

    // ✅ Step 3: return user with organizations
    const result = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    return result;
  }

  // ✅ List + search + include organizations
  async findAll(search?: string): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({
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
        phoneNumber: true,
        memberships: {
          select: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ flatten organizations
    return users.map((user) => ({
      ...user,
      organizations: user.memberships.map((m) => m.organization),
    }));
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
        ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
        ...(data.refreshToken !== undefined && {
          refreshToken: data.refreshToken,
        }),

        ...(data.organizationIds && {
          memberships: {
            deleteMany: {
              organizationId: {
                notIn: data.organizationIds,
              },
            },
            createMany: {
              data: data.organizationIds.map((orgId) => ({
                organizationId: orgId,
              })),
              skipDuplicates: true,
            },
          },
        }),
      },
    });
  }
  // ✅ Delete user
  async remove(id: string) {
    await this.findOneById(id);

    await this.prisma.membership.deleteMany({
      where: { userId: id },
    });

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
