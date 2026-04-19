import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user-dto";
import { AccessTokenGuard } from "src/auth/guards/accessToken.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@UseGuards(AccessTokenGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      message: "User created successfully",
      data: user,
    };
  }

  @Get()
  async findAll(@Query("search") search?: string) {
    const users = (await this.usersService.findAll(search)) || [];
    return {
      message: "Users fetched successfully",
      data: users,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findOneById(id);
    return {
      message: "User found successfully",
      data: user,
    };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return {
      message: "User updated successfully",
      data: user,
    };
  }

  @Patch(":id/toggleStatus")
  async activate(@Param("id") id: string) {
    const user = await this.usersService.toggleActive(id);
    return {
      message: "User status toggled successfully",
      data: user,
    };
  }

  @Patch(":id/reset-password")
  async resetPassword(@Param("id") id: string, @Body() body: ResetPasswordDto) {
    await this.usersService.resetPassword(id, body.newPassword);
    return {
      message: "Password reset successfully",
      data: {},
    };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
