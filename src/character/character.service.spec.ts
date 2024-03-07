import { CharacterService } from "./character.service";
import { CharacterPrismaService } from "../../prisma/services/characterPrisma.service";
import { NotFoundException } from "@nestjs/common";
import { UpdateCharacterDto } from "./dto/update-character.dto";

describe("CharacterService", () => {
  let characterService: CharacterService;
  let prismaServiceMock: jest.Mocked<CharacterPrismaService>;

  beforeEach(() => {
    prismaServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<CharacterPrismaService>;

    characterService = new CharacterService(prismaServiceMock);
  });

  const existingCharacter = [
    {
      id: 1,
      name: "Test Character",
      species: "Human",
      status: "alive",
      type: "Test Type",
      gender: "male",
      imageId: 1,
      locationId: 2,
      originId: 2,
      episodes: [1, 2],
      createdAt: new Date(),
    },
  ];

  describe("create", () => {
    it("should create a character", async () => {
      const characterData = {
        name: "Test Character",
        status: "Alive",
        species: "Human",
        type: "Test Type",
        gender: "Male",
        origin: 1,
        location: 1,
        image: 2,
        episodes: [1, 2],
      };

      const expectedCharacter = {
        id: 1,
        name: "Test Character",
        status: "Alive",
        species: "Human",
        type: "Test Type",
        gender: "Male",
        originId: 1,
        locationId: 1,
        imageId: 2,
        episodes: [1, 2],
        createdAt: new Date(),
      };

      prismaServiceMock.create.mockResolvedValue(expectedCharacter);

      const result = await characterService.create(characterData);

      expect(prismaServiceMock.create).toHaveBeenCalledWith({
        data: {
          ...characterData,
          origin: { connect: { id: characterData.origin } },
          location: { connect: { id: characterData.location } },
          image: { connect: { id: characterData.image } },
          episodes: { connect: characterData.episodes.map((id) => ({ id })) },
        },
      });

      expect(result).toEqual(expectedCharacter);
    });
  });

  describe("findAll", () => {
    it("should return all characters with provided filters", async () => {
      const filters = {
        id: "characterId",
        name: "Test Character",
        species: "Human",
      };

      const characters = [
        {
          id: 1,
          name: "Test Character",
          species: "Human",
          status: "alive",
          type: "Test Type",
          gender: "male",
          imageId: 1,
          locationId: 2,
          originId: 2,
          episodes: [1, 2],
          createdAt: new Date(),
        },
      ];

      prismaServiceMock.findAll.mockResolvedValue(characters);

      const result = await characterService.findAll(filters);

      expect(prismaServiceMock.findAll).toHaveBeenCalledWith({
        where: {
          id: filters.id,
          name: { contains: filters.name },
          species: { contains: filters.species },
        },
        relationLoadStrategy: "join",
        include: {
          image: { select: { url: true } },
          location: { select: { url: true, id: true } },
          origin: { select: { url: true, id: true } },
          episodes: { select: { url: true } },
        },
      });

      expect(result).toEqual(characters);
    });

    it("should return empty array if no characters found with provided filters", async () => {
      const filters = {
        id: "nonexistentId",
        name: "Nonexistent Character",
        species: "Alien",
      };

      prismaServiceMock.findAll.mockResolvedValue([]);

      const result = await characterService.findAll(filters);

      expect(prismaServiceMock.findAll).toHaveBeenCalledWith({
        where: {
          id: filters.id,
          name: { contains: filters.name },
          species: { contains: filters.species },
        },
        relationLoadStrategy: "join",
        include: {
          image: { select: { url: true } },
          location: { select: { url: true, id: true } },
          origin: { select: { url: true, id: true } },
          episodes: { select: { url: true } },
        },
      });

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    const updateData = {
      id: 1,
      name: "Updated Character Name",
      status: "Updated Status",
      species: "Updated Species",
      type: "Updated Type",
      gender: "Updated Gender",
      originId: 1,
      locationId: 2,
      imageId: 3,
      episodes: [5, 1],
      createdAt: new Date(),
    };

    it("should update the character with provided data", async () => {
      prismaServiceMock.findAll.mockResolvedValue(existingCharacter);
      prismaServiceMock.update.mockResolvedValue(updateData);

      const result = await characterService.update(1, updateData);

      expect(prismaServiceMock.findAll).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaServiceMock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: updateData.name,
          status: updateData.status,
          species: updateData.species,
          type: updateData.type,
          gender: updateData.gender,
          originId: updateData.originId,
          locationId: updateData.locationId,
          imageId: updateData.imageId,
          episodes: { set: updateData.episodes.map((id) => ({ id })) },
        },
      });
      expect(result).toEqual({ id: 1, ...updateData });
    });

    it("should throw NotFoundException if character with provided ID does not exist", async () => {
      const characterId = "nonexistentId";

      prismaServiceMock.findAll.mockResolvedValue([]);

      await expect(
        characterService.update(characterId, updateData)
      ).rejects.toThrowError(NotFoundException);

      expect(prismaServiceMock.findAll).toHaveBeenCalledWith({
        where: { id: characterId },
      });
      expect(prismaServiceMock.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should remove the character with provided ID", async () => {
      const characterId = "characterId";
      prismaServiceMock.findAll.mockResolvedValue(existingCharacter);

      await characterService.remove(characterId);

      expect(prismaServiceMock.findAll).toHaveBeenCalledWith({
        where: { id: characterId },
      });
      expect(prismaServiceMock.delete).toHaveBeenCalledWith({
        where: { id: characterId },
      });
    });

    it("should throw NotFoundException if character with provided ID does not exist", async () => {
      const characterId = "nonexistentId";
      prismaServiceMock.findAll.mockResolvedValue([]);

      await expect(characterService.remove(characterId)).rejects.toThrowError(
        NotFoundException
      );

      expect(prismaServiceMock.findAll).toHaveBeenCalledWith({
        where: { id: characterId },
      });
      expect(prismaServiceMock.delete).not.toHaveBeenCalled();
    });
  });
});
