import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter un utilisateur à une maison' })
  @ApiResponse({
    status: 201,
    description: 'Permission créée avec succès',
    type: PermissionEntity,
  })
  @ApiResponse({ status: 404, description: 'Utilisateur ou maison introuvable' })
  @ApiResponse({ status: 409, description: 'Permission déjà existante' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get('home/:homeId')
  @ApiOperation({ summary: 'Récupérer les permissions d\'une maison' })
  @ApiParam({ name: 'homeId', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des permissions avec les utilisateurs',
    type: [PermissionEntity],
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  findByHome(@Param('homeId', ParseIntPipe) homeId: number) {
    return this.permissionsService.findByHome(homeId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les permissions d\'un utilisateur' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des permissions avec les maisons',
    type: [PermissionEntity],
  })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une permission par ID' })
  @ApiParam({ name: 'id', description: 'ID de la permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission trouvée',
    type: PermissionEntity,
  })
  @ApiResponse({ status: 404, description: 'Permission introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier le type de permission' })
  @ApiParam({ name: 'id', description: 'ID de la permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission modifiée',
    type: PermissionEntity,
  })
  @ApiResponse({ status: 404, description: 'Permission introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retirer un utilisateur d\'une maison' })
  @ApiParam({ name: 'id', description: 'ID de la permission' })
  @ApiResponse({ status: 200, description: 'Permission supprimée' })
  @ApiResponse({ status: 404, description: 'Permission introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);
  }
}
