import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    UseGuards,
} from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { AcceptInvitationDto } from "./dto/accept-invitation.dto";
import { AccessTokenGuard } from "src/auth/guards/accessToken.guard";

@Controller("invitations")
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    // ✅ Invite users (protected)
    @UseGuards(AccessTokenGuard)
    @Post()
    async create(@Body() dto: CreateInvitationDto) {
        const result = await this.invitationsService.create(dto);

        return {
            message: "Invitations processed successfully",
            data: result,
        };
    }

    // ✅ Validate token (public)
    @Get("validate")
    async validate(@Query("token") token: string) {
        const invitation = await this.invitationsService.findByToken(token);

        return {
            message: "Invitation valid",
            data: invitation,
        };
    }

    // ✅ Accept invitation (public)
    @Post("accept")
    async accept(@Body() dto: AcceptInvitationDto) {
        const result = await this.invitationsService.accept(dto);

        return result;
    }
}