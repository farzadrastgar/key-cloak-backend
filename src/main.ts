import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "prisma/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("APP_PORT") || 3000;
  const prismaService = app.get(PrismaService);

  await app.listen(port);
}
bootstrap();
