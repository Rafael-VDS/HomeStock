import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHomeDto {
  @ApiProperty({
    description: 'Nom de la maison',
    example: 'Maison Familiale',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
