import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CharacterPrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(character) {
    return await this.prisma.character.create(character);
  }

  async findAll(query) {
    return await this.prisma.character.findMany(query);
  }

  async update(query) {
    return await this.prisma.character.update(query);
  }

  async delete(query) {
    return await this.prisma.character.delete(query);
  }

  // Don't forget to handle errors and close Prisma connection
  async onClose() {
    await this.prisma.$disconnect();
  }
}
