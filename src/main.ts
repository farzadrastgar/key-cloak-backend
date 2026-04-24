import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>("FRONTEND_URL");

  console.log(frontendUrl)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = configService.get<number>("APP_PORT") || 3030;

  await app.listen(port);
}
bootstrap();
