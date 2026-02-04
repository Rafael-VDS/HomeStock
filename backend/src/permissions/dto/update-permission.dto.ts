import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePermissionDto extends PartialType(
  OmitType(CreatePermissionDto, ['userId', 'homeId'] as const),
) {}
