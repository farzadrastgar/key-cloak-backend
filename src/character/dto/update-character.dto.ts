export class UpdateCharacterDto {
  readonly name?: string;
  readonly status?: string;
  readonly species?: string;
  readonly type?: string;
  readonly gender?: string;
  readonly originId?: number;
  readonly locationId?: number;
  readonly imageId?: number;
  readonly episodes?: number[];
}
