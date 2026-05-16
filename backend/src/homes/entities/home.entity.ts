import { ApiProperty } from '@nestjs/swagger';

export class HomeEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Maison Familiale' })
  name: string;

  constructor(partial: Partial<HomeEntity>) {
    Object.assign(this, partial);
  }
}
