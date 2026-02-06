import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length } from 'class-validator';

export class UseInviteLinkDto {
  @ApiProperty({ 
    description: 'Code d\'invitation',
    example: 'abc123xyz',
    minLength: 1,
    maxLength: 25
  })
  @IsString()
  @Length(1, 25)
  link: string;

  @ApiProperty({ 
    description: 'ID de l\'utilisateur qui utilise le lien',
    example: 2
  })
  @IsInt()
  userId: number;
}
