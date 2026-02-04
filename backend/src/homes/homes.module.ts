import { Module } from '@nestjs/common';
import { HomesService } from './homes.service';
import { HomesController } from './homes.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HomesController],
  providers: [HomesService, PrismaService],
  exports: [HomesService],
})
export class HomesModule {}
