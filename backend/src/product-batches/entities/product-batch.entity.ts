import { ApiProperty } from '@nestjs/swagger';

export class ProductBatch {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ example: '2026-12-31', nullable: true })
  expirationDate: Date | null;
}
