import { Injectable, NotFoundException } from "@nestjs/common";
import * as _ from "lodash";
import { UpdateUserDto } from "./dto/update-user-dto";
import { UserPrismaService } from "prisma/services/userPrisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: UserPrismaService) {}

  async create({ email, password }) {
    const createdUser = await this.prisma.userCreate({
      data: { email, password },
    });
    return _.omit(createdUser, "password");
  }

  async findOne(email: string): Promise<User> {
    return this.prisma.userFindUniqueEmail({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.userFindUniqueId({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.userFindUniqueId({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return this.prisma.userUpdate({
      where: { id },
      data: updateUserDto,
    });
  }
}
