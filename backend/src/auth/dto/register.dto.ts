import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'Prénom' })
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
    example: 'Password123!', 
    description: 'Mot de passe (min 8 caractères)',
    minLength: 8 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: '/uploads/avatars/john-doe.jpg', 
    description: 'Photo de profil (optionnel)',
    required: false 
  })
  @IsString()
  @IsOptional()
  picture?: string;
}
