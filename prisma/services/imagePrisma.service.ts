import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ImagePrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(params: { data: { fileName: string; url: string } }) {
    return this.prisma.image.create(params);
  }

  // Don't forget to handle errors and close Prisma connection
  async onClose() {
    await this.prisma.$disconnect();
  }
}
