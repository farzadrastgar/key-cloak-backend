import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { AcceptInvitationDto } from "./dto/accept-invitation.dto";
import { randomBytes } from "crypto";
import * as bcrypt from "bcrypt";

@Injectable()
export class InvitationsService {
    constructor(private prisma: PrismaService) { }

    // ✅ Create invitations
    async create(dto: CreateInvitationDto) {
        const { emails, organizationId } = dto;

        // check organization exists
        const org = await this.prisma.organization.findUnique({
            where: { id: organizationId },
        });

        if (!org) {
            throw new NotFoundException("Organization not found");
        }

        const invited: string[] = [];
        const assigned: string[] = [];
        const skipped: any[] = [];

        for (const email of emails) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });

            // ✅ CASE 1: existing user
            if (existingUser) {
                const membership = await this.prisma.membership.findUnique({
                    where: {
                        userId_organizationId: {
                            userId: existingUser.id,
                            organizationId,
                        },
                    },
                });

                if (membership) {
                    skipped.push({
                        email,
                        reason: "Already in organization",
                    });
                    continue;
                }

            }

            // ✅ CASE 2: new user → create invitation
            const token = randomBytes(32).toString("hex");

            await this.prisma.invitation.create({
                data: {
                    email,
                    organizationId,
                    token,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
                },
            });

            invited.push(email);
        }

        return {
            invited,
            skipped,
        };
    }

    // ✅ Get invitation by token
    async findByToken(token: string) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
            include: {
                organization: true,
            },
        });

        if (!invitation) {
            throw new NotFoundException("Invalid invitation token");
        }

        if (invitation.status !== "PENDING") {
            throw new BadRequestException("Invitation already used or invalid");
        }

        if (invitation.expiresAt < new Date()) {
            throw new BadRequestException("Invitation expired");
        }

        return invitation;
    }

    // ✅ Accept invitation
    async accept(dto: AcceptInvitationDto) {
        const { token, password } = dto;

        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
        });

        if (!invitation) {
            throw new NotFoundException("Invalid invitation token");
        }

        if (invitation.status !== "PENDING") {
            throw new BadRequestException("Invitation already used");
        }

        if (invitation.expiresAt < new Date()) {
            throw new BadRequestException("Invitation expired");
        }

        // check if user already exists (edge case)
        let user = await this.prisma.user.findUnique({
            where: { email: invitation.email },
        });

        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);

            user = await this.prisma.user.create({
                data: {
                    email: invitation.email,
                    username: invitation.email,
                    password: hashedPassword,
                    isVerified: true,
                },
            });
        }

        // assign to organization
        await this.prisma.membership.create({
            data: {
                userId: user.id,
                organizationId: invitation.organizationId,
            },
        });

        // mark invitation as accepted
        await this.prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: "ACCEPTED" },
        });

        return {
            message: "Invitation accepted successfully",
        };
    }
}