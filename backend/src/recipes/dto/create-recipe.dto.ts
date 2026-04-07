import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeProductDto {
  @ApiProperty({
    description: 'ID du produit',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  productId!: number;

  @ApiProperty({
    description: 'Quantité nécessaire',
    example: 2,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantityNeeded?: number;

  @ApiProperty({
    description: 'Si l\'ingrédient peut être multiplié par le nombre de personnes',
    example: true,
  })
  @IsNotEmpty()
  multipliable!: boolean;
}

export class CreateRecipeStepDto {
  @ApiProperty({
    description: 'Numéro de l\'étape',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  stepNumber!: number;

  @ApiProperty({
    description: 'Contenu de l\'étape',
    example: 'Faire bouillir de l\'eau...',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class CreateRecipeDto {
  @ApiProperty({
    description: 'ID de la maison',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  homeId!: number;

  @ApiProperty({
    description: 'Nom de la recette',
    example: 'Pâtes à la Carbonara',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Description de la recette (comment faire)',
    example: 'Faire cuire les pâtes...',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Image de la recette (sera remplie par le contrôleur)',
    example: '/uploads/recipes/random.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty({
    description: 'Tags de la recette (IDs)',
    example: [1, 2, 3],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];
}

