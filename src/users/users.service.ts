import {
  Injectable,
  NotFoundException,
  // NotFoundException,
  // BadRequestException,
} from "@nestjs/common";
// import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user-dto";
// import * as bcrypt from "bcrypt";
// import { UserPrismaService } from "prisma/services/userPrisma.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  // ✅ Create user with optional organization assignment
  // async create(data: CreateUserDto & { organizationIds?: string[] }) {
  //   const hashedPassword = await bcrypt.hash(data.password, 10);

  //   return this.prisma.user.create({
  //     data: {
  //       email: data.email,
  //       username: data.username,
  //       password: hashedPassword,
  //       firstName: data.firstName,
  //       lastName: data.lastName,

  //       organizations: data.organizationIds
  //         ? {
  //             create: data.organizationIds.map((orgId) => ({
  //               organization: {
  //                 connect: { id: orgId },
  //               },
  //             })),
  //           }
  //         : undefined,
  //     },
  //     include: {
  //       organizations: {
  //         include: { organization: true },
  //       },
  //     },
  //   });
  // }

  // ✅ List + search + include organizations
  async findAll(search?: string) {
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

  // // ✅ Delete user
  // async remove(id: string) {
  //   await this.findOne(id);

  //   return this.prisma.user.delete({
  //     where: { id },
  //   });
  // }

  // // ✅ Activate / deactivate
  // async toggleActive(id: string, isActive: boolean) {
  //   return this.prisma.user.update({
  //     where: { id },
  //     data: { isActive },
  //   });
  // }

  // // ✅ Reset password (realistic)
  // async resetPassword(id: string, newPassword: string) {
  //   if (!newPassword || newPassword.length < 6) {
  //     throw new BadRequestException("Password too short");
  //   }

  //   const hashedPassword = await bcrypt.hash(newPassword, 10);

  //   return this.prisma.user.update({
  //     where: { id },
  //     data: { password: hashedPassword },
  //   });
  // }
}
