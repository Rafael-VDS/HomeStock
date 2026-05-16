import { ApiProperty } from '@nestjs/swagger';

export class InviteLinkEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ example: 'abc123xyz' })
  link: string;

  @ApiProperty({ example: 'read-write', enum: ['read', 'read-write'] })
  permissionType: string;

  @ApiProperty({ example: '2026-02-13T00:00:00.000Z' })
  expirationDate: Date;

  @ApiProperty({ example: '2026-02-06T10:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<InviteLinkEntity>) {
    Object.assign(this, partial);
  }
}
