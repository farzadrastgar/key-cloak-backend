import { join } from "path";

import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { UploadModule } from "./upload/upload.module";
import { CharacterModule } from "./character/character.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      serveRoot: "/public",
      rootPath: join(__dirname, "..", "public"),
    }),
    AuthModule,
    UsersModule,
    CharacterModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
