import { IsInt, IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType, VALID_PERMISSION_TYPES } from '../../common/constants/permission-types';

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
    example: PermissionType.READ_WRITE,
    enum: PermissionType,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(VALID_PERMISSION_TYPES, {
    message: `Le type de permission doit être l'un des suivants: ${VALID_PERMISSION_TYPES.join(', ')}`,
  })
  type: PermissionType;
}
