import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { HomesService } from './homes.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { HomeEntity } from './entities/home.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('homes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('homes')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle maison' })
  @ApiResponse({
    status: 201,
    description: 'Maison créée avec succès',
    type: HomeEntity,
  })
  create(@Body() createHomeDto: CreateHomeDto) {
    return this.homesService.create(createHomeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les maisons' })
  @ApiResponse({
    status: 200,
    description: 'Liste des maisons',
    type: [HomeEntity],
  })
  findAll() {
    return this.homesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une maison par ID' })
  @ApiParam({ name: 'id', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Maison trouvée',
    type: HomeEntity,
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.homesService.findOne(id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Récupérer les utilisateurs d\'une maison' })
  @ApiParam({ name: 'id', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs avec leurs permissions',
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  getHomeUsers(@Param('id', ParseIntPipe) id: number) {
    return this.homesService.getHomeUsers(id);
  }

  @Get(':id/categories')
  @ApiOperation({ summary: 'Récupérer les catégories d\'une maison' })
  @ApiParam({ name: 'id', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories',
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  getHomeCategories(@Param('id', ParseIntPipe) id: number) {
    return this.homesService.getHomeCategories(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Récupérer les produits d\'une maison' })
  @ApiParam({ name: 'id', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits avec leurs catégories',
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  getHomeProducts(@Param('id', ParseIntPipe) id: number) {
    return this.homesService.getHomeProducts(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une maison' })
  @ApiParam({ name: 'id', description: 'ID de la maison' })
  @ApiResponse({
    status: 200,
    description: 'Maison modifiée',
    type: HomeEntity,
  })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHomeDto: UpdateHomeDto,
  ) {
    return this.homesService.update(id, updateHomeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une maison' })
  @ApiParam({ name: 'id', description: 'ID de la maison' })
  @ApiResponse({ status: 200, description: 'Maison supprimée' })
  @ApiResponse({ status: 404, description: 'Maison introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.homesService.remove(id);
  }
}
