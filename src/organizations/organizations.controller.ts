import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { AccessTokenGuard } from "src/auth/guards/accessToken.guard";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";

@UseGuards(AccessTokenGuard)
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  // Create organization
  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    const organization = await this.organizationsService.create(dto);

    return {
      message: "Organization created successfully",
      data: organization,
    };
  }

  // Get all organizations
  @Get()
  async findAll(@Query("search") search?: string) {
    const organizations =
      (await this.organizationsService.findAll(search)) || [];

    return {
      message: "Organizations fetched successfully",
      data: organizations,
    };
  }

  // Get one organization
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const organization = await this.organizationsService.findOne(id);

    return {
      message: "Organization found successfully",
      data: organization,
    };
  }

  // Update organization
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateOrganizationDto) {
    const organization = await this.organizationsService.update(id, dto);

    return {
      message: "Organization updated successfully",
      data: organization,
    };
  }

  // Set parent organization (hierarchy support)
  @Patch(":id/parent")
  async setParent(
    @Param("id") id: string,
    @Body("parentId") parentId: string | null,
  ) {
    const organization = await this.organizationsService.setParent(
      id,
      parentId,
    );

    return {
      message: "Organization hierarchy updated successfully",
      data: organization,
    };
  }

  @Post(":id/users/:userId")
  async assignUser(
    @Param("id") orgId: string,
    @Param("userId") userId: string,
  ) {
    const membership = await this.organizationsService.assignUser(orgId, userId);

    return {
      message: "User assigned to organization successfully",
      data: membership,
    };
  }

  @Delete(":id/users/:userId")
  async unassignUser(
    @Param("id") orgId: string,
    @Param("userId") userId: string,
  ) {
    const result = await this.organizationsService.unassignUserFromOrg(
      orgId,
      userId,
    );

    return {
      message: result.message,
      data: {},
    };
  }


  // Delete organization
  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.organizationsService.remove(id);

    return {
      message: "Organization deleted successfully",
      data: {},
    };
  }
}
