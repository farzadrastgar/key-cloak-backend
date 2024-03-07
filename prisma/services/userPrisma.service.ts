import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';

@Injectable()
export class UserPrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Optionally, add additional methods here to interact with Prisma
  // For example, methods to perform CRUD operations on your data models

  async userCreate(params: { data: { email: string; password: string } }) {
    return this.prisma.user.create(params);
  }

  async userFindUniqueEmail(params: { where: { email: string } }) {
    return this.prisma.user.findUnique(params);
  }

  async userFindUniqueId(params: { where: { id: string } }) {
    return this.prisma.user.findUnique(params);
  }

  async userUpdate(params: { where: { id }; data: UpdateUserDto }) {
    return this.prisma.user.update(params);
  }

  // Don't forget to handle errors and close Prisma connection
  async onClose() {
    await this.prisma.$disconnect();
  }
}
