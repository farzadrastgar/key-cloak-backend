import { Module } from '@nestjs/common';
import { UserPrismaService } from './services/userPrisma.service';
import { CharacterPrismaService } from './services/characterPrisma.service';
import { ImagePrismaService } from './services/imagePrisma.service';

@Module({
  providers: [UserPrismaService, CharacterPrismaService, ImagePrismaService],
  exports: [UserPrismaService, CharacterPrismaService, ImagePrismaService],
})
export class PrismaModule {}
