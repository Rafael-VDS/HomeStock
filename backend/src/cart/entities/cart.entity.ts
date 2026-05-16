import { ApiProperty } from '@nestjs/swagger';

export class CartEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  constructor(partial: Partial<CartEntity>) {
    Object.assign(this, partial);
  }
}
