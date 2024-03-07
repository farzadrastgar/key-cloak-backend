import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { CharacterController } from "./character.controller";
import { CharacterService } from "./character.service";

describe("CharacterController (e2e)", () => {
  let app: INestApplication;
  let characterService: jest.Mocked<CharacterService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CharacterController],
      providers: [
        {
          provide: CharacterService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          } as Partial<CharacterService>,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    characterService = moduleFixture.get(CharacterService);
  });

  let date = new Date();

  const mockedResult = {
    id: 2,
    name: "Test Character",
    status: "Alive",
    species: "Human",
    type: "Test Type",
    gender: "Male",
    originId: 1,
    locationId: 2,
    imageId: 2,
    createdAt: date,
  };

  it("/character (POST) - success", async () => {
    const createCharacterDto = {
      name: "Test Character",
      status: "Alive",
      species: "Human",
      type: "Test Type",
      gender: "Male",
      origin: 1,
      location: 2,
      image: 2,
      episodes: [1, 2],
    };

    const expectedResult = {
      message: "Character created successfully",
      result: {
        id: 2,
        name: "Test Character",
        status: "Alive",
        species: "Human",
        type: "Test Type",
        gender: "Male",
        originId: 1,
        locationId: 2,
        imageId: 2,
        createdAt: date.toISOString(),
      },
    };

    characterService.create.mockResolvedValue(mockedResult);

    return request(app.getHttpServer())
      .post("/character")
      .send(createCharacterDto)
      .expect(HttpStatus.CREATED)
      .expect(expectedResult);
  });

  it("/character (POST) - error", async () => {
    const createCharacterDto = {
      species: "Human",
      type: "Test Type",
      gender: "Male",
      originId: "invalid",
    };

    characterService.create.mockRejectedValue(
      new Error("Failed to create character")
    );

    return request(app.getHttpServer())
      .post("/character")
      .send(createCharacterDto)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect({
        message: "Failed to create character. Please try again later.",
        statusCode: 500,
      });
  });

  it("/character (GET) - success", async () => {
    const query = {
      id: 1,
      name: "Test Character",
      species: "Human",
    };

    const expectedResult = [
      {
        id: 2,
        name: "Test Character",
        status: "Alive",
        species: "Human",
        type: "Test Type",
        gender: "Male",
        originId: 1,
        locationId: 2,
        imageId: 2,
        createdAt: date.toISOString(),
      },
    ];

    characterService.findAll.mockResolvedValue([mockedResult]);

    return request(app.getHttpServer())
      .get("/character")
      .query(query)
      .expect(HttpStatus.OK)
      .expect({
        message: "Query executed successfully",
        result: expectedResult,
      });
  });

  it("/character (GET) - error", async () => {
    const query = {
      id: 1,
    };

    characterService.findAll.mockRejectedValue(
      new Error("Failed to execute query")
    );

    return request(app.getHttpServer())
      .get("/character")
      .query(query)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect({
        message: "Failed to fetch character. Please try again later.",
        statusCode: 500,
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
