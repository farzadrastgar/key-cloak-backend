import { IsArray, IsEmail, IsString, ArrayNotEmpty } from "class-validator";

export class CreateInvitationDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsEmail({}, { each: true })
    emails: string[];

    @IsString()
    organizationId: string;
}