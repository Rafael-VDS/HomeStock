import { ApiProperty } from '@nestjs/swagger';

export class RecipeProductResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  recipeId!: number;

  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: 'Tomates' })
  productName!: string;

  @ApiProperty({ example: 2, nullable: true })
  quantityNeeded!: number | null;

  @ApiProperty({ example: true })
  multipliable!: boolean;
}

export class RecipeStepResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  recipeId!: number;

  @ApiProperty({ example: 1 })
  stepNumber!: number;

  @ApiProperty({ example: 'Faire bouillir de l\'eau...' })
  content!: string;
}

export class RecipeTagResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Végétarien' })
  name!: string;
}

export class RecipeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  homeId!: number;

  @ApiProperty({ example: 'Pâtes à la Carbonara' })
  name!: string;

  @ApiProperty({ example: '/uploads/recipes/random.png' })
  picture!: string;

  @ApiProperty({ example: 'Faire cuire les pâtes...' })
  description!: string;

  @ApiProperty({
    description: 'Liste des ingrédients',
    type: [RecipeProductResponseDto],
  })
  ingredients!: RecipeProductResponseDto[];

  @ApiProperty({
    description: 'Liste des étapes',
    type: [RecipeStepResponseDto],
  })
  steps!: RecipeStepResponseDto[];

  @ApiProperty({
    description: 'Tags de la recette',
    type: [RecipeTagResponseDto],
  })
  tags!: RecipeTagResponseDto[];

  @ApiProperty({ example: '2026-01-15T10:30:00Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:30:00Z' })
  updatedAt!: string;
}
