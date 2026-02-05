import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Pâtes' })
  name: string;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 'Féculents' })
  categoryName: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ example: 1 })
  subcategoryId: number;

  @ApiProperty({ example: 'Tagliatelles Barilla 500g' })
  name: string;

  @ApiProperty({ example: 'https://example.com/product.jpg' })
  picture: string;

  @ApiProperty({ example: 500, nullable: true })
  mass: number | null;

  @ApiProperty({ example: null, nullable: true })
  liquid: number | null;

  @ApiProperty({
    description: 'Nombre d\'unités en stock (calculé dynamiquement)',
    example: 3,
  })
  stockCount: number;

  @ApiProperty({
    description: 'Indique si le produit doit être acheté (stock < 2)',
    example: false,
  })
  needsToBuy: boolean;

  @ApiProperty({
    description: 'Sous-catégorie à laquelle appartient le produit',
    type: SubcategoryResponseDto,
  })
  subcategory: SubcategoryResponseDto;
}
