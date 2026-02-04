import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID de la maison',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  homeId: number;

  @ApiProperty({
    description: 'Type de permission',
    example: 'admin',
    enum: ['admin', 'member', 'viewer'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}
