import { IsArray, IsUUID } from "class-validator";

export class AssignOrganizationsDto {
  @IsArray()
  @IsUUID("all", { each: true })
  organizationIds: string[];
}
