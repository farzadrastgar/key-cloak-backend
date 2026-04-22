import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, {
    message: "Passwort muss mindestens 6 Zeichen lang sein",
  })
  newPassword: string;
}
