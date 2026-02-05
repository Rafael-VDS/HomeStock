import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'ID de la maison',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  homeId: number;

  @ApiProperty({
    description: 'ID de la sous-catégorie',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  subcategoryId: number;

  @ApiProperty({
    description: 'Nom du produit',
    example: 'Tagliatelles Barilla 500g',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'URL de l\'image du produit',
    example: 'https://example.com/product.jpg',
  })
  @IsString()
  @IsNotEmpty()
  picture: string;

  @ApiProperty({
    description: 'Masse du produit en grammes',
    example: 500,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  mass?: number;

  @ApiProperty({
    description: 'Volume du produit en millilitres',
    example: 1000,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  liquid?: number;
}
