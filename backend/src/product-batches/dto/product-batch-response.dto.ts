import { ApiProperty } from '@nestjs/swagger';

export class ProductBatchResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 1 })
  homeId: number;

  @ApiProperty({ example: '2026-12-31', nullable: true })
  expirationDate: string | null;

  @ApiProperty({
    description: 'Informations sur le produit associé',
  })
  product?: {
    id: number;
    name: string;
    picture: string;
  };

  @ApiProperty({
    description: 'Nombre de jours avant expiration',
    example: 30,
    nullable: true,
  })
  daysUntilExpiration?: number | null;

  @ApiProperty({
    description: 'Indique si le produit est expiré',
    example: false,
  })
  isExpired?: boolean;

  @ApiProperty({
    description: 'Indique si le produit expire bientôt (< 7 jours)',
    example: false,
  })
  expiringSoon?: boolean;
}
