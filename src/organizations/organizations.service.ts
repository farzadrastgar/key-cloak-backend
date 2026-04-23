import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { Organization } from "@prisma/client";

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) { }

  // ✅ Get one organization by ID
  async findOne(id: string): Promise<Organization> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return organization;
  }

  // ✅ Create organization
  async create(data: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.prisma.organization.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existing) {
      throw new ConflictException("Organization name already exists");
    }

    // validate parent if provided
    if (data.parentId) {
      const parent = await this.prisma.organization.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new BadRequestException("Parent organization not found");
      }
    }

    return this.prisma.organization.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
      },
    });
  }

  // ✅ List organizations
  async findAll(search?: string): Promise<Organization[]> {
    return this.prisma.organization.findMany({
      where: search
        ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
        : {},
      include: {
        parent: true,
        children: true,
        memberships: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ✅ Update organization
  async update(id: string, data: UpdateOrganizationDto): Promise<Organization> {
    await this.findOne(id);

    if (data.parentId) {
      const parent = await this.prisma.organization.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new BadRequestException("Parent organization not found");
      }

      if (data.parentId === id) {
        throw new BadRequestException("Organization cannot be its own parent");
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
      },
    });
  }

  // ✅ Delete organization
  async remove(id: string) {
    await this.findOne(id);

    const hasChildren = await this.prisma.organization.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      throw new BadRequestException(
        "Cannot delete organization with child organizations",
      );
    }

    return this.prisma.$transaction([
      this.prisma.membership.deleteMany({
        where: { organizationId: id },
      }),
      this.prisma.invitation.deleteMany({
        where: { organizationId: id },
      }),
      this.prisma.organization.delete({
        where: { id },
      }),
    ]);
  }

  // ✅ Set parent organization (hierarchy update)
  async setParent(id: string, parentId: string | null): Promise<Organization> {
    await this.findOne(id);

    if (parentId) {
      const parent = await this.prisma.organization.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        throw new BadRequestException("Parent organization not found");
      }

      if (parentId === id) {
        throw new BadRequestException("Organization cannot be its own parent");
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: { parentId },
    });
  }

  async assignUser(orgId: string, userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }

    const [organization, user] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: orgId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
    ]);

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      update: {},
      create: {
        userId,
        organizationId: orgId,
      },
    });

    // return updated user (or membership if you prefer)
    return this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        organization: true,
      },
    });
  }

  async unassignUserFromOrg(orgId: string, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.membership.deleteMany({
      where: {
        organizationId: orgId,
        userId: userId,
      },
    });

    return { message: "User unassigned from organization" };
  }
}
