import { IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'ID de la maison',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  homeId!: number;

  @ApiProperty({
    description: 'Nom de la catégorie',
    example: 'Fruits et Légumes',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'URL de l\'image de la catégorie',
    example: 'https://example.com/fruits.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  picture?: string;
}
