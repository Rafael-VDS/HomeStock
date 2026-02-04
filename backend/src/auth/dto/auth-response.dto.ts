import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({
    example: {
      id: 1,
      firstname: 'Alice',
      lastname: 'Martin',
      mail: 'alice.martin@example.com',
      picture: '/uploads/avatars/alice-martin.jpg',
    },
  })
  user: {
    id: number;
    firstname: string;
    lastname: string;
    mail: string;
    picture?: string;
  };
}
