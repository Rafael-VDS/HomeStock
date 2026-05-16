import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'ID de la catégorie parente',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    description: 'Nom de la sous-catégorie',
    example: 'Pommes',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
