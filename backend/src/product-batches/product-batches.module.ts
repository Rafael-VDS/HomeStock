import { Module } from '@nestjs/common';
import { ProductBatchesService } from './product-batches.service';
import { ProductBatchesController } from './product-batches.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProductBatchesController],
  providers: [ProductBatchesService, PrismaService],
  exports: [ProductBatchesService],
})
export class ProductBatchesModule {}
