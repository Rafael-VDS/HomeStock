import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'Prénom de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ example: 'Doe', description: 'Nom de famille' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email unique' })
  @IsEmail()
  @IsNotEmpty()
  mail: string;

  @ApiProperty({ 
    example: 'SecurePass123!', 
    description: 'Mot de passe (min 8 caractères)',
    minLength: 8 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: '/uploads/avatars/john-doe.jpg', 
    description: 'Chemin de la photo de profil (stockée localement)',
    required: false 
  })
  @IsString()
  @IsOptional()
  picture?: string;
}
