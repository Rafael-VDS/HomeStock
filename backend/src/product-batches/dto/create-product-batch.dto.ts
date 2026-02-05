import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateProductBatchDto {
  @ApiProperty({
    description: 'ID du produit',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    description: 'ID de la maison',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  homeId: number;

  @ApiProperty({
    description: 'Date d\'expiration du produit (optionnelle)',
    example: '2026-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;
}
