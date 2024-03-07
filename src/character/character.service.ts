import { Injectable, NotFoundException } from "@nestjs/common";
import { CharacterPrismaService } from "../../prisma/services/characterPrisma.service";
import { UpdateCharacterDto } from "./dto/update-character.dto";

@Injectable()
export class CharacterService {
  constructor(private readonly prisma: CharacterPrismaService) {}

  create({
    name,
    status,
    species,
    type,
    gender,
    origin,
    location,
    image,
    episodes,
  }) {
    let character = {
      data: {
        name,
        status,
        species,
        type,
        gender,
        origin: {
          connect: { id: origin },
        },
        location: {
          connect: { id: location },
        },
        image: {
          connect: { id: image },
        },
        episodes: {
          connect: episodes.map((id) => ({ id })),
        },
      },
    };
    return this.prisma.create(character);
  }

  findAll({ id, name, species }) {
    let query = {
      where: {
        id,
        name: {
          contains: name,
        },
        species: {
          contains: species,
        },
      },
      relationLoadStrategy: "join",
      include: {
        image: {
          select: {
            url: true,
          },
        },
        location: {
          select: {
            url: true,
            id: true,
          },
        },
        origin: {
          select: {
            url: true,
            id: true,
          },
        },
        episodes: {
          select: {
            url: true,
          },
        },
      },
    };
    return this.prisma.findAll(query);
  }

  async update(
    id,
    {
      name,
      status,
      species,
      type,
      gender,
      originId,
      locationId,
      imageId,
      episodes,
    }: UpdateCharacterDto
  ) {
    const existingCharacter = await this.prisma.findAll({ where: { id } });
    if (existingCharacter.length === 0) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    // Perform the update operation based on the provided data
    return this.prisma.update({
      where: { id },
      data: {
        name,
        status,
        species,
        type,
        gender,
        originId,
        locationId,
        imageId,
        episodes: { set: episodes.map((id) => ({ id })) },
      },
    });
  }

  async remove(id) {
    const existingCharacter = await this.prisma.findAll({ where: { id } });
    if (existingCharacter.length === 0) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    return this.prisma.delete({
      where: { id },
    });
  }
}
