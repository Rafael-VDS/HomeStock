import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHomeDto {
  @ApiProperty({
    description: 'Nom de la maison',
    example: 'Maison Familiale',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur qui crée la maison (sera owner)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
