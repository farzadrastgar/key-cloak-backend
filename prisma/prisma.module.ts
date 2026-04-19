import { Module } from "@nestjs/common";
import { UserPrismaService } from "./services/userPrisma.service";

@Module({
  providers: [UserPrismaService],
  exports: [UserPrismaService],
})
export class PrismaModule { }
