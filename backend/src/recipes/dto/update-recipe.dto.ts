import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsArray } from 'class-validator';

export class UpdateRecipeDto {
  @ApiProperty({
    description: 'Nom de la recette',
    example: 'Pâtes à la Carbonara',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description de la recette',
    example: 'Faire cuire les pâtes...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Image de la recette',
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
