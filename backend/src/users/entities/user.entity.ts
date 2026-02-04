import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  firstname: string;

  @ApiProperty({ example: 'Doe' })
  lastname: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  mail: string;

  @ApiProperty({ example: '/uploads/avatars/john-doe.jpg', required: false })
  picture?: string;

  // On ne retourne JAMAIS le password dans les responses
}
