import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CharacterService } from "./character.service";
import { AccessTokenGuard } from "src/auth/guards/accessToken.guard";
import { CreateCharacterDto } from "./dto/create-character.dto";
import { UpdateCharacterDto } from "./dto/update-character.dto";

@Controller("character")
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() createCharacterDto: CreateCharacterDto) {
    try {
      let result = await this.characterService.create(createCharacterDto);
      return { message: "Character created successfully", result };
    } catch (error) {
      // Handle the error gracefully
      console.error("Error creating character:", error);
      // Return an appropriate response to the client
      throw new HttpException(
        "Failed to create character. Please try again later.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(
    @Query("id", new ParseIntPipe({ optional: true })) id?: number,
    @Query("name") name?: string,
    @Query("species") species?: string
  ) {
    try {
      let result = await this.characterService.findAll({ id, name, species });
      return { message: "Query executed successfully", result };
    } catch (error) {
      console.error("Error creating character:", error);
      throw new HttpException(
        "Failed to fetch character. Please try again later.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(AccessTokenGuard)
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCharacterDto: UpdateCharacterDto
  ) {
    try {
      let result = await this.characterService.update(id, updateCharacterDto);
      return { message: "Character updated successfully", result };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error updating character:", error);
      throw new HttpException(
        "Failed to create user. Please try again later.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(AccessTokenGuard)
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    try {
      await this.characterService.remove(id);
      return { message: "Character deleted successfully", result: [] };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error deleting character:", error);
      throw new HttpException(
        "Failed to create user. Please try again later.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
