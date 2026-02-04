import { ApiProperty } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ example: 'Fruits et Légumes' })
  name: string;

  @ApiProperty({ example: 'https://example.com/fruits.jpg' })
  picture: string;

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}
