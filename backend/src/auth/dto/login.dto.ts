import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice.martin@example.com', description: 'Email de connexion' })
  @IsEmail()
  @IsNotEmpty()
  mail: string;

  @ApiProperty({ example: 'Password123', description: 'Mot de passe' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
