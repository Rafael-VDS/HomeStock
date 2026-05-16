import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { InviteLinksService } from './invite-links.service';
import { CreateInviteLinkDto } from './dto/create-invite-link.dto';
import { UseInviteLinkDto } from './dto/use-invite-link.dto';
import { InviteLinkEntity } from './entities/invite-link.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('invite-links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invite-links')
export class InviteLinksController {
  constructor(private readonly inviteLinksService: InviteLinksService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau lien d\'invitation' })
  @ApiResponse({
    status: 201,
    description: 'Lien d\'invitation créé avec succès',
    type: InviteLinkEntity,
  })
  create(@Body() createInviteLinkDto: CreateInviteLinkDto) {
    return this.inviteLinksService.create(createInviteLinkDto);
  }

  @Get('home/:homeId')
  @ApiOperation({ summary: 'Récupérer tous les liens actifs d\'un foyer' })
  @ApiParam({ name: 'homeId', description: 'ID du foyer' })
  @ApiResponse({
    status: 200,
    description: 'Liste des liens d\'invitation actifs',
    type: [InviteLinkEntity],
  })
  findByHome(@Param('homeId', ParseIntPipe) homeId: number) {
    return this.inviteLinksService.findByHome(homeId);
  }

  @Post('use')
  @ApiOperation({ summary: 'Utiliser un lien d\'invitation pour rejoindre un foyer' })
  @ApiResponse({
    status: 200,
    description: 'Invitation acceptée avec succès',
  })
  useInviteLink(@Body() useInviteLinkDto: UseInviteLinkDto) {
    return this.inviteLinksService.useInviteLink(useInviteLinkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un lien d\'invitation' })
  @ApiParam({ name: 'id', description: 'ID du lien d\'invitation' })
  @ApiResponse({
    status: 204,
    description: 'Lien d\'invitation supprimé avec succès',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inviteLinksService.remove(id);
  }

  @Delete('clean/expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nettoyer tous les liens expirés' })
  @ApiResponse({
    status: 200,
    description: 'Nombre de liens supprimés',
  })
  cleanExpired() {
    return this.inviteLinksService.cleanExpiredLinks();
  }
}
