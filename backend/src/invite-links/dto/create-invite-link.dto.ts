import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsIn } from 'class-validator';

export class CreateInviteLinkDto {
  @ApiProperty({ 
    description: 'ID du foyer pour lequel créer le lien d\'invitation',
    example: 1 
  })
  @IsInt()
  homeId: number;

  @ApiProperty({
    description: 'Type de permission accordée',
    example: 'read-write',
    enum: ['read', 'read-write']
  })
  @IsIn(['read', 'read-write'])
  permissionType: 'read' | 'read-write';
}
