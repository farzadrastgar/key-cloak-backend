export class CreateCharacterDto {
  readonly name: string;
  readonly status: string;
  readonly species: string;
  readonly type: string;
  readonly gender: string;
  readonly origin: number;
  readonly location: number;
  readonly image: number;
  readonly episodes: number[];
}
