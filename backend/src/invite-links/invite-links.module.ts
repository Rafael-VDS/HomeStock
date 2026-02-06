import { Module } from '@nestjs/common';
import { InviteLinksController } from './invite-links.controller';
import { InviteLinksService } from './invite-links.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [InviteLinksController],
  providers: [InviteLinksService, PrismaService],
  exports: [InviteLinksService],
})
export class InviteLinksModule {}
