import { Injectable } from '@nestjs/common';
import { ImagePrismaService } from 'prisma/services/imagePrisma.service';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: ImagePrismaService) {}

  async create({ fileName, url }) {
    return this.prisma.create({
      data: { fileName, url },
    });
  }
}
