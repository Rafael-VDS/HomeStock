import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCartProductDto {
  @ApiProperty({ 
    description: 'Nouvelle quantité',
    example: 3,
    required: false
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ 
    description: 'Produit coché (acheté)',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  checked?: boolean;
}
