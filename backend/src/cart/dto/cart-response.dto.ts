import { ApiProperty } from '@nestjs/swagger';

export class CartProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 'Tagliatelles Barilla 500g' })
  productName: string;

  @ApiProperty({ example: 'product.jpg' })
  productPicture: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: false })
  checked: boolean;

  @ApiProperty({ example: 1 })
  subcategoryId: number;

  @ApiProperty({ example: 'Pâtes' })
  subcategoryName: string;
}

export class CartResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ type: [CartProductResponseDto] })
  products: CartProductResponseDto[];

  @ApiProperty({ example: 5 })
  totalItems: number;

  @ApiProperty({ example: 3 })
  uncheckedItems: number;
}
