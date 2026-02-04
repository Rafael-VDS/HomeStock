import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  homeId: number;

  @ApiProperty()
  picture: string;

  @ApiPropertyOptional()
  mass?: number | null;

  @ApiPropertyOptional()
  liquid?: number | null;
}
