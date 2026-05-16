import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ example: 'Tagliatelles Barilla 500g' })
  name: string;

  @ApiProperty({ example: 'https://example.com/product.jpg' })
  picture: string;

  @ApiProperty({ example: 500, nullable: true })
  mass: number | null;

  @ApiProperty({ example: null, nullable: true })
  liquid: number | null;
}
