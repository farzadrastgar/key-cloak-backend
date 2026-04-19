import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaModule } from "prisma/prisma.module";
import { UsersController } from "./users.controller";
import { PasswordService } from "src/auth/services/password.service";

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}
