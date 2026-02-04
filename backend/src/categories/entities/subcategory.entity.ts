import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  categoryId: number;

  @ApiProperty({ example: 'Pommes' })
  name: string;

  constructor(partial: Partial<SubcategoryEntity>) {
    Object.assign(this, partial);
  }
}
