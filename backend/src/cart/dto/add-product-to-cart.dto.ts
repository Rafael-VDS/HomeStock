import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class AddProductToCartDto {
  @ApiProperty({ 
    description: 'ID du produit à ajouter',
    example: 1 
  })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ 
    description: 'Quantité à ajouter',
    example: 2,
    default: 1,
    required: false
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;
}
