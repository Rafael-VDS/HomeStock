import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Nom du produit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'ID de la maison' })
  @IsInt()
  @Min(1)
  homeId: number;

  @ApiProperty({ description: 'URL de l\'image du produit' })
  @IsString()
  @IsNotEmpty()
  picture: string;

  @ApiPropertyOptional({ description: 'Masse en grammes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  mass?: number;

  @ApiPropertyOptional({ description: 'Volume en millilitres' })
  @IsOptional()
  @IsInt()
  @Min(0)
  liquid?: number;
}
