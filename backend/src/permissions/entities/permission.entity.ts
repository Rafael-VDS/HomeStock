import { ApiProperty } from '@nestjs/swagger';

export class PermissionEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ example: 'admin' })
  type: string;

  constructor(partial: Partial<PermissionEntity>) {
    Object.assign(this, partial);
  }
}
